'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Globe, Target, MessageSquare, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
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
    <div className="relative min-h-[90vh] overflow-hidden bg-[#fafafa] flex flex-col justify-center">
      
      {/* Subtle Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-100/40 rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[80px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-purple-100/30 rounded-full blur-[90px] opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 py-12 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center min-h-[70vh]">
          
          {/* Left Side: Auth Form */}
          <div className="flex flex-col justify-center max-w-md w-full mx-auto lg:mx-0">
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                Welcome to PrepPilot
              </h1>
              <p className="text-base text-slate-500 font-medium">
                Sign in to build your personalized interview prep kits.
              </p>
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
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-sm transition-all font-medium shadow-sm"
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
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-sm transition-all font-medium shadow-sm"
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

            <p className="text-sm text-slate-500 mt-6 font-medium text-center lg:text-left">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-brand-600 hover:text-brand-700 font-bold hover:underline">
                Register here
              </Link>
            </p>
          </div>

          {/* Right Side: Premium Workflow Visualization */}
          <div className="relative w-full h-[600px] flex items-center justify-center lg:justify-end">
            
            <div className="relative w-full max-w-lg h-full perspective-[1200px]">
              
              {/* Connector SVG Background */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" viewBox="0 0 500 600">
                {/* Curved connecting path down the center */}
                <path 
                  d="M 150 80 C 150 140, 350 120, 350 190 C 350 260, 150 240, 150 310 C 150 380, 350 360, 350 430 C 350 500, 250 480, 250 540" 
                  fill="none" 
                  stroke="#e2e8f0" 
                  strokeWidth="2.5" 
                  strokeDasharray="6,6"
                  className="animate-[dash_25s_linear_infinite]"
                />
              </svg>

              {/* CARD 1: Job Description */}
              <div className="absolute top-[20px] left-[20px] sm:left-[60px] bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-[1.25rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-[240px] z-10 animate-[float_6s_ease-in-out_infinite] hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Job Description</span>
                </div>
                <div className="text-sm font-bold text-slate-900 bg-slate-50 rounded-lg p-2 border border-slate-100">
                  Senior Software Engineer
                </div>
              </div>

              {/* CARD 2: Company Research */}
              <div className="absolute top-[130px] right-[20px] sm:right-[40px] bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-[1.25rem] p-4 shadow-[0_12px_40px_rgb(0,0,0,0.06)] w-[240px] z-20 animate-[float_7s_ease-in-out_infinite_1s] hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Company Research</span>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[13px] font-semibold text-slate-700 bg-slate-50 rounded-lg p-2 border border-slate-100 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" /> Company overview
                  </div>
                  <div className="text-[13px] font-semibold text-slate-700 bg-slate-50 rounded-lg p-2 border border-slate-100 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-brand-400 rounded-full" /> Hiring process
                  </div>
                </div>
              </div>

              {/* CARD 3: Key Requirements */}
              <div className="absolute top-[260px] left-[10px] sm:left-[30px] bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-[1.25rem] p-4 shadow-[0_12px_40px_rgb(0,0,0,0.06)] w-[260px] z-30 animate-[float_6.5s_ease-in-out_infinite_2s] hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                    <Target className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Requirements</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">React</span>
                  <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">Node.js</span>
                  <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">System Design</span>
                </div>
              </div>

              {/* CARD 4: Interview Questions */}
              <div className="absolute top-[370px] right-[10px] sm:right-[30px] bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-[1.25rem] p-4 shadow-[0_12px_40px_rgb(0,0,0,0.06)] w-[250px] z-40 animate-[float_7.5s_ease-in-out_infinite_0.5s] hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Interview Questions</span>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[13px] font-semibold text-slate-700 bg-slate-50 rounded-lg p-2 border border-slate-100">Technical</div>
                  <div className="text-[13px] font-semibold text-slate-700 bg-slate-50 rounded-lg p-2 border border-slate-100">Behavioural</div>
                  <div className="text-[13px] font-semibold text-slate-700 bg-slate-50 rounded-lg p-2 border border-slate-100">System Design</div>
                </div>
              </div>

              {/* CARD 5: Prep Kit */}
              <div className="absolute bottom-[20px] left-[50%] -translate-x-[50%] bg-white/95 backdrop-blur-xl border border-brand-200/60 rounded-[1.25rem] p-5 shadow-[0_20px_50px_rgb(79,70,229,0.12)] w-[280px] z-50 animate-[float_6s_ease-in-out_infinite_1.5s] hover:-translate-y-1 transition-transform">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-extrabold uppercase tracking-widest text-brand-900">Prep Kit Ready</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center bg-slate-50 rounded-xl p-2 border border-slate-100">
                    <div className="text-lg font-bold text-brand-600">18</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Q&A</div>
                  </div>
                  <div className="text-center bg-slate-50 rounded-xl p-2 border border-slate-100">
                    <div className="text-lg font-bold text-brand-600">12</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Cards</div>
                  </div>
                  <div className="text-center bg-slate-50 rounded-xl p-2 border border-slate-100">
                    <div className="text-lg font-bold text-brand-600">5</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Days</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
