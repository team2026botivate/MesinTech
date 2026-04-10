'use client';

import { DataProvider } from '@/lib/data-context';
import { TopNav } from '@/components/top-nav';
import { useAuth } from '@/lib/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!isLoading && !isLoggedIn && !isLoginPage) {
      router.push('/login');
    }
  }, [isLoading, isLoggedIn, isLoginPage, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse text-sm font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  // If we're on login page, just show children without shell
  if (isLoginPage) {
    return <main>{children}</main>;
  }

  return (
    <DataProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <TopNav />
        <main className="flex-1 w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-border py-3 mt-auto sticky bottom-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-muted-foreground">
            Powered By <a href="http://www.botivate.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Botivate</a>
          </div>
        </footer>
      </div>
    </DataProvider>
  );
}
