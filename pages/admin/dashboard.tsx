import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
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
  const [activeTab, setActiveTab] = useState<'admin' | 'account'>('admin');

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
      </Head>

      <div className="space-y-3 flex flex-col flex-1 justify-center">
        {/* Section Switcher Tabs */}
        <div className="bg-slate-200/90 p-1 rounded-xl flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'admin'
                ? 'bg-[#0b2447] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Admin Section</span>
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`flex-1 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'account'
                ? 'bg-[#0b2447] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Account Section</span>
          </button>
        </div>

        {/* White Card Box */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between flex-1 max-h-[72vh] sm:max-h-none">
          {/* Header Title */}
          <div className="text-center pb-2.5 sm:pb-4 border-b border-slate-100 flex-shrink-0">
            <h2 className="text-xs sm:text-lg font-black text-slate-800 tracking-wider uppercase">
              {activeTab === 'admin' ? 'TRAVEL ADMIN DASHBOARD' : 'ACCOUNTS & LEDGERS DASHBOARD'}
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5">
              {activeTab === 'admin'
                ? 'Control panel for registration, packages, visa and ticketing modules'
                : 'Financial ledgers, balances, payment receipts and audit records'}
            </p>
          </div>

          {/* 3-Column Square Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-2.5 sm:gap-4 my-auto pt-3">
            {currentModules.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="aspect-square bg-white hover:bg-slate-50 active:scale-95 border border-slate-200/90 rounded-2xl p-1.5 sm:p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition group"
                >
                  <div className={`p-2.5 sm:p-3.5 rounded-2xl mb-1 sm:mb-2 flex items-center justify-center ${item.bg}`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-slate-800 group-hover:text-[#0b2447] tracking-tight">
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}