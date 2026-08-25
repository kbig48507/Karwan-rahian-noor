import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  Package, 
  BookOpen, 
  Receipt, 
  Stamp, 
  Plane, 
  UserCheck, 
  Wallet, 
  FileCheck2, 
  LogOut 
} from 'lucide-react';

interface AuthUser {
  id: string;
  username: string;
  role: 'admin' | 'agent' | 'zair';
  name?: string;
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
  }, [router.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('auth_user');
    router.push('/login');
  };

  // Role-based Navigation Links
  const getNavItems = () => {
    if (!user) return [];

    if (user.role === 'admin') {
      return [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Agents', href: '/admin/register-agent', icon: UserPlus },
        { name: 'Zair Reg.', href: '/admin/register-zair', icon: Users },
        { name: 'Packages', href: '/admin/packages', icon: Package },
        { name: 'Agent Ledger', href: '/accounts/agent-ledger', icon: BookOpen },
        { name: 'Zair Ledger', href: '/accounts/zair-ledger', icon: Receipt },
      ];
    }

    if (user.role === 'agent') {
      return [
        { name: 'Dashboard', href: '/agent/dashboard', icon: LayoutDashboard },
        { name: 'Ledger', href: '/agent/ledger', icon: BookOpen },
        { name: 'Iran Visa', href: '/agent/iran-visa', icon: Stamp },
        { name: 'Iraq Visa', href: '/agent/iraq-visa', icon: Stamp },
        { name: 'Tickets', href: '/agent/tickets', icon: Plane },
        { name: 'My Profile', href: '/agent/profile', icon: UserCheck },
      ];
    }

    if (user.role === 'zair') {
      return [
        { name: 'Dashboard', href: '/zair/dashboard', icon: LayoutDashboard },
        { name: 'My Profile', href: '/zair/profile', icon: UserCheck },
        { name: 'My Balance', href: '/zair/balance', icon: Wallet },
        { name: 'My Visa', href: '/zair/visa', icon: FileCheck2 },
        { name: 'My Ticket', href: '/zair/ticket', icon: Plane },
        { name: 'My Ledger', href: '/zair/ledger', icon: Receipt },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  const getDashboardHomeLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'agent') return '/agent/dashboard';
    if (user.role === 'zair') return '/zair/dashboard';
    return '/login';
  };

  return (
    <header className="bg-[#0f2d59] text-white shadow-lg border-b border-[#1b437e] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Portal Branding */}
          <Link href={getDashboardHomeLink()} className="flex items-center gap-3.5 group">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-amber-400 bg-white shadow-md flex-shrink-0">
              <Image 
                src="/logo.png" 
                alt="Karwan-e-Rahian-e-Noor Logo" 
                fill 
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg tracking-wide text-amber-400 group-hover:text-amber-300 transition-colors uppercase">
                Karwan-e-Rahian-e-Noor
              </span>
              <span className="text-[10px] sm:text-xs text-blue-200 tracking-wider font-medium uppercase">
                Travel & Tourism Management
              </span>
            </div>
          </Link>

          {/* Role Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-[#1b437e] text-amber-400 shadow-sm border border-blue-400/30' 
                      : 'text-slate-200 hover:bg-[#163a6f] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout Button */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-100 uppercase">{user.name || user.username}</span>
                <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">{user.role}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition shadow hover:shadow-md border border-red-500"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}