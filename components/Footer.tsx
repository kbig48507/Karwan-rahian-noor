import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0b1f3d] text-slate-300 border-t border-[#1b437e] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
          
          <div>
            <span className="font-semibold text-white tracking-wider">
              KARWAN-E-RAHIAN-E-NOOR
            </span>
            <span className="text-slate-400"> &copy; {currentYear} | All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#122b52] px-3.5 py-1.5 rounded-full border border-blue-500/20 text-blue-200">
            <span>Powered by</span>
            <span className="font-bold text-amber-400 tracking-wide">
              Saqqa Software Service
            </span>
          </div>

        </div>
      </div>
    </footer>
  );
}