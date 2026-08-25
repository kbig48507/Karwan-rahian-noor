import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Lock, User, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Query Supabase for matching username and password
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username.trim())
        .eq('password', password.trim())
        .single();

      if (error || !user) {
        setErrorMessage('Invalid username or password. Please try again.');
        setIsLoading(false);
        return;
      }

      // Save user session in localStorage
      localStorage.setItem('auth_user', JSON.stringify(user));

      // Dynamic Role-based Redirection
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'agent') {
        router.push('/agent/dashboard');
      } else if (user.role === 'zair') {
        router.push('/zair/dashboard');
      } else {
        router.push('/');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - Karwan-e-Rahian-e-Noor</title>
      </Head>

      <div className="min-h-[85vh] flex items-center justify-center py-8 px-4 sm:px-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* Header Section */}
          <div className="bg-[#0f2d59] p-6 text-center text-white relative">
            <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-amber-400 bg-white shadow-md mb-3">
              <Image 
                src="/logo.png" 
                alt="Karwan-e-Rahian-e-Noor" 
                fill 
                className="object-cover"
                priority
              />
            </div>
            <h2 className="text-xl font-bold tracking-wide uppercase text-amber-400">
              Karwan-e-Rahian-e-Noor
            </h2>
            <p className="text-xs text-blue-200 mt-1 uppercase tracking-wider">
              Travel & Tourism Management Portal
            </p>
          </div>

          {/* Form Section */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Username Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username or ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-[#0f2d59] focus:border-[#0f2d59] outline-none transition"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-[#0f2d59] focus:border-[#0f2d59] outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#0f2d59] hover:bg-[#163a6f] text-white rounded-lg text-sm font-semibold tracking-wide shadow-md transition disabled:opacity-50 mt-2"
              >
                {isLoading ? (
                  <span>Checking credentials...</span>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          </div>

        </div>
      </div>
    </>
  );
}