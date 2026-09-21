'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, Building2, Target, MessageSquare, Calendar, Sparkles, User } from 'lucide-react';

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
    <div className="min-h-screen fixed inset-0 z-[100] bg-[#FAFAFC] overflow-y-auto lg:overflow-hidden font-sans flex flex-col">
      {/* Background Gradients */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[#EEF2FF] via-[#F8FAFC] to-transparent opacity-60 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-brand-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute top-[20%] left-[10%] w-2 h-2 rounded-full bg-brand-400/40 blur-[1px]" />
      <div className="absolute top-[40%] right-[20%] w-1.5 h-1.5 rounded-full bg-purple-400/40 blur-[1px]" />
      <div className="absolute bottom-[30%] left-[15%] w-2.5 h-2.5 rounded-full bg-blue-400/30 blur-[2px]" />

      {/* Header */}
      <header className="w-full px-6 py-2 lg:px-10 lg:py-3 relative z-10 flex items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            P
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">
            PrepPilot
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 lg:px-10 pt-2 lg:pt-2 pb-6 flex items-start relative z-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start mt-0">
          
          {/* Left Side: Hero Content */}
          <div className="lg:col-span-7 flex flex-col">
            
            <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 w-fit">
              <Sparkles className="w-3 h-3 text-brand-600" />
              <span className="text-[10px] font-bold tracking-[0.1em] text-brand-600 uppercase">
                AI-Powered Interview Preparation
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[44px] xl:text-[52px] font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-4">
              Your Personalized<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-purple-500 to-pink-500">Interview Prep Kit</span><br />
              with AI
            </h1>
            
            <p className="text-base lg:text-lg text-slate-500 font-medium leading-relaxed max-w-2xl mb-8">
              Turn any job description and company website into a complete interview preparation kit — with research, tailored questions, flashcards and a day-by-day study plan.
            </p>
            
            {/* 4 Feature Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 max-w-2xl">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 mb-1">Company Research</h3>
                  <p className="text-sm text-slate-500 leading-snug font-medium">Understand the company, its culture and hiring process</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 mb-1">Role Analysis</h3>
                  <p className="text-sm text-slate-500 leading-snug font-medium">Identify key skills, responsibilities and expectations</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 mb-1">Smart Questions</h3>
                  <p className="text-sm text-slate-500 leading-snug font-medium">Role-specific and behavioral interview questions</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900 mb-1">Study Schedule</h3>
                  <p className="text-sm text-slate-500 leading-snug font-medium">Personalized preparation plan based on your timeline</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Side: Registration Card */}
          <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-[460px] bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-[20px] p-5 lg:p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
              
              <div className="mb-5">
                <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-xl shadow-sm mb-3 hidden sm:flex">
                  P
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight mb-1">
                  Create your Account
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Sign up to start building your personalized prep kits.
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-medium flex items-center gap-2 shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleRegister} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 text-sm transition-all font-medium shadow-sm hover:border-slate-300"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 text-sm transition-all font-medium shadow-sm hover:border-slate-300"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-bold text-slate-600">Password</label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 text-sm transition-all font-medium shadow-sm hover:border-slate-300"
                      placeholder="Create a password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 mt-1 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg shadow-[0_8px_20px_-8px_rgba(79,70,229,0.6)] hover:shadow-[0_12px_25px_-8px_rgba(79,70,229,0.7)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 text-sm relative group flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Register <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center gap-2.5">
                <p className="text-[11px] text-slate-500 font-medium text-center">
                  Already have an account?
                </p>
                <Link 
                  href="/" 
                  className="w-full py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg shadow-sm transition-all text-[13px] text-center flex items-center justify-center gap-2"
                >
                  Login Instead
                </Link>
              </div>

            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
