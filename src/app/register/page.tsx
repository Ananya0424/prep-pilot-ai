'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, Brain, LayoutTemplate } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center">
      {/* Background blobs for the whole page */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl mx-auto flex flex-col md:flex-row rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden relative z-10"
      >
        {/* Left Side: Auth Form */}
        <div className="w-full md:w-1/2 p-10 sm:p-16 flex flex-col justify-center">
          <div className="mb-10">
            <div className="w-10 h-10 bg-brand-600 rounded-xl mb-6 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">Create Account</h2>
            <p className="text-slate-500 font-medium">Start building your personalised prep kits.</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:bg-white text-sm transition-all font-medium"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:bg-white text-sm transition-all font-medium"
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
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:bg-white text-sm transition-all font-medium"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4 bg-slate-900 hover:bg-brand-600 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:shadow-brand-600/30 transition-all duration-300 disabled:opacity-50 text-sm relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : 'Register'}
              </span>
            </button>
          </form>

          <p className="text-sm text-slate-500 mt-8 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 hover:text-brand-700 font-bold hover:underline">
              Login here
            </Link>
          </p>
        </div>

        {/* Right Side: Beautiful Graphic */}
        <div className="hidden md:flex w-1/2 bg-slate-50 relative p-12 flex-col items-center justify-center overflow-hidden border-l border-slate-100">
          
          {/* Inner ambient glows */}
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-amber-100/50 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-brand-100/50 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none"></div>

          <div className="relative w-full max-w-sm aspect-[4/5] flex items-center justify-center">
            
            {/* SVG Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 400 500">
              <path 
                d="M 280 120 L 150 120 L 150 250" 
                fill="none" 
                stroke="#cbd5e1" 
                strokeWidth="2" 
                strokeDasharray="6,6" 
                className="animate-[dash_20s_linear_infinite]"
              />
              <path 
                d="M 150 250 L 150 380 L 250 380" 
                fill="none" 
                stroke="#cbd5e1" 
                strokeWidth="2" 
                strokeDasharray="6,6"
                className="animate-[dash_20s_linear_infinite]"
              />
              <circle cx="280" cy="120" r="4" fill="#cbd5e1" />
              <circle cx="150" cy="250" r="4" fill="#cbd5e1" />
              <circle cx="250" cy="380" r="4" fill="#cbd5e1" />
            </svg>

            {/* Nodes */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="absolute top-[85px] right-[20px] bg-orange-50/90 backdrop-blur-md border border-orange-200/60 text-orange-800 px-6 py-4 rounded-2xl shadow-lg shadow-orange-500/5 flex items-center gap-3 font-semibold text-sm z-10"
            >
              <div className="p-2 bg-orange-100 rounded-lg"><FileText className="w-4 h-4 text-orange-600" /></div>
              Parse Job Desc
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="absolute top-[215px] left-[0px] bg-brand-50/90 backdrop-blur-md border border-brand-200/60 text-brand-800 px-6 py-4 rounded-2xl shadow-lg shadow-brand-500/5 flex items-center gap-3 font-semibold text-sm z-10"
            >
              <div className="p-2 bg-brand-100 rounded-lg"><Brain className="w-4 h-4 text-brand-600" /></div>
              PrepPilot Engine
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="absolute top-[345px] right-[20px] bg-emerald-50/90 backdrop-blur-md border border-emerald-200/60 text-emerald-800 px-6 py-4 rounded-2xl shadow-lg shadow-emerald-500/5 flex items-center gap-3 font-semibold text-sm z-10"
            >
              <div className="p-2 bg-emerald-100 rounded-lg"><LayoutTemplate className="w-4 h-4 text-emerald-600" /></div>
              Generate Kits
            </motion.div>

          </div>

          <div className="absolute bottom-10 text-center">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Automate your prep with AI</h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">Turn any job description into an interview masterclass.</p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
