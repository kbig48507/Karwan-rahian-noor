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
  Layers,
  ArrowRight,
  Wallet
} from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'admin' | 'account'>('admin');

  const travelModules = [
    { title: 'Agent Reg.', desc: 'Register affiliated agencies', href: '/admin/register-agent', icon: UserPlus, bg: 'bg-blue-50 text-blue-600' },
    { title: 'Zair Reg.', desc: 'Register pilgrim passports', href: '/admin/register-zair', icon: Users, bg: 'bg-emerald-50 text-emerald-600' },
    { title: 'Packages', desc: 'Create Umrah & Ziyarat packages', href: '/admin/packages', icon: Package, bg: 'bg-amber-50 text-amber-600' },
    { title: 'Umrah', desc: 'Manage Umrah bookings & groups', href: '/admin/umrah', icon: Moon, bg: 'bg-indigo-50 text-indigo-600' },
    { title: 'Ziyarat', desc: 'Iran, Iraq, Syria caravans', href: '/admin/ziyarat', icon: Compass, bg: 'bg-teal-50 text-teal-600' },
    { title: 'Visas', desc: 'Process and track all visa apps', href: '/admin/visas', icon: FileCheck2, bg: 'bg-purple-50 text-purple-600' },
    { title: 'Tickets', desc: 'Flight bookings and PNR controls', href: '/admin/tickets', icon: Plane, bg: 'bg-sky-50 text-sky-600' },
  ];

  const accountModules = [
    { title: 'Personal Ledger', desc: 'Payables & Receivables directory', href: '/admin/personal-ledger', icon: Wallet, bg: 'bg-indigo-50 text-indigo-600' },
    { title: 'General Ledger', desc: 'Company accounting & journal', href: '/admin/ledger', icon: BookOpen, bg: 'bg-blue-50 text-blue-600' },
    { title: 'Agent Accounts', desc: 'Agency statements & balances', href: '/admin/agent-accounts', icon: Building, bg: 'bg-emerald-50 text-emerald-600' },
    { title: 'Zair Accounts', desc: 'Individual pilgrim billing', href: '/admin/zair-accounts', icon: Users, bg: 'bg-amber-50 text-amber-600' },
    { title: 'Expenses', desc: 'Track daily office expenditure', href: '/admin/expenses', icon: Receipt, bg: 'bg-rose-50 text-rose-600' },
    { title: 'Bank Ledgers', desc: 'Manage bank accounts & funds', href: '/admin/bank-ledgers', icon: CreditCard, bg: 'bg-purple-50 text-purple-600' },
    { title: 'Reports', desc: 'Financial audit & summary sheets', href: '/admin/reports', icon: Calculator, bg: 'bg-cyan-50 text-cyan-600' },
  ];

  const currentModules = activeTab === 'admin' ? travelModules : accountModules;

  return (
    <>
      <Head>
        <title>Admin Dashboard - Karwan-e-Rahian-e-Noor</title>
      </Head>

      <div className="w-full space-y-4">
        {/* Section Switcher Tabs */}
        <div className="max-w-md mx-auto md:max-w-lg bg-slate-200/90 p-1.5 rounded-2xl flex items-center gap-1 shadow-inner">
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

        {/* Dashboard Box */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200/80">
          <div className="text-center sm:text-left pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-xl font-black text-slate-800 tracking-wider uppercase">
                {activeTab === 'admin' ? 'TRAVEL ADMIN DASHBOARD' : 'ACCOUNTS & LEDGERS DASHBOARD'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">
                {activeTab === 'admin'
                  ? 'Control panel for registration, packages, visa and ticketing modules'
                  : 'Financial ledgers, balances, payment receipts and audit records'}
              </p>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 bg-blue-50 text-[#0b2447] text-xs font-bold rounded-full border border-blue-100">
              Admin Workspace
            </span>
          </div>

          {/* Responsive Grid */}
          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 pt-5 sm:pt-6">
            {currentModules.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  className="bg-white hover:bg-slate-50 active:scale-95 border border-slate-200/90 rounded-2xl p-2.5 sm:p-5 flex flex-col items-center sm:items-start text-center sm:text-left shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  <div className="flex items-center justify-between w-full mb-1 sm:mb-3">
                    <div className={`p-2.5 sm:p-3.5 rounded-2xl flex items-center justify-center ${item.bg}`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <ArrowRight className="hidden sm:block w-4 h-4 text-slate-300 group-hover:text-[#0b2447] group-hover:translate-x-1 transition-all" />
                  </div>

                  <span className="text-[10px] sm:text-sm font-bold text-slate-800 group-hover:text-[#0b2447] tracking-tight">
                    {item.title}
                  </span>

                  <p className="hidden sm:block text-[11px] text-slate-400 font-normal mt-1 leading-snug">
                    {item.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}