'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Folder, PlusSquare, Layers, PlayCircle, Calendar, Settings, LogOut } from 'lucide-react';

export function ClientSidebar() {
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

  const navItems = [
    { name: 'Dashboard', icon: Home, href: '/dashboard' },
    { name: 'Create Kit', icon: PlusSquare, href: '/dashboard/create' },
  ];

  return (
    <>
      {/* Mobile Topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            P
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">PrepPilot</span>
        </div>
        <button onClick={handleLogout} className="text-sm font-medium text-slate-500">Logout</button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-[240px] fixed top-0 left-0 bottom-0 bg-[#F8F9FF] border-r border-indigo-50 z-50">
        
        {/* Logo */}
        <div className="h-20 flex items-center px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-indigo-200">
              P
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">PrepPilot</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
                  isActive 
                    ? 'bg-indigo-50/80 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-indigo-50/50 space-y-1">
          <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
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
    </>
  );
}
