import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  UserPlus, 
  Users, 
  Package, 
  Moon, 
  Compass, 
  FileCheck, 
  Plane, 
  Wallet, 
  BookOpen, 
  Receipt, 
  TrendingDown, 
  FileText,
  Building2,
  Calculator
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'admin' | 'account'>('admin');

  const adminModules = [
    { 
      title: 'Agent Reg.', 
      subtitle: 'NETWORK AGENTS', 
      href: '/admin/register-agent', 
      icon: UserPlus, 
      color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' 
    },
    { 
      title: 'Zair Reg.', 
      subtitle: 'PILGRIM SETUP', 
      href: '/admin/register-zair', 
      icon: Users, 
      color: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' 
    },
    { 
      title: 'Packages', 
      subtitle: 'TOUR & GROUPS', 
      href: '/admin/packages', 
      icon: Package, 
      color: 'bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white' 
    },
    { 
      title: 'Umrah', 
      subtitle: 'HOLY PLACES', 
      href: '/admin/umrah', 
      icon: Moon, 
      color: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' 
    },
    { 
      title: 'Ziyarat', 
      subtitle: 'IRAN & IRAQ', 
      href: '/admin/ziyarat', 
      icon: Compass, 
      color: 'bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white' 
    },
    { 
      title: 'Visas', 
      subtitle: 'APPROVALS', 
      href: '/admin/visas', 
      icon: FileCheck, 
      color: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white' 
    },
    { 
      title: 'Tickets', 
      subtitle: 'FLIGHTS & PNR', 
      href: '/admin/tickets', 
      icon: Plane, 
      color: 'bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white' 
    },
  ];

  const accountModules = [
    { 
      title: 'Receive Pay', 
      subtitle: 'CASH & VOUCHERS', 
      href: '/accounts/receive-payment', 
      icon: Wallet, 
      color: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' 
    },
    { 
      title: 'Agent Ledger', 
      subtitle: 'DEBIT & CREDIT', 
      href: '/accounts/agent-ledger', 
      icon: BookOpen, 
      color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' 
    },
    { 
      title: 'Zair Ledger', 
      subtitle: 'PILGRIM STATEMENT', 
      href: '/accounts/zair-ledger', 
      icon: Receipt, 
      color: 'bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white' 
    },
    { 
      title: 'Expenses', 
      subtitle: 'OFFICE & TOUR', 
      href: '/accounts/expenses', 
      icon: TrendingDown, 
      color: 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white' 
    },
    { 
      title: 'Reports', 
      subtitle: 'AUDIT SUMMARY', 
      href: '/accounts/expense-reports', 
      icon: FileText, 
      color: 'bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white' 
    },
  ];

  const currentModules = activeTab === 'admin' ? adminModules : accountModules;

  return (
    <>
      <Head>
        <title>Admin Dashboard - Karwan-e-Rahian-e-Noor</title>
      </Head>

      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-12">
        
        {/* Top Tab Pill Switcher */}
        <div className="flex justify-center">
          <div className="w-full sm:w-auto bg-slate-200/90 p-1 rounded-2xl flex items-center gap-1.5 shadow-inner border border-slate-300/60">
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 sm:px-6 py-2 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all ${
                activeTab === 'admin'
                  ? 'bg-[#0f2d59] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Admin Section</span>
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 sm:px-6 py-2 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all ${
                activeTab === 'account'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Account Section</span>
            </button>
          </div>
        </div>

        {/* Dashboard Box */}
        <div className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl sm:rounded-3xl p-3 sm:p-8 shadow-sm">
          
          {/* Header Title */}
          <div className="text-center sm:text-left pb-3 sm:pb-6 border-b border-slate-200">
            <h2 className="text-base sm:text-xl font-black text-slate-800 tracking-tight uppercase">
              {activeTab === 'admin' ? 'TRAVEL ADMIN DASHBOARD' : 'ACCOUNTS & FINANCE DASHBOARD'}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              {activeTab === 'admin' 
                ? 'Control panel for registration, packages, visa and ticketing modules' 
                : 'Manage financial ledgers, vouchers, receipts and audit reports'}
            </p>
          </div>

          {/* 3-Column Grid for Mobile, Scalable for Tablet/Desktop */}
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-6">
            {currentModules.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all group"
                >
                  <div className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl mb-1.5 sm:mb-3 shadow-sm ${item.color}`}>
                    <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
                  </div>

                  <h3 className="text-[11px] sm:text-sm font-bold text-slate-800 tracking-tight leading-tight group-hover:text-[#0f2d59] transition-colors">
                    {item.title}
                  </h3>

                  <span className="hidden sm:block text-[10px] font-semibold text-slate-400 tracking-wider mt-1">
                    {item.subtitle}
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