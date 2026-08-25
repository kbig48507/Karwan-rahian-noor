import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
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

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', trimmedUser)
        .eq('password', trimmedPass)
        .single();

      if (error || !data) {
        throw new Error('Invalid username or password. Please try again.');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('krn_user', JSON.stringify(data));
      }

      if (data.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (data.role === 'agent') {
        router.push('/agent/dashboard');
      } else {
        router.push('/zair/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authenticate. Please verify credentials.');
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

      {/* Modern Gradient Background */}
      <div className="min-h-screen w-full bg-gradient-to-b from-[#081528] via-[#0d2240] to-[#050f1d] flex items-center justify-center p-4 sm:p-6">
        
        {/* Main Floating Card Container */}
        <div className="w-full max-w-[430px] rounded-[36px] overflow-hidden shadow-2xl border border-white/10 flex flex-col">
          
          {/* Top Navy Section with Logo & Brand Details */}
          <div className="bg-[#1b2b48] pt-10 pb-8 px-6 flex flex-col items-center text-center">
            
            {/* Rounded Brand Logo Badge */}
            <div className="w-24 h-24 rounded-3xl bg-white p-2 shadow-lg flex items-center justify-center border border-white/20 mb-5">
              <div className="relative w-full h-full rounded-2xl overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="Karwan-e-Rahian-e-Noor Logo"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </div>

            <h1 className="text-xl sm:text-[22px] font-black text-white tracking-tight leading-tight uppercase">
              Karwan-e-Rahian-e-Noor
            </h1>
            <p className="text-xs font-semibold text-blue-200/80 mt-1 tracking-wide">
              Travel & Tourism Management Portal
            </p>
          </div>

          {/* Bottom Clean White Form Section */}
          <div className="bg-white p-7 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  Portal Sign In
                </h2>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                  Enter your Username / Reg No & password to continue
                </p>
              </div>

              {errorMsg && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                    USERNAME / REG NO
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Admin, Agent ID, Zair ID"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#1b2b48] focus:ring-4 focus:ring-[#1b2b48]/10 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                    PASSWORD
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-4 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#1b2b48] focus:ring-4 focus:ring-[#1b2b48]/10 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-700 p-1 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-4 bg-[#235347] hover:bg-[#1b4339] active:scale-[0.99] text-white font-bold text-sm tracking-wide rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Sign In to Portal</span>
                  )}
                </button>
              </form>
            </div>

            {/* Clean Footer Branding */}
            <div className="mt-8 pt-4 border-t border-slate-100 text-center">
              <p className="text-[11px] font-semibold text-slate-400">
                Powered by Saqaa Software Service © 2026
              </p>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}