'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/lib/data-context';
import Link from 'next/link';
import { Trash2, CheckCircle2, Bell, Settings2, MoreHorizontal, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function NotificationsPage() {
  const { notifications, markNotificationAsRead, deleteNotification, companies, transactions, isLoaded } = useData();
  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Checking for updates...</p>
      </div>
    );
  }

  const getCompanyName = (companyId: string) => {
    return companies.find((c) => c.id === companyId)?.name || 'General';
  };

  const getTransactionNumber = (transactionId?: string) => {
    if (!transactionId) return null;
    const transaction = transactions.find((t) => t.id === transactionId);
    return transaction?.serialNumber || null;
  };

  const severityColors = {
    info: 'border-blue-200 text-blue-700 bg-blue-50/50',
    warning: 'border-amber-200 text-amber-700 bg-amber-50/50',
    error: 'border-red-200 text-red-700 bg-red-50/50',
  };

  const typeIcons = {
    payment_due: '⏰',
    payment_overdue: '⚠️',
    payment_received: '✅',
    return_pending: '↩️',
    expense_pending: '💰',
  };

  const typeLabels = {
    payment_due: 'Payment Due',
    payment_overdue: 'Payment Overdue',
    payment_received: 'Payment Received',
    return_pending: 'Return Pending',
    expense_pending: 'Expense Pending',
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const sortedNotifications = [...notifications].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount === 0 ? 'All caught up' : `You have ${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                notifications.forEach((n) => {
                  if (!n.read) markNotificationAsRead(n.id);
                });
              }}
              className="bg-background"
            >
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="py-20 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground text-lg font-medium">No notifications yet</p>
              <p className="text-sm text-muted-foreground">We'll alert you about payments and system updates.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[80px]">Status</TableHead>
                  <TableHead className="w-[150px]">Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedNotifications.map((notification) => (
                  <TableRow 
                    key={notification.id}
                    onClick={() => notification.actionUrl && router.push(notification.actionUrl)}
                    className={cn(
                      "group transition-colors",
                      notification.actionUrl && "cursor-pointer hover:bg-muted/30",
                      !notification.read ? "bg-primary/[0.03] font-medium" : "text-muted-foreground/80"
                    )}
                  >
                    <TableCell>
                      {!notification.read ? (
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground/20" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{typeIcons[notification.type]}</span>
                        <span className="text-xs font-semibold whitespace-nowrap">{typeLabels[notification.type]}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm text-foreground italic">"{notification.message}"</p>
                        {notification.transactionId && (
                          <div className="flex items-center gap-1.5">
                             <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 font-bold tracking-tight">
                               #{getTransactionNumber(notification.transactionId)}
                             </Badge>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                         <span className={cn("text-xs", !notification.read ? "text-foreground" : "text-muted-foreground")}>
                           {getCompanyName(notification.companyId)}
                         </span>
                         <Badge variant="outline" className={cn("text-[9px] py-0 h-4 uppercase font-bold", severityColors[notification.severity])}>
                           {notification.severity}
                         </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {notification.date}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {!notification.read && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                               e.stopPropagation();
                               markNotificationAsRead(notification.id);
                            }}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                             e.stopPropagation();
                             setIdToDelete(notification.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        {notification.actionUrl && (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                               e.stopPropagation();
                               router.push(notification.actionUrl!);
                            }}
                          >
                             <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/30 border-dashed">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-sm font-bold uppercase tracking-widest">Configuration</CardTitle>
          </div>
          <CardDescription>Automated notification triggers active for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(typeLabels).map(([type, label]) => (
              <div key={type} className="flex flex-col items-center gap-2 p-4 bg-background border rounded-xl shadow-sm text-center">
                <span className="text-2xl">{typeIcons[type as keyof typeof typeIcons]}</span>
                <p className="font-bold text-[11px] leading-tight">{label}</p>
                <Badge variant="outline" className="text-[9px] py-0 bg-emerald-50 text-emerald-700 border-emerald-200">ACTIVE</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!idToDelete} onOpenChange={(open) => !open && setIdToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Delete Notification
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this notification? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (idToDelete) deleteNotification(idToDelete);
                setIdToDelete(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
