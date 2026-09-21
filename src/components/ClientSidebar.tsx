'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Folder, PlusSquare, Layers,
  PlayCircle, Calendar, Settings, LogOut, Menu, X
} from 'lucide-react';

const navItems = [
  { name: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'My Prep Kits', icon: Folder, href: '/dashboard/kits' },
  { name: 'Create Kit', icon: PlusSquare, href: '/dashboard/create' },
  { name: 'Flashcards', icon: Layers, href: '/dashboard/kits' },
  { name: 'Practice', icon: PlayCircle, href: '/dashboard/kits' },
  { name: 'Schedule', icon: Calendar, href: '/dashboard/kits' },
];

export function ClientSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(data => {
      if (data?.user) {
        const first = (data.user.name || '').split(' ')[0];
        setUserName(first === 'Candidate' ? '' : first);
        setUserEmail(data.user.email || '');
      }
    }).catch(() => {});
  }, []);

  // Hide on auth/marketing pages
  if (pathname === '/' || pathname === '/login' || pathname === '/register') return null;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const isActive = (href: string, name: string) => {
    // Exact match for main pages
    if (href === '/dashboard' && name === 'Overview') return pathname === '/dashboard';
    if (href === '/dashboard/kits' && name === 'My Prep Kits') return pathname === '/dashboard/kits';
    if (href === '/dashboard/create') return pathname === '/dashboard/create';
    // Flashcards/Practice/Schedule active when on kits or practice pages
    if (name === 'Flashcards' || name === 'Practice' || name === 'Schedule') {
      return pathname.startsWith('/practice/') || pathname.startsWith('/kit/');
    }
    return false;
  };

  const avatarLetter = (userName || userEmail || 'U').charAt(0).toUpperCase();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="h-[60px] flex items-center px-5 border-b border-slate-100 flex-shrink-0">
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
          const active = isActive(item.href, item.name);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all
                ${active
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              {/* Left accent bar for active item */}
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-600 rounded-r-full" />
              )}
              <item.icon className={`w-[17px] h-[17px] flex-shrink-0 transition-colors ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className={active ? 'font-bold' : ''}>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Settings + User + Logout */}
      <div className="border-t border-slate-100 flex-shrink-0">
        <div className="px-3 py-2">
          <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <Settings className="w-[17px] h-[17px] text-slate-400" />
            Settings
          </button>
        </div>

        {/* User info strip */}
        {userEmail && (
          <div className="mx-3 mb-2 flex items-center gap-3 px-3 py-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0 shadow-sm">
              {avatarLetter}
            </div>
            <div className="min-w-0 flex-1">
              {userName && <p className="text-[12px] font-bold text-slate-800 truncate">{userName}</p>}
              <p className="text-[11px] text-slate-400 font-medium truncate">{userEmail}</p>
            </div>
          </div>
        )}

        <div className="px-3 pb-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-[17px] h-[17px] text-slate-400" />
            Logout
          </button>
        </div>
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
      <div className={`lg:hidden fixed top-0 left-0 bottom-0 w-[240px] z-50 shadow-2xl transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-[240px] fixed top-0 left-0 bottom-0 border-r border-slate-200 z-50 shadow-sm">
        <SidebarContent />
      </div>
    </>
  );
}
