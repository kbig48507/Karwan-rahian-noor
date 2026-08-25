import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#0b2447] text-white py-2.5 px-4 text-center flex-shrink-0 border-t border-white/10">
      <div className="max-w-md mx-auto flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
        <p className="text-[10px] sm:text-xs font-medium text-slate-300 tracking-wide">
          <span className="font-bold text-amber-400">KARWAN-E-RAHIAN-E-NOOR</span> © 2026
        </p>
        <span className="hidden sm:inline text-slate-500">|</span>
        <p className="text-[10px] sm:text-xs font-semibold text-blue-200 tracking-wider">
          Powered by Saqaa Software Service
        </p>
      </div>
    </footer>
  );
}