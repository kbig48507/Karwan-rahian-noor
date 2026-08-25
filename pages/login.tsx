import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { User, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const trimmedUser = username.trim();
      const trimmedPass = password.trim();

      // Check users table in Supabase
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', trimmedUser)
        .eq('password', trimmedPass)
        .single();

      if (error || !data) {
        throw new Error('غلط یوزر نیم یا پاس ورڈ درج کیا گیا ہے۔');
      }

      // Store basic session
      if (typeof window !== 'undefined') {
        localStorage.setItem('krn_user', JSON.stringify(data));
      }

      // Redirect based on role
      if (data.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (data.role === 'agent') {
        router.push('/agent/dashboard');
      } else {
        router.push('/zair/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'لاگ ان کرنے میں مسئلہ پیش آیا ہے۔');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Karwan-e-Rahian-e-Noor</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>

      {/* Full screen wrapper */}
      <div className="min-h-screen w-full bg-[#0f2d59] flex flex-col justify-between p-0 sm:p-4 selection:bg-amber-400 selection:text-slate-900">
        
        {/* Top Header & Branding */}
        <div className="pt-8 pb-6 px-6 flex flex-col items-center text-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white p-1.5 shadow-xl flex items-center justify-center border-2 border-amber-400/60 mb-3">
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src="/logo.png"
                alt="Karwan-e-Rahian-e-Noor Logo"
                fill
                priority
                className="object-contain"
              />
            </div>
          </div>
          
          <h1 className="text-xl sm:text-2xl font-black text-amber-400 tracking-wider uppercase drop-shadow-sm">
            KARWAN-E-RAHIAN-E-NOOR
          </h1>
          <p className="text-[11px] sm:text-xs font-semibold text-blue-200 tracking-widest uppercase mt-0.5">
            TRAVEL & TOURISM MANAGEMENT PORTAL
          </p>
        </div>

        {/* Main Login Form Area */}
        <div className="w-full max-w-md mx-auto bg-white rounded-t-[32px] sm:rounded-3xl shadow-2xl p-6 sm:p-8 flex-1 sm:flex-none flex flex-col justify-between">
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-lg font-bold text-slate-800">سسٹم لاگ ان</h2>
              <p className="text-xs text-slate-500">اپنا یوزر نیم اور پاس ورڈ درج کریں</p>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  USERNAME OR ID
                </label>
                <div className="relative flex items-center">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#0f2d59] focus:ring-2 focus:ring-[#0f2d59]/20 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  PASSWORD
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#0f2d59] focus:ring-2 focus:ring-[#0f2d59]/20 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 bg-[#0f2d59] hover:bg-[#163a6f] active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Bottom Footer Credit */}
          <div className="mt-8 pt-4 border-t border-slate-100 text-center">
            <p className="text-[10px] font-medium text-slate-400 tracking-wider uppercase">
              Powered by <span className="font-bold text-[#0f2d59]">Saqaa Software Services</span>
            </p>
          </div>
        </div>

      </div>
    </>
  );
}