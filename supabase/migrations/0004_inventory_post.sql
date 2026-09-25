-- Stock changes only through this function. Direct balance updates are revoked from clients.

create or replace function post_inventory_movement(
  p_organization_id uuid,
  p_location_id uuid,
  p_variant_id uuid,
  p_batch_code text,
  p_movement_type text,
  p_quantity numeric,
  p_reference_type text,
  p_reference_id uuid,
  p_reason text,
  p_actor_id uuid
) returns inventory_transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_before numeric(18,3);
  v_change numeric(18,3);
  v_after numeric(18,3);
  v_allow_negative boolean;
  v_row inventory_transactions;
begin
  if p_quantity <= 0 then
    raise exception 'Movement quantity must be positive';
  end if;

  if auth.uid() is not null and p_organization_id not in (select member_organization_ids()) then
    raise exception 'Organization access denied';
  end if;

  select allow_negative_stock into v_allow_negative
  from organizations where id = p_organization_id;

  insert into inventory_balances (organization_id, location_id, variant_id, batch_code, quantity)
  values (p_organization_id, p_location_id, p_variant_id, coalesce(p_batch_code, ''), 0)
  on conflict (location_id, variant_id, batch_code) do nothing;

  select quantity into v_before
  from inventory_balances
  where location_id = p_location_id
    and variant_id = p_variant_id
    and batch_code = coalesce(p_batch_code, '')
  for update;

  if p_movement_type in ('SALE', 'PURCHASE_RETURN', 'TRANSFER_OUT', 'ADJUSTMENT_OUT', 'DAMAGE', 'EXPIRY') then
    v_change := -p_quantity;
  else
    v_change := p_quantity;
  end if;

  v_after := v_before + v_change;
  if v_after < 0 and not coalesce(v_allow_negative, false) then
    raise exception 'Negative stock is not allowed';
  end if;

  update inventory_balances
  set quantity = v_after
  where location_id = p_location_id
    and variant_id = p_variant_id
    and batch_code = coalesce(p_batch_code, '');

  insert into inventory_transactions (
    organization_id, location_id, variant_id, batch_code, movement_type,
    quantity_before, quantity_change, quantity_after,
    reference_type, reference_id, reason, actor_id
  ) values (
    p_organization_id, p_location_id, p_variant_id, coalesce(p_batch_code, ''), p_movement_type,
    v_before, v_change, v_after,
    p_reference_type, p_reference_id, p_reason, p_actor_id
  ) returning * into v_row;

  return v_row;
end;
$$;

revoke all on function post_inventory_movement(
  uuid, uuid, uuid, text, text, numeric, text, uuid, text, uuid
) from public, anon;

grant execute on function post_inventory_movement(
  uuid, uuid, uuid, text, text, numeric, text, uuid, text, uuid
) to authenticated, service_role;

revoke update, delete on inventory_balances from authenticated;
