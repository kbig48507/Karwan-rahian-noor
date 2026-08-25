import '@/styles/globals.css';
import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Layout from '@/components/Layout';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  return (
    <Layout>
      <Component {...pageProps} />
      <PWAInstallPrompt />
    </Layout>
  );
}