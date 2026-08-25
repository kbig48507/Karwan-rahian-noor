import '@/styles/globals.css';
import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('PWA Service Worker Registered'))
        .catch((err) => console.error('Service Worker Registration Failed:', err));
    }
  }, []);

  return (
    <>
      <Head>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" 
        />
        <title>Karwan-e-Rahian-e-Noor</title>
      </Head>

      <main className="min-h-screen flex flex-col">
        <Component {...pageProps} />
      </main>

      {/* PWA Auto Install Prompt */}
      <PWAInstallPrompt />
    </>
  );
}