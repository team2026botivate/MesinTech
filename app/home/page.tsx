'use client';

import Link from 'next/link';
import { useData } from '@/lib/data-context';
import { useAuth } from '@/lib/auth-context';
import { FileText, Package, RotateCcw, Zap, Users, Archive, DollarSign, Bell, TrendingUp, Settings, Truck } from 'lucide-react';

const allModules = [
  {
    href: '/sales',
    label: 'Sales',
    icon: FileText,
    description: 'Create and manage sales invoices',
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
  },
  {
    href: '/purchases',
    label: 'Purchases',
    icon: Package,
    description: 'Track purchase orders and suppliers',
    color: 'bg-purple-50 border-purple-200',
    iconColor: 'text-purple-600',
  },
  {
    href: '/returns',
    label: 'Returns',
    icon: RotateCcw,
    description: 'Manage sales and purchase returns',
    color: 'bg-orange-50 border-orange-200',
    iconColor: 'text-orange-600',
  },
  {
    href: '/expenses',
    label: 'Expenses',
    icon: Zap,
    description: 'Track business expenses by category',
    color: 'bg-amber-50 border-amber-200',
    iconColor: 'text-amber-600',
  },
  {
    href: '/companies',
    label: 'Companies',
    icon: Users,
    description: 'Manage customers and suppliers',
    color: 'bg-green-50 border-green-200',
    iconColor: 'text-green-600',
  },
  {
    href: '/customers',
    label: 'Customers',
    icon: Users,
    description: 'Manage customer accounts',
    color: 'bg-teal-50 border-teal-200',
    iconColor: 'text-teal-600',
  },
  {
    href: '/dispatch',
    label: 'Dispatch',
    icon: Truck,
    description: 'Track outgoing shipments',
    color: 'bg-cyan-50 border-cyan-200',
    iconColor: 'text-cyan-600',
  },
  {
    href: '/inventory',
    label: 'Inventory',
    icon: Archive,
    description: 'Manage products and stock levels',
    color: 'bg-indigo-50 border-indigo-200',
    iconColor: 'text-indigo-600',
  },
  {
    href: '/payments',
    label: 'Payments',
    icon: DollarSign,
    description: 'Track payments and outstanding balances',
    color: 'bg-emerald-50 border-emerald-200',
    iconColor: 'text-emerald-600',
  },

  {
    href: '/notifications',
    label: 'Notifications',
    icon: Bell,
    description: 'Check alerts and pending actions',
    color: 'bg-red-50 border-red-200',
    iconColor: 'text-red-600',
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    description: 'Manage users, roles and permissions',
    color: 'bg-slate-50 border-slate-200',
    iconColor: 'text-slate-600',
  },
];

export default function HomeGrid() {
  const { isLoaded } = useData();
  const { user } = useAuth();

  if (!isLoaded || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const accessibleModules = allModules.filter(module => 
    user.accessibleModules?.includes(module.href)
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Select a Module
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {accessibleModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.href}
                href={module.href}
                className={`${module.color} border rounded-lg p-6 transition-all hover:shadow-lg hover:border-opacity-100 cursor-pointer group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${module.color} border border-opacity-50 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-8 h-8 ${module.iconColor}`} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground">{module.label}</h3>
                <p className="text-sm text-muted-foreground mt-2">{module.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}