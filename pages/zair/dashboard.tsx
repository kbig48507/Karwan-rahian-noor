import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { UserCheck, Wallet, FileCheck2, Plane, Receipt } from 'lucide-react';

export default function ZairDashboard() {
  const zairModules = [
    { title: 'My Profile', href: '/zair/profile', icon: UserCheck, desc: 'Review your registered passport and personal information' },
    { title: 'My Balance', href: '/zair/balance', icon: Wallet, desc: 'Check total package cost, paid amounts and balance due' },
    { title: 'My Visa', href: '/zair/visa', icon: FileCheck2, desc: 'Track visa status and download approved documents' },
    { title: 'My Ticket', href: '/zair/ticket', icon: Plane, desc: 'View flight schedules, airline seats, and PNR details' },
    { title: 'My Ledger', href: '/zair/ledger', icon: Receipt, desc: 'Full statement of account and verified payment receipts' },
  ];

  return (
    <>
      <Head>
        <title>Zair Portal - Karwan-e-Rahian-e-Noor</title>
      </Head>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Zair / Pilgrim Portal</h1>
          <p className="text-sm text-slate-500">Track your journey, visas, air tickets, and billing details in one place.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {zairModules.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-500 transition group"
              >
                <div className="p-3.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition w-fit mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-800 group-hover:text-amber-600 transition">{item.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}