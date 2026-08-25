import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  UserCheck, 
  Wallet, 
  FileCheck2, 
  Plane, 
  Receipt,
  Compass
} from 'lucide-react';

export default function ZairDashboard() {
  const zairModules = [
    { 
      title: 'My Profile', 
      subtitle: 'PERSONAL & PASSPORT', 
      href: '/zair/profile', 
      icon: UserCheck, 
      color: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' 
    },
    { 
      title: 'My Balance', 
      subtitle: 'DUE & PAID AMOUNT', 
      href: '/zair/balance', 
      icon: Wallet, 
      color: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' 
    },
    { 
      title: 'My Visa', 
      subtitle: 'TRACKING & APPROVAL', 
      href: '/zair/visa', 
      icon: FileCheck2, 
      color: 'bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white' 
    },
    { 
      title: 'My Ticket', 
      subtitle: 'FLIGHT & ITINERARY', 
      href: '/zair/ticket', 
      icon: Plane, 
      color: 'bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white' 
    },
    { 
      title: 'My Ledger', 
      subtitle: 'PAYMENT RECEIPTS', 
      href: '/zair/ledger', 
      icon: Receipt, 
      color: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white' 
    },
  ];

  return (
    <>
      <Head>
        <title>Pilgrim Dashboard - Karwan-e-Rahian-e-Noor</title>
      </Head>

      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-12">
        
        {/* Top Header Badge */}
        <div className="flex justify-center">
          <div className="bg-[#0f2d59] text-white px-5 py-2 rounded-2xl flex items-center gap-2 shadow-sm border border-blue-900">
            <Compass className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-xs sm:text-sm tracking-wide uppercase">
              Pilgrim / Zair Portal
            </span>
          </div>
        </div>

        {/* Dashboard Box Container */}
        <div className="bg-[#f8fafc] border border-slate-200/90 rounded-2xl sm:rounded-3xl p-3 sm:p-8 shadow-sm">
          
          {/* Header Title */}
          <div className="text-center sm:text-left pb-3 sm:pb-6 border-b border-slate-200">
            <h2 className="text-base sm:text-xl font-black text-slate-800 tracking-tight uppercase">
              Pilgrim Services & Journey Details
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Access your verified visa documents, flight schedules, billing ledger and profile
            </p>
          </div>

          {/* 3-Column Grid for Mobile and Desktop */}
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6">
            {zairModules.map((item, idx) => {
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