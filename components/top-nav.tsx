'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useData } from '@/lib/data-context';
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
  LogOut, 
  User as UserIcon,
  Settings as SettingsIcon 
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { NotificationHeader } from './notification-header';

const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/sales', label: 'Sales', icon: FileText },
  { href: '/purchases', label: 'Purchases', icon: Package },
  { href: '/returns', label: 'Returns', icon: RotateCcw },
  { href: '/expenses', label: 'Expenses', icon: Zap },
  { href: '/companies', label: 'Companies', icon: Users },
  { href: '/inventory', label: 'Inventory', icon: Archive },
  { href: '/payments', label: 'Payments', icon: DollarSign },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: 'Settings', icon: SettingsIcon },
];

export function TopNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isLoaded } = useData();

  if (!isLoaded || !user) return null;

  const accessibleItems = navItems.filter(item => 
    user.accessibleModules?.includes(item.href) || item.href === '/home'
  );

  const isHome = pathname === '/' || pathname === '/home';

  return (
    <nav className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className={`flex items-center justify-between ${!isHome ? 'mb-4' : ''}`}>
          <Link href="/home">
            <h1 className="text-2xl font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">Mesin Tech</h1>
          </Link>
          
          <div className="flex items-center gap-4">
            <NotificationHeader />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                <UserIcon className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs font-semibold text-foreground capitalize">{user?.name}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden xs:inline">Logout</span>
            </Button>
          </div>
        </div>
        
        {/* Module Grid/Selection */}
        {!isHome && (
          <div className="flex flex-wrap gap-2">
            {accessibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant={isActive ? 'default' : 'secondary'}
                  size="sm"
                  asChild
                  className={isActive ? 'shadow-md' : ''}
                >
                  <Link href={item.href}>
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
