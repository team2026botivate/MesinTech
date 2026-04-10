'use client';

import { useData } from '@/lib/data-context';
import { Bell, CheckCircle2, Trash2, ExternalLink, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function NotificationHeader() {
  const { notifications, markNotificationAsRead, deleteNotification, isLoaded } = useData();

  if (!isLoaded) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const sortedNotifications = [...notifications]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const typeIcons = {
    payment_due: '⏰',
    payment_overdue: '⚠️',
    payment_received: '✅',
    return_pending: '↩️',
    expense_pending: '💰',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative group rounded-full h-9 w-9">
          <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm animate-in zoom-in duration-300">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0 overflow-hidden shadow-2xl border-primary/10">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
          <h2 className="text-sm font-bold tracking-tight">Recent Notifications</h2>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-[10px] uppercase font-bold text-primary hover:text-primary/80 px-2"
              onClick={(e) => {
                e.preventDefault();
                notifications.forEach(n => { if(!n.read) markNotificationAsRead(n.id); });
              }}
            >
              Clear All Unread
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-[350px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="p-3 bg-muted rounded-full mb-3">
                <Inbox className="w-6 h-6 text-muted-foreground opacity-50" />
              </div>
              <p className="text-sm font-medium text-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground mt-1">You're all caught up for now!</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {sortedNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={cn(
                    "flex flex-col gap-1 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors relative",
                    !notification.read && "bg-primary/[0.04]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xl shrink-0 mt-0.5">{typeIcons[notification.type as keyof typeof typeIcons]}</span>
                    <div className="flex-1 space-y-1">
                      <p className={cn("text-xs leading-normal", !notification.read ? "text-foreground font-semibold" : "text-muted-foreground italic")}>
                        "{notification.message}"
                      </p>
                      <p className="text-[10px] text-muted-foreground/60">{notification.date}</p>
                    </div>
                    <div className="flex gap-0.5">
                       {!notification.read && (
                         <Button 
                           size="icon" 
                           variant="ghost" 
                           className="h-6 w-6 text-emerald-600 hover:bg-emerald-50"
                           onClick={(e) => {
                             e.preventDefault();
                             markNotificationAsRead(notification.id);
                           }}
                         >
                           <CheckCircle2 className="w-3 h-3" />
                         </Button>
                       )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-2 border-t bg-muted/30">
          <Button variant="ghost" className="w-full h-8 text-xs font-bold text-muted-foreground hover:text-primary" asChild>
            <Link href="/notifications">
              View All Notifications
              <ExternalLink className="w-3 h-3 ml-2" />
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
