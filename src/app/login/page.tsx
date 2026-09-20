'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Globe, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center py-8 px-4">
      {/* Background blobs for the whole page */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[960px] mx-auto flex flex-col md:flex-row rounded-[2rem] bg-white border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden relative z-10"
      >
        {/* Left Side: Auth Form */}
        <div className="w-full md:w-[45%] p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <div className="w-10 h-10 bg-brand-600 rounded-xl mb-5 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome Back</h2>
            <p className="text-sm text-slate-500 font-medium">Sign in to your PrepPilot account.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:bg-white text-sm transition-all font-medium"
                placeholder="candidate@example.com"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:bg-white text-sm transition-all font-medium"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-slate-900 hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:shadow-brand-600/30 transition-all duration-300 disabled:opacity-50 text-sm relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : 'Sign In'}
              </span>
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-6 font-medium">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-brand-600 hover:text-brand-700 font-bold hover:underline">
              Register here
            </Link>
          </p>
        </div>

        {/* Right Side: Beautiful Graphic */}
        <div className="hidden md:flex w-[55%] bg-slate-50 relative p-8 flex-col items-center justify-center overflow-hidden border-l border-slate-100">
          
          {/* Inner ambient glows */}
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-amber-100/40 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-brand-100/40 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.12] mix-blend-overlay pointer-events-none"></div>

          <div className="relative w-full max-w-[320px] h-[360px] flex items-center justify-center">
            
            {/* SVG Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 320 360">
              <path 
                d="M 100 60 C 100 110, 220 120, 220 180 C 220 240, 100 250, 100 300" 
                fill="none" 
                stroke="#cbd5e1" 
                strokeWidth="2" 
                strokeDasharray="5,5" 
                className="animate-[dash_20s_linear_infinite]"
              />
              <circle cx="100" cy="60" r="3" fill="#cbd5e1" />
              <circle cx="220" cy="180" r="3" fill="#cbd5e1" />
              <circle cx="100" cy="300" r="3" fill="#cbd5e1" />
            </svg>

            {/* CARD 1: Job Description */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="absolute top-[35px] left-[15px] bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-2xl p-3.5 shadow-lg shadow-slate-200/20 flex items-center gap-3 z-10 w-[220px] animate-[float_6s_ease-in-out_infinite]"
            >
              <div className="p-2 bg-orange-50 rounded-lg"><FileText className="w-4 h-4 text-orange-600" /></div>
              <div>
                 <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Job Description</div>
                 <div className="text-[13px] text-slate-800 leading-tight font-semibold">Senior Software Engineer</div>
              </div>
            </motion.div>

            {/* CARD 2: Company Research */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="absolute top-[155px] right-[15px] bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-2xl p-3.5 shadow-lg shadow-slate-200/20 flex items-center gap-3 z-20 w-[220px] animate-[float_7s_ease-in-out_infinite_1s]"
            >
              <div className="p-2 bg-indigo-50 rounded-lg"><Globe className="w-4 h-4 text-indigo-600" /></div>
              <div>
                 <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Company Research</div>
                 <div className="text-[13px] text-slate-800 leading-tight font-semibold">Website + Hiring Process</div>
              </div>
            </motion.div>

            {/* CARD 3: Interview Prep Kit */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="absolute top-[275px] left-[15px] bg-white/95 backdrop-blur-md border border-brand-200/60 rounded-2xl p-3.5 shadow-lg shadow-brand-500/10 flex items-center gap-3 z-30 w-[250px] animate-[float_6.5s_ease-in-out_infinite_2s]"
            >
              <div className="p-2 bg-emerald-50 rounded-lg"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></div>
              <div>
                 <div className="text-[10px] uppercase tracking-wider text-brand-500 font-bold mb-0.5">Interview Prep Kit</div>
                 <div className="text-[12px] text-slate-800 leading-tight font-medium">Questions &middot; Flashcards &middot; Plan</div>
              </div>
            </motion.div>

          </div>

          <div className="absolute bottom-6 w-full text-center">
            <p className="text-[13px] font-medium text-slate-400">From job description to interview-ready.</p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
