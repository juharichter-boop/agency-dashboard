'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, CheckSquare, Zap } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard size={20} />,
  },
  {
    name: 'Slack',
    href: '/dashboard/slack',
    icon: <MessageSquare size={20} />,
  },
  {
    name: 'Asana',
    href: '/dashboard/asana',
    icon: <CheckSquare size={20} />,
  },
  {
    name: 'Harvest',
    href: '/dashboard/harvest',
    icon: <Zap size={20} />,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 h-screen flex flex-col sticky top-0">
      {/* Logo Section */}
      <div className="p-[15px]">
        <h1 className="text-xl font-bold text-white">Uhura Digital</h1>
        <p className="text-xs text-slate-400 mt-1">Agency Operations</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-[15px] space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-lime-500/20 text-lime-400'
                  : 'text-slate-300 hover:text-slate-50 hover:bg-slate-800/50'
              }`}
            >
              <div className={isActive ? 'text-lime-400' : 'text-slate-400'}>
                {item.icon}
              </div>
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
