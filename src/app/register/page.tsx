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
    <div className="min-h-screen relative z-[100] bg-[#FAFAFC] overflow-y-auto font-sans flex flex-col">
      {/* Background Gradients */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-[#EEF2FF] via-[#F8FAFC] to-transparent opacity-60 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-brand-400/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-400/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute top-[20%] left-[10%] w-2 h-2 rounded-full bg-brand-400/40 blur-[1px]" />
      <div className="absolute top-[40%] right-[20%] w-1.5 h-1.5 rounded-full bg-purple-400/40 blur-[1px]" />
      <div className="absolute bottom-[30%] left-[15%] w-2.5 h-2.5 rounded-full bg-blue-400/30 blur-[2px]" />

      {/* Header */}
      <header className="w-full px-6 py-3 lg:px-10 lg:py-4 relative z-10 flex items-center shrink-0">
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
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 lg:px-10 py-4 lg:py-6 flex items-center relative z-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Side: Hero Content */}
          <div className="lg:col-span-6 flex flex-col pr-0 lg:pr-4">
            
            <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 w-fit">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[10px] font-extrabold tracking-[0.1em] text-indigo-600 uppercase">
                AI-Powered Interview Preparation
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[38px] xl:text-[42px] font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-3">
              Your Personalized <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">Interview Prep Kit</span> with AI
            </h1>
            
            <p className="text-[14px] sm:text-[15px] text-slate-500 font-medium leading-relaxed max-w-xl mb-6">
              Turn any job description and company website into a complete interview preparation kit — with research, tailored questions, flashcards and a day-by-day study plan.
            </p>
            
            {/* 4 Feature Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-xl">
              <div className="flex items-start gap-3 bg-white/80 backdrop-blur-sm border border-slate-200/80 p-3 rounded-2xl shadow-sm">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Building2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-slate-900">Company Research</h3>
                  <p className="text-[12px] text-slate-500 leading-snug font-medium mt-0.5">Understand company culture & hiring process</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/80 backdrop-blur-sm border border-slate-200/80 p-3 rounded-2xl shadow-sm">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Target className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-slate-900">Role Analysis</h3>
                  <p className="text-[12px] text-slate-500 leading-snug font-medium mt-0.5">Extract key skills & must-have expectations</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/80 backdrop-blur-sm border border-slate-200/80 p-3 rounded-2xl shadow-sm">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <MessageSquare className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-slate-900">Smart Questions</h3>
                  <p className="text-[12px] text-slate-500 leading-snug font-medium mt-0.5">Role-specific & behavioral questions</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-white/80 backdrop-blur-sm border border-slate-200/80 p-3 rounded-2xl shadow-sm">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-slate-900">Study Schedule</h3>
                  <p className="text-[12px] text-slate-500 leading-snug font-medium mt-0.5">Daily study plan tailored to your timeline</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Side: Registration Card */}
          <div className="lg:col-span-6 w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-[440px] bg-white border border-slate-200 rounded-[24px] p-6 sm:p-7 shadow-xl shadow-slate-200/50">
              
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
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
                  className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs font-medium flex items-center gap-2 shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 text-sm transition-all font-medium shadow-sm hover:border-slate-300"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 text-sm transition-all font-medium shadow-sm hover:border-slate-300"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-slate-600">Password</label>
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
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 text-sm transition-all font-medium shadow-sm hover:border-slate-300"
                      placeholder="Create a password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 mt-1 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-[0_8px_20px_-8px_rgba(79,70,229,0.6)] hover:shadow-[0_12px_25px_-8px_rgba(79,70,229,0.7)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 text-sm relative group flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Already have an account?
                </span>
                <Link 
                  href="/" 
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
                >
                  Login Instead →
                </Link>
              </div>

            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
