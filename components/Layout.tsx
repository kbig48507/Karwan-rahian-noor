import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}