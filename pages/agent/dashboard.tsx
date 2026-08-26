import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  BookOpen, 
  Stamp, 
  ShieldCheck, 
  FileCheck2, 
  Plane, 
  UserCheck,
  ArrowRight
} from 'lucide-react';

export default function AgentDashboard() {
  const agentModules = [
    { title: 'Ledger', desc: 'Debit, credit and pending balances', href: '/agent/ledger', icon: BookOpen, bg: 'bg-blue-50 text-blue-600' },
    { title: 'Iran Visa', desc: 'Submit and track Iran applications', href: '/agent/iran-visa', icon: Stamp, bg: 'bg-emerald-50 text-emerald-600' },
    { title: 'Iraq Visa', desc: 'Apply for group Ziyarat visas', href: '/agent/iraq-visa', icon: ShieldCheck, bg: 'bg-amber-50 text-amber-600' },
    { title: 'Syria Visa', desc: 'Track Syria security approvals', href: '/agent/syria-visa', icon: FileCheck2, bg: 'bg-purple-50 text-purple-600' },
    { title: 'Tickets', desc: 'Issue tickets and flight schedules', href: '/agent/tickets', icon: Plane, bg: 'bg-sky-50 text-sky-600' },
    { title: 'My Profile', desc: 'Agency credentials and details', href: '/agent/profile', icon: UserCheck, bg: 'bg-rose-50 text-rose-600' },
  ];

  return (
    <>
      <Head>
        <title>Agent Portal - Karwan-e-Rahian-e-Noor</title>
      </Head>

      <div className="w-full">
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200/80">
          <div className="text-center sm:text-left pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-sm sm:text-xl font-black text-slate-800 tracking-wider uppercase">
                AGENT MANAGEMENT PORTAL
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">
                Manage affiliated bookings, group visas, ticketing and agency balance ledger
              </p>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
              Agency Operations
            </span>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-5 pt-5 sm:pt-6">
            {agentModules.map((item, idx) => {
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