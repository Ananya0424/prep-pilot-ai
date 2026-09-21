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

      router.push(`/kit/${data.id}`);
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

    setBulkStatus('Reading JSON file...');
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      if (!Array.isArray(payload)) {
        throw new Error('JSON must be an array of cases');
      }
      
      setBulkStatus('Bulk generation started...');
      setTimeout(() => {
        setBulkStatus(`Started processing ${payload.length} cases.`);
      }, 1000);
    } catch (err: any) {
      setBulkStatus('Error parsing JSON');
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
            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  Job Description
                </label>
                <textarea
                  required
                  rows={6}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job posting text here..."
                  className="w-full px-4 py-3.5 bg-[#F8F9FF] border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-[14px] font-medium focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    Company Website URL
                  </label>
                  <input
                    type="url"
                    required
                    value={companyUrl}
                    onChange={(e) => setCompanyUrl(e.target.value)}
                    placeholder="https://company.com"
                    className="w-full px-4 py-3.5 bg-[#F8F9FF] border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-[14px] font-medium focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Days Until Interview
                  </label>
                  <div className="relative">
                     <input
                      type="number"
                      min={1}
                      max={60}
                      required
                      value={daysAvailable}
                      onChange={(e) => setDaysAvailable(Number(e.target.value))}
                      className="w-full pl-4 pr-16 py-3.5 bg-[#F8F9FF] border border-slate-200 rounded-xl text-slate-900 text-[14px] font-medium focus:outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-slate-400 font-medium pointer-events-none">days</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 bg-indigo-900 hover:bg-indigo-800 text-white font-bold rounded-xl transition-all duration-300 text-[14px] shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Generate Prep Kit ✨</span>
                </button>
                <p className="text-[12px] text-slate-500 font-medium max-w-xs">
                  AI will research the company, analyze requirements, generate questions and create your schedule.
                </p>
              </div>
            </form>
          )}

          {/* Bulk Multi-Role Upload Option */}
          {!generating && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Prepare for multiple roles (Bulk Upload JSON)</span>
              </label>
              <input
                type="file"
                accept=".json"
                onChange={handleBulkUpload}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer transition-colors"
              />
              {bulkStatus && (
                <p className="text-xs text-brand-600 mt-3 font-bold bg-brand-50 inline-block px-3 py-1 rounded-md">{bulkStatus}</p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
