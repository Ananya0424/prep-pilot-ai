'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, FileText, Globe, Calendar, Upload, Loader2, ArrowRight, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [daysAvailable, setDaysAvailable] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [error, setError] = useState<string>('');

  const [savedKits, setSavedKits] = useState<any[]>([]);
  const [loadingKits, setLoadingKits] = useState(true);

  // Bulk Upload File state
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkStatus, setBulkStatus] = useState<string>('');

  useEffect(() => {
    fetchKits();
  }, []);

  const fetchKits = async () => {
    try {
      const res = await fetch('/api/kits');
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (data.kits) {
        setSavedKits(data.kits);
      }
    } catch (err) {
      // Ignore
    } finally {
      setLoadingKits(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!jobDescription.trim() || !companyUrl.trim()) {
      setError('Please provide both a Job Description and Company Website URL.');
      return;
    }

    setGenerating(true);
    setProgressStep('Step 1/5: Crawling & research on company website...');

    const timer1 = setTimeout(() => setProgressStep('Step 2/5: Extracting role requirements (must vs nice-to-have)...'), 3000);
    const timer2 = setTimeout(() => setProgressStep('Step 3/5: Generating tailored questions & flashcards...'), 7000);
    const timer3 = setTimeout(() => setProgressStep('Step 4/5: Running deterministic coverage check & second pass loop...'), 12000);
    const timer4 = setTimeout(() => setProgressStep('Step 5/5: Building schedule & validating Appendix A structure...'), 16000);

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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate kit');
      }

      router.push(`/kit/${data.id}`);
    } catch (err: any) {
      setError(err?.message || 'Generation failed. Please try again.');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      setGenerating(false);
      setProgressStep('');
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkStatus('Reading JSON file...');
    try {
      const text = await file.text();
      const items = JSON.parse(text);

      if (!Array.isArray(items)) {
        throw new Error('File must contain a JSON array of roles/cases');
      }

      setBulkStatus(`Processing ${items.length} role(s)...`);
      let count = 0;

      for (const item of items) {
        await fetch('/api/kits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobDescription: item.jd || item.jobDescription,
            companyUrl: item.company_url || item.companyUrl,
            daysAvailable: item.days || 5,
          }),
        });
        count++;
        setBulkStatus(`Generated kit ${count}/${items.length}...`);
      }

      setBulkStatus(`Successfully generated ${count} prep kit(s)!`);
      fetchKits();
    } catch (err: any) {
      setBulkStatus(`Bulk upload error: ${err.message}`);
    }
  };

  const handleDeleteKit = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this kit?')) return;

    try {
      await fetch(`/api/kits/${id}`, { method: 'DELETE' });
      setSavedKits(savedKits.filter(k => k._id !== id));
    } catch (err) {
      // Ignore
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-10"
    >
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 via-indigo-500/10 to-transparent opacity-50 animate-gradient-x" />
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-brand-500/30 rounded-full blur-3xl opacity-50 animate-float" />
        
        <div className="relative z-10 max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-semibold mb-6 shadow-inner"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Interview Prep Engine</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-4 tracking-tight"
          >
            Turn Any Job Description Into a Personalised Interview Kit
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-400 text-base leading-relaxed max-w-xl"
          >
            Our AI crawls the company website, extracts must-have requirements, generates categorized questions & flashcards, and builds an arithmetic daily study schedule just for you.
          </motion.p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Generator Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-7 bg-white/[0.02] backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/10 shadow-xl space-y-6"
        >
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <div className="p-2 bg-brand-500/20 rounded-lg">
              <FileText className="w-5 h-5 text-brand-400" />
            </div>
            <span>Create New Kit</span>
          </h2>

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-950/60 border border-red-800/50 rounded-xl text-red-300 text-sm flex items-start space-x-3 backdrop-blur-sm">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-400">Generation Error</p>
                <p className="text-xs text-red-300/90 mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center space-x-1.5 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Job Description Text</span>
              </label>
              <textarea
                required
                rows={7}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job posting text here..."
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center space-x-1.5 uppercase tracking-wider">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>Company Website URL</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyUrl}
                  onChange={(e) => setCompanyUrl(e.target.value)}
                  placeholder="https://company.com"
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-slate-100 placeholder-slate-600 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center space-x-1.5 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Days Before Interview</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  required
                  value={daysAvailable}
                  onChange={(e) => setDaysAvailable(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/50 transition-all"
                />
              </div>
            </div>

            {generating ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-brand-950/30 border border-brand-800/40 rounded-xl space-y-3 backdrop-blur-md">
                <div className="flex items-center space-x-3 text-brand-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-semibold text-sm">AI is cooking your Prep Kit...</span>
                </div>
                <div className="h-1.5 w-full bg-brand-950 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 w-1/2 animate-pulse rounded-full"></div>
                </div>
                <p className="text-xs text-brand-300/90 font-mono">{progressStep}</p>
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-brand-500/20 transition-all text-sm flex items-center justify-center space-x-2"
              >
                <span>Generate Prep Kit</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </form>

          {/* Bulk Multi-Role Upload Option */}
          <div className="pt-6 border-t border-white/10">
            <label className="block text-xs font-semibold text-slate-400 mb-3 flex items-center space-x-1.5 uppercase tracking-wider">
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Bulk Upload (JSON File)</span>
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleBulkUpload}
              className="block w-full text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-slate-200 hover:file:bg-white/20 cursor-pointer transition-colors"
            />
            {bulkStatus && (
              <p className="text-xs text-brand-400 mt-3 font-mono bg-brand-500/10 inline-block px-3 py-1 rounded-md">{bulkStatus}</p>
            )}
          </div>
        </motion.div>

        {/* Saved Prep Kits List */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-5 space-y-4"
        >
          <div className="flex items-center justify-between bg-white/[0.02] backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>Your Saved Kits</span>
            </h2>
            <span className="px-2.5 py-1 rounded-md bg-white/10 text-xs font-semibold text-slate-300">
              {savedKits.length} kits
            </span>
          </div>

          {loadingKits ? (
            <div className="p-8 text-center flex flex-col items-center justify-center space-y-3 text-slate-500">
               <Loader2 className="w-6 h-6 animate-spin text-brand-500/50" />
               <span className="text-sm">Loading your kits...</span>
            </div>
          ) : savedKits.length === 0 ? (
            <div className="bg-white/[0.02] backdrop-blur-md p-10 rounded-2xl border border-white/10 text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2">
                <FileText className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-300 font-medium">No prep kits found</p>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">Paste a job description on the left to generate your first highly-personalized kit.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedKits.map((item, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + (i * 0.1) }}
                  key={item._id}
                  onClick={() => router.push(`/kit/${item._id}`)}
                  className="relative overflow-hidden bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-brand-500/50 p-5 rounded-2xl transition-all cursor-pointer group flex items-center justify-between backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-500/0 via-brand-500/0 to-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="space-y-1.5 relative z-10">
                    <h3 className="font-semibold text-slate-200 group-hover:text-white text-sm line-clamp-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center space-x-3 text-xs font-medium text-slate-500 group-hover:text-slate-400 transition-colors">
                      <span className="flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
                        <span>{item.kit?.questions?.length || 0} Qs</span>
                      </span>
                      <span>•</span>
                      <span>{item.kit?.schedule?.days_available || 5} days prep</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 relative z-10">
                    <button
                      onClick={(e) => handleDeleteKit(item._id, e)}
                      className="p-2 hover:bg-red-500/20 rounded-xl text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Kit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-brand-500/20 flex items-center justify-center transition-colors">
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 transition-colors" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
