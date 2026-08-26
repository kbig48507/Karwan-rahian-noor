import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();

  if (router.pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col justify-between selection:bg-amber-400 selection:text-slate-900">
      <Header />
      
      {/* Responsive Wrapper: Mobile gets compact width, Desktop gets full wide container */}
      <main className="flex-1 w-full max-w-md md:max-w-4xl lg:max-w-6xl mx-auto px-4 py-4 sm:py-6 flex flex-col justify-center">
        {children}
      </main>

      <Footer />
    </div>
  );
}