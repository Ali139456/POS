"use client";

import { useUiStore } from "@/lib/store/ui-store";
import { useAppStore } from "@/lib/store/app-store";
import { Dialog } from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function NotificationPanel() {
  const open = useUiStore((s) => s.notificationsOpen);
  const setOpen = useUiStore((s) => s.setNotificationsOpen);
  const notifications = useAppStore((s) => s.notifications);
  const mark = useAppStore((s) => s.markNotificationRead);
  const markAll = useAppStore((s) => s.markAllNotificationsRead);

  return (
    <Dialog open={open} onClose={() => setOpen(false)} title="Notifications" description="Stock, credit, and register alerts">
      <div className="mb-3 flex justify-end">
        <Button variant="ghost" size="sm" onClick={markAll}>
          Mark all read
        </Button>
      </div>
      <div className="space-y-2">
        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => mark(n.id)}
            className={`w-full rounded-xl border px-3 py-3 text-left ${n.read ? "border-border bg-card" : "border-primary/20 bg-accent"}`}
          >
            <p className="text-sm font-medium">{n.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{n.message}</p>
            <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.date)}</p>
          </button>
        ))}
      </div>
    </Dialog>
  );
}
