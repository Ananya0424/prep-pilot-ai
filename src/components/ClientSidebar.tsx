'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import {
  LayoutDashboard, Folder, PlusSquare, Layers,
  PlayCircle, Calendar, Settings, LogOut, Menu, X
} from 'lucide-react';

const navItems = [
  { name: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'My Prep Kits', icon: Folder, href: '/dashboard#kits' },
  { name: 'Create Kit', icon: PlusSquare, href: '/dashboard/create' },
  { name: 'Flashcards', icon: Layers, href: '#' },
  { name: 'Practice', icon: PlayCircle, href: '#' },
  { name: 'Schedule', icon: Calendar, href: '#' },
];

export function ClientSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Hide entirely on auth/marketing pages
  if (pathname === '/' || pathname === '/login' || pathname === '/register') return null;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/dashboard/create') return pathname === '/dashboard/create';
    return false;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-[60px] flex items-center px-5 border-b border-slate-200/70 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-[13px] shadow-sm">
            P
          </div>
          <span className="text-[15px] font-bold text-slate-900 tracking-tight">PrepPilot</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const disabled = item.href === '#';
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all
                ${active
                  ? 'bg-indigo-50 text-indigo-700'
                  : disabled
                  ? 'text-slate-300 cursor-not-allowed pointer-events-none'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-indigo-600' : disabled ? 'text-slate-300' : 'text-slate-400'}`} />
              <span>{item.name}</span>
              {disabled && (
                <span className="ml-auto text-[10px] font-bold text-slate-300 bg-slate-100 px-1.5 py-0.5 rounded">Soon</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-slate-200/70 space-y-0.5 flex-shrink-0">
        <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
          <Settings className="w-4 h-4 text-slate-400" />
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-[13px]">P</div>
          <span className="text-[15px] font-bold text-slate-900">PrepPilot</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed top-0 left-0 bottom-0 w-[240px] bg-white z-50 shadow-xl transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </div>

      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:flex flex-col w-[240px] fixed top-0 left-0 bottom-0 bg-white border-r border-slate-200/70 z-50">
        <SidebarContent />
      </div>
    </>
  );
}
