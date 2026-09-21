'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export function ClientNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide on marketing/auth pages
  if (pathname === '/' || pathname === '/login' || pathname === '/register') {
    return null;
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-brand-700 transition-colors">
            P
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            PrepPilot Dashboard
          </span>
        </Link>

        <nav className="flex items-center space-x-6">
          <Link
            href="/dashboard"
            className="text-sm font-bold text-slate-600 hover:text-brand-600 transition-colors"
          >
            My Kits
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm font-bold px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-red-600 border border-slate-200 shadow-sm transition-all"
          >
            Log Out
          </button>
        </nav>
      </div>
    </header>
  );
}
