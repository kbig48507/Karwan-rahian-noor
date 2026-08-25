import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { BookOpen, Stamp, Plane, UserCheck } from 'lucide-react';

export default function AgentDashboard() {
  const agentModules = [
    { title: 'Ledger', href: '/agent/ledger', icon: BookOpen, desc: 'View transactions, debit/credit records & balance' },
    { title: 'Iran Visa', href: '/agent/iran-visa', icon: Stamp, desc: 'Submit Iran visa requests & check approval status' },
    { title: 'Iraq Visa', href: '/agent/iraq-visa', icon: Stamp, desc: 'Apply and download Iraq Ziyarat group visas' },
    { title: 'Syria Visa', href: '/agent/syria-visa', icon: Stamp, desc: 'Process Syria approvals and tracking' },
    { title: 'Tickets', href: '/agent/tickets', icon: Plane, desc: 'Issue tickets, view flight itineraries and PNRs' },
    { title: 'My Profile', href: '/agent/profile', icon: UserCheck, desc: 'Manage agency details, contact and credentials' },
  ];

  return (
    <>
      <Head>
        <title>Agent Portal - Karwan-e-Rahian-e-Noor</title>
      </Head>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Agent Portal</h1>
          <p className="text-sm text-slate-500">Welcome to your dedicated agency booking and ledger panel.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {agentModules.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-500 transition group"
              >
                <div className="p-3.5 rounded-lg bg-blue-50 text-[#0f2d59] group-hover:bg-[#0f2d59] group-hover:text-white transition w-fit mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-800 group-hover:text-[#0f2d59] transition">{item.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}