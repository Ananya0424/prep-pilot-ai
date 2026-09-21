'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, Globe, Calendar, Upload, Loader2, ArrowRight, AlertTriangle, CheckCircle2, Circle, Sparkles, Briefcase } from 'lucide-react';

export default function CreateKitPage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [daysAvailable, setDaysAvailable] = useState(7);
  const [generating, setGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [bulkStatus, setBulkStatus] = useState<string>('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!jobDescription.trim() || !companyUrl.trim()) {
      setError('Please provide both a Job Description and Company Website URL.');
      return;
    }

    setGenerating(true);
    setProgressStep(0); 

    const timer1 = setTimeout(() => setProgressStep(1), 3000); 
    const timer2 = setTimeout(() => setProgressStep(2), 6000); 
    const timer3 = setTimeout(() => setProgressStep(3), 9000); 
    const timer4 = setTimeout(() => setProgressStep(4), 12000); 
    const timer5 = setTimeout(() => setProgressStep(5), 15000); 

    try {
      const res = await fetch('/api/kits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription,
          companyUrl,
          daysAvailable,
        }),
      });

      // Safely parse response - server might return HTML on crash
      let data: any = {};
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        // Extract meaningful error from HTML or plain text
        const match = text.match(/"([^"]{10,200})"/);
        throw new Error(match ? match[1] : 'Server error. Please try again in a moment.');
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate kit');
      }

      if (data.id) {
        if (data.kit) {
          try { sessionStorage.setItem(`kit_${data.id}`, JSON.stringify(data.kit)); } catch (e) {}
        }
        router.push(`/dashboard/kits/${data.id}`);
      }
    } catch (err: any) {
      setError(err?.message || 'Generation failed. Please check your inputs and try again.');
      setGenerating(false);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();

      // If text/markdown file, auto-populate the textarea
      if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        setJobDescription(text);
        setBulkStatus('✓ Job description loaded from text file!');
        return;
      }

      // JSON parsing for Appendix B cases array
      const payload = JSON.parse(text);
      if (Array.isArray(payload)) {
        setBulkStatus(`✓ Loaded ${payload.length} job description case(s) from JSON.`);
        if (payload.length > 0 && payload[0].jd) {
          setJobDescription(payload[0].jd);
          if (payload[0].company_url) setCompanyUrl(payload[0].company_url);
          if (payload[0].days) setDaysAvailable(payload[0].days);
        }
      } else if (payload.jd) {
        setJobDescription(payload.jd);
        if (payload.company_url) setCompanyUrl(payload.company_url);
        if (payload.days) setDaysAvailable(payload.days);
        setBulkStatus('✓ Loaded job description case from JSON!');
      } else {
        throw new Error('Invalid JSON format');
      }
    } catch (err: any) {
      setBulkStatus('⚠️ Error reading file. Upload a .txt file or valid JSON array.');
    }
  };

  const generationSteps = [
    'Analyzing job description',
    'Researching company context',
    'Finding hiring insights',
    'Generating interview questions',
    'Creating flashcards',
    'Building study schedule'
  ];

  return (
    <div className="max-w-[800px] mx-auto pb-20 px-4 sm:px-6 lg:px-8 pt-8">
      <header className="mb-8">
        <h1 className="text-[24px] font-bold text-slate-900 tracking-tight mb-2">Create New Prep Kit</h1>
        <p className="text-[14px] text-slate-500 font-medium">Paste the job description and let AI build your personalized interview preparation plan.</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[24px] p-6 sm:p-10 shadow-sm border border-indigo-100 relative group transition-all duration-500 overflow-hidden"
      >
        <div className="absolute inset-0 rounded-[24px] ring-1 ring-inset ring-indigo-500/10 pointer-events-none group-hover:ring-indigo-500/20 transition-all duration-500"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
        
        <div className="relative z-10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm flex items-start space-x-3 text-red-700 font-medium">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {generating ? (
            <div className="py-12 max-w-md mx-auto">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Building your Prep Kit...</h3>
                  <p className="text-sm text-slate-500 font-medium">This usually takes about 15-20 seconds.</p>
                </div>
              </div>

              <div className="space-y-4 ml-2">
                {generationSteps.map((step, index) => {
                  const isCompleted = progressStep > index;
                  const isCurrent = progressStep === index;
                  
                  return (
                    <div key={index} className="flex items-center gap-3">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                      ) : isCurrent ? (
                        <div className="relative flex items-center justify-center w-5 h-5">
                           <Circle className="w-5 h-5 text-indigo-200" />
                           <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-pulse absolute" />
                        </div>
                      ) : (
                        <Circle className="w-5 h-5 text-slate-200" />
                      )}
                      <span className={`text-[14px] font-medium ${isCompleted ? 'text-slate-700' : isCurrent ? 'text-indigo-700 font-semibold' : 'text-slate-400'}`}>
                        {step}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="space-y-0">

              {/* Section 1: Job Description */}
              <div className="pb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600">01</span>
                  <span className="text-[13px] font-bold text-slate-800">Job Description</span>
                  <div className="flex-1 h-px bg-slate-100 ml-1" />
                </div>
                <textarea
                  required
                  rows={6}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job posting text here..."
                  className="w-full px-4 py-3.5 bg-[#F8F9FF] border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-[14px] font-medium focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none"
                />
              </div>

              {/* Section 2: Company Details */}
              <div className="pb-6 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600">02</span>
                  <span className="text-[13px] font-bold text-slate-800">Company & Timeline</span>
                  <div className="flex-1 h-px bg-slate-100 ml-1" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Company Website URL
                    </label>
                    <input
                      type="url"
                      required
                      value={companyUrl}
                      onChange={(e) => setCompanyUrl(e.target.value)}
                      placeholder="https://company.com"
                      className="w-full px-4 py-3 bg-[#F8F9FF] border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-[14px] font-medium focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      Days Until Interview
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={1} max={60} required
                        value={daysAvailable}
                        onChange={(e) => setDaysAvailable(Number(e.target.value))}
                        className="w-full pl-4 pr-14 py-3 bg-[#F8F9FF] border border-slate-200 rounded-xl text-slate-900 text-[14px] font-medium focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] text-slate-400 font-semibold pointer-events-none">days</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Generate */}
              <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-[14px] font-bold rounded-xl transition-all shadow-sm shadow-indigo-600/25 hover:shadow-md hover:shadow-indigo-600/30"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Prep Kit
                </button>
                <p className="text-[12px] text-slate-400 font-medium max-w-xs leading-relaxed">
                  AI will research the company, analyze requirements, generate questions and create your study schedule.
                </p>
              </div>

              {/* Section 4: Bulk Upload */}
              <div className="border-t border-slate-100 pt-6 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <Upload className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Multiple Roles — Bulk Upload</span>
                  <div className="flex-1 h-px bg-slate-100 ml-1" />
                </div>
                <p className="text-[12px] text-slate-500 mb-3 font-medium">
                  Upload a <strong>.json</strong> array of job description cases (or a <strong>.txt</strong> file) to auto-fill your form.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <input
                    type="file"
                    accept=".json,.txt,.md"
                    onChange={handleBulkUpload}
                    className="text-[12px] text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[12px] file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-indigo-50 hover:file:text-indigo-700 cursor-pointer transition-colors"
                  />
                  {bulkStatus && (
                    <span className="text-[12px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl">
                      {bulkStatus}
                    </span>
                  )}
                </div>
                <div className="mt-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11px] text-slate-500 font-mono">
                  <span className="font-bold text-slate-700 block mb-1 font-sans">JSON Format Example (Appendix B Spec):</span>
                  <code>{`[ { "id": "case-01", "jd": "Job description text...", "company_url": "https://company.com", "days": 7 } ]`}</code>
                </div>
              </div>

            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
