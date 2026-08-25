import React, { ReactNode } from 'react';
import { useRouter } from 'next/router';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();

  // Don't show header/footer on login page
  if (router.pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="h-screen w-full bg-[#f1f5f9] flex flex-col justify-between overflow-hidden">
      <Header />
      <main className="flex-1 max-w-md md:max-w-4xl lg:max-w-5xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-center overflow-y-auto">
        {children}
      </main>
      <Footer />
    </div>
  );
}