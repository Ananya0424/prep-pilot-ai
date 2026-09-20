'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, FileText, Globe, Calendar, Upload, Loader2, ArrowRight, CheckCircle2, AlertTriangle, Trash2, Clock, Briefcase } from 'lucide-react';

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
    setProgressStep('Reading job description & extracting requirements...');

    const timer1 = setTimeout(() => setProgressStep('Researching company context & role details...'), 3000);
    const timer2 = setTimeout(() => setProgressStep('Generating tailored interview questions & flashcards...'), 7000);
    const timer3 = setTimeout(() => setProgressStep('Checking requirement coverage matrix...'), 12000);
    const timer4 = setTimeout(() => setProgressStep('Building personalized study schedule...'), 16000);

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
      setError(err?.message || 'Generation failed. Please check your inputs and try again.');
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 shadow-sm text-center sm:text-left">
        <div className="max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-brand-50 text-brand-700 text-xs font-semibold mb-4 border border-brand-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Interview Prep Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Turn a Job Description into a Personalised Interview Prep Kit
          </h1>
          <p className="text-slate-600 text-base leading-relaxed">
            Provide the job requirements and company details, and our AI will extract key requirements, generate targeted questions, and build a daily study schedule.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Generator Form */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 pb-4 border-b border-slate-100">
            <FileText className="w-5 h-5 text-slate-500" />
            <span>Create New Kit</span>
          </h2>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Generation Error</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-1.5">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span>Job Description</span>
              </label>
              <textarea
                required
                rows={6}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job posting text here..."
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-shadow resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-1.5">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span>Company Website URL</span>
                </label>
                <input
                  type="url"
                  required
                  value={companyUrl}
                  onChange={(e) => setCompanyUrl(e.target.value)}
                  placeholder="https://company.com"
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Days Until Interview</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  required
                  value={daysAvailable}
                  onChange={(e) => setDaysAvailable(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-shadow"
                />
              </div>
            </div>

            {generating ? (
              <div className="p-6 bg-brand-50 border border-brand-100 rounded-xl space-y-4 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-brand-600 mx-auto" />
                <div className="space-y-2">
                  <p className="font-semibold text-brand-900 text-sm">Processing Kit</p>
                  <p className="text-xs text-brand-700">{progressStep}</p>
                </div>
                <div className="h-1.5 w-full bg-brand-200 rounded-full overflow-hidden max-w-xs mx-auto">
                  <div className="h-full bg-brand-500 w-1/2 animate-pulse rounded-full"></div>
                </div>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center space-x-2 shadow-sm"
              >
                <span>Generate Interview Kit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Bulk Multi-Role Upload Option */}
          <div className="pt-6 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-500 mb-3 flex items-center space-x-1.5 uppercase tracking-wider">
              <Upload className="w-3.5 h-3.5" />
              <span>Bulk Upload (JSON)</span>
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleBulkUpload}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer transition-colors"
            />
            {bulkStatus && (
              <p className="text-xs text-brand-600 mt-3 font-medium bg-brand-50 inline-block px-3 py-1 rounded-md">{bulkStatus}</p>
            )}
          </div>
        </div>

        {/* Saved Prep Kits List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-slate-400" />
              <span>Saved Kits</span>
            </h2>
            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-600">
              {savedKits.length} Kits
            </span>
          </div>

          {loadingKits ? (
            <div className="p-10 text-center flex flex-col items-center justify-center space-y-3 text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
               <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
               <span className="text-sm">Loading...</span>
            </div>
          ) : savedKits.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <FileText className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-900 font-semibold">No prep kits found</p>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">Generate a kit from a job description to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedKits.map((item, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={item._id}
                  onClick={() => router.push(`/kit/${item._id}`)}
                  className="bg-white hover:bg-slate-50 border border-slate-200 p-5 rounded-2xl transition-colors cursor-pointer group flex items-start justify-between shadow-sm hover:shadow-md"
                >
                  <div className="space-y-2 flex-1 pr-4">
                    <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-xs font-medium text-slate-500">
                      <span className="flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.kit?.questions?.length || 0} Questions</span>
                      </span>
                      <span className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.kit?.schedule?.days_available || 5} Days</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => handleDeleteKit(item._id, e)}
                      className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Kit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-brand-50 transition-colors">
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
