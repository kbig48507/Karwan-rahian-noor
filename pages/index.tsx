import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user session exists
    const storedUser = localStorage.getItem('auth_user');

    if (!storedUser) {
      router.replace('/login');
    } else {
      const user = JSON.parse(storedUser);
      if (user.role === 'admin') router.replace('/admin/dashboard');
      else if (user.role === 'agent') router.replace('/agent/dashboard');
      else if (user.role === 'zair') router.replace('/zair/dashboard');
      else router.replace('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-[#0f2d59] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium text-slate-600">Redirecting to login portal...</p>
      </div>
    </div>
  );
}