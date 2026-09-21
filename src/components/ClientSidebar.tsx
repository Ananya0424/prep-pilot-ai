'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import {
  LayoutDashboard, Folder, PlusSquare, Settings, LogOut, Menu, X
} from 'lucide-react';

const navItems = [
  { name: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Create Kit', icon: PlusSquare, href: '/dashboard/create' },
  { name: 'My Prep Kits', icon: Folder, href: '/dashboard/kits' },
];

export function ClientSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide on auth/marketing pages
  if (pathname === '/' || pathname === '/login' || pathname === '/register') return null;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/dashboard/create') return pathname === '/dashboard/create';
    if (href === '/dashboard/kits') return pathname.startsWith('/dashboard/kits') || pathname.startsWith('/kit/');
    return false;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="h-[64px] flex items-center px-6 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-[14px] shadow-sm">
            P
          </div>
          <span className="text-[16px] font-bold text-slate-900 tracking-tight">PrepPilot</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`relative flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all
                ${active
                  ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm shadow-indigo-500/5'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              {/* Left accent bar for active item */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full" />
              )}
              <item.icon className={`w-[19px] h-[19px] flex-shrink-0 transition-colors ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Settings + Logout */}
      <div className="border-t border-slate-100 flex-shrink-0 p-4 space-y-1">
        <Link
          href="/dashboard/settings"
          onClick={() => setMobileOpen(false)}
          className={`flex w-full items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-semibold transition-colors ${
            pathname === '/dashboard/settings'
              ? 'bg-indigo-50 text-indigo-700 font-bold'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          <Settings className={`w-[19px] h-[19px] ${pathname === '/dashboard/settings' ? 'text-indigo-600' : 'text-slate-400'}`} />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-[19px] h-[19px] text-slate-400" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-[13px]">P</div>
          <span className="text-[15px] font-bold text-slate-900">PrepPilot</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed top-0 left-0 bottom-0 w-[270px] z-50 shadow-2xl transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-[270px] fixed top-0 left-0 bottom-0 border-r border-slate-200 z-50 shadow-sm">
        <SidebarContent />
      </div>
    </>
  );
}
