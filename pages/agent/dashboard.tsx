import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LogOut, 
  BookOpen, 
  Stamp, 
  ShieldCheck, 
  FileCheck2, 
  Plane, 
  UserCheck 
} from 'lucide-react';

export default function AgentDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('krn_user');
    }
    router.push('/login');
  };

  const agentModules = [
    { 
      title: 'Ledger', 
      href: '/agent/ledger', 
      icon: BookOpen, 
      bg: 'bg-blue-50 text-blue-500' 
    },
    { 
      title: 'Iran Visa', 
      href: '/agent/iran-visa', 
      icon: Stamp, 
      bg: 'bg-emerald-50 text-emerald-500' 
    },
    { 
      title: 'Iraq Visa', 
      href: '/agent/iraq-visa', 
      icon: ShieldCheck, 
      bg: 'bg-amber-50 text-amber-500' 
    },
    { 
      title: 'Syria Visa', 
      href: '/agent/syria-visa', 
      icon: FileCheck2, 
      bg: 'bg-purple-50 text-purple-500' 
    },
    { 
      title: 'Tickets', 
      href: '/agent/tickets', 
      icon: Plane, 
      bg: 'bg-sky-50 text-sky-500' 
    },
    { 
      title: 'My Profile', 
      href: '/agent/profile', 
      icon: UserCheck, 
      bg: 'bg-rose-50 text-rose-500' 
    },
  ];

  return (
    <>
      <Head>
        <title>Agent Portal - Karwan-e-Rahian-e-Noor</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
        
        {/* Top Navy Header Bar */}
        <div>
          <header className="bg-[#0b2447] text-white px-4 py-3.5 shadow-md">
            <div className="max-w-md mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white p-0.5 shadow flex-shrink-0 flex items-center justify-center border border-amber-400">
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
                  <h1 className="text-xs sm:text-sm font-black text-amber-400 tracking-wider uppercase leading-tight">
                    KARWAN-E-RAHIAN-E-NOOR
                  </h1>
                  <p className="text-[10px] text-blue-200 tracking-wider font-semibold uppercase mt-0.5">
                    TRAVEL & TOURISM MANAGEMENT
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="max-w-md mx-auto p-4 space-y-4">
            
            {/* White Rounded Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200/80">
              
              {/* Card Header Title */}
              <div className="text-center pb-4 border-b border-slate-100">
                <h2 className="text-sm font-black text-slate-800 tracking-wider uppercase">
                  AGENT MANAGEMENT PORTAL
                </h2>
                <p className="text-[11px] text-slate-400 font-medium mt-1 leading-snug">
                  Manage affiliated bookings, group visas, ticketing and agency balance ledger
                </p>
              </div>

              {/* 3-Column Square Grid */}
              <div className="grid grid-cols-3 gap-3 pt-5">
                {agentModules.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      className="aspect-square bg-white hover:bg-slate-50 active:scale-95 border border-slate-200/90 rounded-2xl p-2 flex flex-col items-center justify-center text-center shadow-sm transition group"
                    >
                      <div className={`p-3 rounded-2xl mb-1.5 flex items-center justify-center ${item.bg}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 group-hover:text-[#0b2447] tracking-tight">
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
        <footer className="bg-[#0b2447] text-white py-3.5 text-center mt-6">
          <p className="text-[11px] font-medium text-slate-300 tracking-wide">
            <span className="font-bold text-amber-400">KARWAN-E-RAHIAN-E-NOOR</span> © 2026 | All Rights Reserved.
          </p>
        </footer>

      </div>
    </>
  );
}