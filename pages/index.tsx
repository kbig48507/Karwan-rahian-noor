import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <>
      <Head>
        <title>Karwan-e-Rahian-e-Noor</title>
        <meta name="description" content="Travel & Tourism Management Portal" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-3 text-white">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold tracking-wider text-slate-300">پورٹل پر ری ڈائریکٹ ہو رہا ہے...</p>
        </div>
      </div>
    </>
  );
}