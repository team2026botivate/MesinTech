'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import {
  FileText,
  DollarSign,
  Users,
  Home,
  Package,
  Archive,
  RotateCcw,
  Zap,
  Bell,
  Settings as SettingsIcon,
  Truck,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/sales', label: 'Sales', icon: FileText },
  { href: '/purchases', label: 'Purchases', icon: Package },
  { href: '/returns', label: 'Returns', icon: RotateCcw },
  { href: '/expenses', label: 'Expenses', icon: Zap },
  { href: '/companies', label: 'Companies', icon: Building2 },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/dispatch', label: 'Dispatch', icon: Truck },
  { href: '/inventory', label: 'Inventory', icon: Archive },
  { href: '/payments', label: 'Payments', icon: DollarSign },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isLoaded } = useData();
  const { user } = useAuth();

  if (!isLoaded || !user) return null;

  const accessibleItems = navItems.filter(item =>
    user.accessibleModules?.includes(item.href) || item.href === '/home'
  );

  return (
    <aside className="w-56 border-r border-border bg-sidebar text-sidebar-foreground flex flex-col h-screen sticky top-0">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-lg font-semibold text-sidebar-foreground">Mesin Tech</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {accessibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3 px-3',
                    isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground'
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* Footer */}
      <div className="border-t border-sidebar-border p-4 text-xs text-sidebar-foreground/60">
        <p>© 2024 Mesin Tech</p>
      </div>
    </aside>
  );
}
