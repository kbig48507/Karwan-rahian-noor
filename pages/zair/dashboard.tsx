import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LogOut, 
  UserCheck, 
  Wallet, 
  FileCheck2, 
  Plane, 
  Receipt,
  ArrowRight
} from 'lucide-react';

export default function ZairDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('krn_user');
    }
    router.push('/login');
  };

  const zairModules = [
    { 
      title: 'My Profile', 
      desc: 'Review personal & passport registration data',
      href: '/zair/profile', 
      icon: UserCheck, 
      bg: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
      badge: 'Profile'
    },
    { 
      title: 'My Balance', 
      desc: 'Track package fees, paid amounts & remaining dues',
      href: '/zair/balance', 
      icon: Wallet, 
      bg: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white',
      badge: 'Finance'
    },
    { 
      title: 'My Visa', 
      desc: 'Check Iran, Iraq & Syria visa approval status',
      href: '/zair/visa', 
      icon: FileCheck2, 
      bg: 'bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white',
      badge: 'Documents'
    },
    { 
      title: 'My Ticket', 
      desc: 'View flight schedules, airline seats & PNR records',
      href: '/zair/ticket', 
      icon: Plane, 
      bg: 'bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white',
      badge: 'Flights'
    },
    { 
      title: 'My Ledger', 
      desc: 'Complete statement of account & receipt history',
      href: '/zair/ledger', 
      icon: Receipt, 
      bg: 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
      badge: 'Receipts'
    },
  ];

  return (
    <>
      <Head>
        <title>Zair Portal - Karwan-e-Rahian-e-Noor</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
        
        {/* Top Header Bar */}
        <div>
          <header className="bg-[#0b2447] text-white px-4 sm:px-8 py-3.5 shadow-md">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
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

          {/* Responsive Main Container */}
          <main className="max-w-md md:max-w-4xl lg:max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
            
            <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200/80">
              
              {/* Card Header */}
              <div className="text-center md:text-left pb-4 sm:pb-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <h2 className="text-sm sm:text-xl font-black text-slate-800 tracking-wider uppercase">
                    PILGRIM / ZAIR DASHBOARD
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-1">
                    View verified journey details, visa records, flight tickets and account balance
                  </p>
                </div>
                <span className="hidden md:inline-flex px-3 py-1 bg-amber-50 text-amber-700 font-bold text-xs rounded-full border border-amber-200">
                  Zair Active Portal
                </span>
              </div>

              {/* Grid: 3 columns on mobile, 3 wide cards on desktop */}
              <div className="grid grid-cols-3 md:grid-cols-3 gap-3 sm:gap-5 pt-5 sm:pt-6">
                {zairModules.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      className="bg-white hover:bg-slate-50 active:scale-95 border border-slate-200/90 rounded-2xl p-2 sm:p-6 flex flex-col items-center md:items-start text-center md:text-left shadow-sm hover:shadow-md transition-all group relative"
                    >
                      <div className="flex items-center justify-between w-full mb-1.5 sm:mb-4">
                        <div className={`p-3 sm:p-4 rounded-2xl flex items-center justify-center transition-all ${item.bg}`}>
                          <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                        </div>
                        <ArrowRight className="hidden md:block w-5 h-5 text-slate-300 group-hover:text-[#0b2447] group-hover:translate-x-1 transition-all" />
                      </div>

                      <span className="text-[11px] sm:text-base font-bold text-slate-800 group-hover:text-[#0b2447] tracking-tight">
                        {item.title}
                      </span>
                      
                      <p className="hidden md:block text-xs text-slate-400 font-normal mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </Link>
                  );
                })}
              </div>

            </div>
          </main>
        </div>

        {/* Footer */}
        <footer className="bg-[#0b2447] text-white py-4 text-center mt-6">
          <p className="text-[11px] sm:text-xs font-medium text-slate-300 tracking-wide">
            <span className="font-bold text-amber-400">KARWAN-E-RAHIAN-E-NOOR</span> © 2026 | All Rights Reserved.
          </p>
        </footer>

      </div>
    </>
  );
}