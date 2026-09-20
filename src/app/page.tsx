import Link from 'next/link';
import { FileText, Globe, Target, MessageSquare, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-[90vh] overflow-hidden bg-[#fafafa] flex flex-col justify-center">
      
      {/* Subtle Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-100/40 rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[80px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-purple-100/30 rounded-full blur-[90px] opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 py-12 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center min-h-[70vh]">
          
          {/* Left Side: Hero Content */}
          <div className="flex flex-col justify-center max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
              Turn any job description <br className="hidden sm:block" />
              into interview-ready prep <br className="hidden sm:block" />
              <span className="text-brand-600 bg-brand-50/50 rounded-xl px-2 inline-block mt-2">with AI</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-500 mb-10 leading-relaxed font-medium max-w-xl">
              Research the company, uncover key requirements, practise likely questions, and follow a personalised study plan.
            </p>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link 
                href="/register"
                className="group px-8 py-4 bg-slate-900 hover:bg-brand-600 text-white font-bold rounded-2xl shadow-lg shadow-slate-900/10 hover:shadow-brand-600/25 transition-all duration-300 flex items-center justify-center gap-2 text-base w-full sm:w-auto"
              >
                <span>Get Started for Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link 
                href="/login"
                className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-2xl shadow-sm transition-all duration-300 flex items-center justify-center text-base w-full sm:w-auto"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-16 flex items-center gap-3 text-sm font-bold text-slate-400 uppercase tracking-widest">
              <span>Research</span>
              <span className="text-slate-300">→</span>
              <span>Practise</span>
              <span className="text-slate-300">→</span>
              <span>Prepare</span>
            </div>
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
