import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { LogOut } from 'lucide-react';

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('krn_user');
    }
    router.push('/login');
  };

  return (
    <header className="bg-[#0b2447] text-white px-4 py-2.5 sm:py-3.5 shadow-md flex-shrink-0">
      <div className="max-w-md md:max-w-4xl lg:max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => router.back()}>
          <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow flex-shrink-0 flex items-center justify-center border border-amber-400">
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
            <p className="text-[9px] sm:text-xs text-blue-200 tracking-wider font-semibold uppercase">
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
  );
}