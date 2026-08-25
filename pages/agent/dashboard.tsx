import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  BookOpen, 
  Stamp, 
  ShieldCheck, 
  FileCheck2, 
  Plane, 
  UserCheck 
} from 'lucide-react';

export default function AgentDashboard() {
  const agentModules = [
    { title: 'Ledger', href: '/agent/ledger', icon: BookOpen, bg: 'bg-blue-50 text-blue-500' },
    { title: 'Iran Visa', href: '/agent/iran-visa', icon: Stamp, bg: 'bg-emerald-50 text-emerald-500' },
    { title: 'Iraq Visa', href: '/agent/iraq-visa', icon: ShieldCheck, bg: 'bg-amber-50 text-amber-500' },
    { title: 'Syria Visa', href: '/agent/syria-visa', icon: FileCheck2, bg: 'bg-purple-50 text-purple-500' },
    { title: 'Tickets', href: '/agent/tickets', icon: Plane, bg: 'bg-sky-50 text-sky-500' },
    { title: 'My Profile', href: '/agent/profile', icon: UserCheck, bg: 'bg-rose-50 text-rose-500' },
  ];

  return (
    <>
      <Head>
        <title>Agent Portal - Karwan-e-Rahian-e-Noor</title>
      </Head>

      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between flex-1 max-h-[72vh] sm:max-h-none">
        
        {/* Header Title */}
        <div className="text-center pb-2.5 sm:pb-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="text-xs sm:text-lg font-black text-slate-800 tracking-wider uppercase">
            AGENT MANAGEMENT PORTAL
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5">
            Manage affiliated bookings, group visas, ticketing and agency balance ledger
          </p>
        </div>

        {/* 3-Column Square Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-2.5 sm:gap-4 my-auto pt-3">
          {agentModules.map((item, idx) => {
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
    </>
  );
}