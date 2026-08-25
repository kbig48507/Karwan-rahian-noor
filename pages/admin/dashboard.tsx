import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LogOut,
  UserPlus,
  Users,
  Package,
  Moon,
  Compass,
  FileCheck2,
  Plane,
  BookOpen,
  Calculator,
  Receipt,
  Building,
  CreditCard,
  Layers
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'admin' | 'account'>('admin');

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('krn_user');
    }
    router.push('/login');
  };

  const travelModules = [
    { title: 'Agent Reg.', href: '/admin/register-agent', icon: UserPlus, bg: 'bg-blue-50 text-blue-500' },
    { title: 'Zair Reg.', href: '/admin/register-zair', icon: Users, bg: 'bg-emerald-50 text-emerald-500' },
    { title: 'Packages', href: '/admin/packages', icon: Package, bg: 'bg-amber-50 text-amber-500' },
    { title: 'Umrah', href: '/admin/umrah', icon: Moon, bg: 'bg-indigo-50 text-indigo-500' },
    { title: 'Ziyarat', href: '/admin/ziyarat', icon: Compass, bg: 'bg-teal-50 text-teal-500' },
    { title: 'Visas', href: '/admin/visas', icon: FileCheck2, bg: 'bg-purple-50 text-purple-500' },
    { title: 'Tickets', href: '/admin/tickets', icon: Plane, bg: 'bg-sky-50 text-sky-500' },
  ];

  const accountModules = [
    { title: 'General Ledger', href: '/admin/ledger', icon: BookOpen, bg: 'bg-blue-50 text-blue-500' },
    { title: 'Agent Accounts', href: '/admin/agent-accounts', icon: Building, bg: 'bg-emerald-50 text-emerald-500' },
    { title: 'Zair Accounts', href: '/admin/zair-accounts', icon: Users, bg: 'bg-amber-50 text-amber-500' },
    { title: 'Expenses', href: '/admin/expenses', icon: Receipt, bg: 'bg-rose-50 text-rose-500' },
    { title: 'Bank Ledgers', href: '/admin/bank-ledgers', icon: CreditCard, bg: 'bg-purple-50 text-purple-500' },
    { title: 'Reports', href: '/admin/reports', icon: Calculator, bg: 'bg-cyan-50 text-cyan-500' },
  ];

  const currentModules = activeTab === 'admin' ? travelModules : accountModules;

  return (
    <>
      <Head>
        <title>Admin Dashboard - Karwan-e-Rahian-e-Noor</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
        
        {/* Top Navy Header Bar */}
        <div>
          <header className="bg-[#0b2447] text-white px-4 sm:px-8 py-3.5 shadow-md">
            <div className="max-w-md md:max-w-4xl lg:max-w-5xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white p-0.5 shadow flex-shrink-0 flex items-center justify-center border border-amber-400">
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image
                      src="/logo.png"
                      alt="Logo"
                      fill
                      priority
                      className="object-contain"
                    />
                  </div>
                </div>
                <div>
                  <h1 className="text-xs sm:text-base font-black text-amber-400 tracking-wider uppercase leading-tight">
                    KARWAN-E-RAHIAN-E-NOOR
                  </h1>
                  <p className="text-[10px] sm:text-xs text-blue-200 tracking-wider font-semibold uppercase mt-0.5">
                    TRAVEL & TOURISM MANAGEMENT
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl shadow transition"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Logout</span>
              </button>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="max-w-md md:max-w-4xl lg:max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
            
            {/* Section Switcher Tabs */}
            <div className="bg-slate-200/80 p-1.5 rounded-2xl flex items-center gap-1">
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'admin'
                    ? 'bg-[#0b2447] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Admin Section</span>
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'account'
                    ? 'bg-[#0b2447] text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calculator className="w-4 h-4" />
                <span>Account Section</span>
              </button>
            </div>

            {/* White Rounded Dashboard Box */}
            <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200/80">
              
              {/* Header Title */}
              <div className="text-center pb-4 sm:pb-6 border-b border-slate-100">
                <h2 className="text-sm sm:text-xl font-black text-slate-800 tracking-wider uppercase">
                  {activeTab === 'admin' ? 'TRAVEL ADMIN DASHBOARD' : 'ACCOUNTS & LEDGERS DASHBOARD'}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-1">
                  {activeTab === 'admin'
                    ? 'Control panel for registration, packages, visa and ticketing modules'
                    : 'Financial ledgers, balances, payment receipts and audit records'}
                </p>
              </div>

              {/* 3-Column Square Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-5 pt-5 sm:pt-6">
                {currentModules.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      className="aspect-square bg-white hover:bg-slate-50 active:scale-95 border border-slate-200/90 rounded-2xl p-2 sm:p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition group"
                    >
                      <div className={`p-3 sm:p-4 rounded-2xl mb-1.5 sm:mb-2 flex items-center justify-center ${item.bg}`}>
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                      </div>
                      <span className="text-[11px] sm:text-sm font-bold text-slate-800 group-hover:text-[#0b2447] tracking-tight">
                        {item.title}
                      </span>
                    </Link>
                  );
                })}
              </div>

            </div>
          </main>
        </div>

        {/* Bottom Dark Navy Footer */}
        <footer className="bg-[#0b2447] text-white py-4 text-center mt-6">
          <p className="text-[11px] sm:text-xs font-medium text-slate-300 tracking-wide">
            <span className="font-bold text-amber-400">KARWAN-E-RAHIAN-E-NOOR</span> © 2026 | All Rights Reserved.
          </p>
        </footer>

      </div>
    </>
  );
}