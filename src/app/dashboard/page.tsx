'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    <div className="space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-900/40 via-indigo-900/30 to-slate-900 border border-sky-500/20 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Interview Prep Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Turn Any Job Description Into a Personalised Interview Kit
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Crawls the company website, extracts must-have requirements, generates categorized questions & flashcards, and builds an arithmetic daily study schedule.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Generator Form */}
        <div className="lg:col-span-7 bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <span>Create New Kit</span>
          </h2>

          {error && (
            <div className="p-4 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-sm flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Generation Error</p>
                <p className="text-xs text-red-300/90 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Job Description Text</span>
              </label>
              <textarea
                required
                rows={7}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job posting text here..."
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>Company Website URL</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyUrl}
                  onChange={(e) => setCompanyUrl(e.target.value)}
                  placeholder="https://company.com"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
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
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {generating ? (
              <div className="p-4 bg-sky-950/40 border border-sky-800/60 rounded-xl space-y-3">
                <div className="flex items-center space-x-3 text-sky-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-semibold text-sm">Generating Prep Kit...</span>
                </div>
                <p className="text-xs text-sky-300/90 font-mono">{progressStep}</p>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-sky-600/25 transition-all text-sm flex items-center justify-center space-x-2"
              >
                <span>Generate Prep Kit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Bulk Multi-Role Upload Option */}
          <div className="pt-4 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-400 mb-2 flex items-center space-x-1.5">
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Prepare for Multiple Roles at Once (Upload JSON File)</span>
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleBulkUpload}
              className="block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
            />
            {bulkStatus && (
              <p className="text-xs text-sky-400 mt-2 font-mono">{bulkStatus}</p>
            )}
          </div>
        </div>

        {/* Saved Prep Kits List */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center justify-between">
            <span>Your Saved Kits</span>
            <span className="text-xs font-normal text-slate-400">
              {savedKits.length} kit(s)
            </span>
          </h2>

          {loadingKits ? (
            <div className="p-8 text-center text-slate-500 text-sm">Loading kits...</div>
          ) : savedKits.length === 0 ? (
            <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center space-y-3">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-sm">No prep kits generated yet.</p>
              <p className="text-slate-500 text-xs">Fill out the form on the left to create your first kit!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedKits.map((item) => (
                <div
                  key={item._id}
                  onClick={() => router.push(`/kit/${item._id}`)}
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/40 p-4 rounded-xl transition-all cursor-pointer group flex items-start justify-between"
                >
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-200 group-hover:text-sky-300 text-sm">
                      {item.title}
                    </h3>
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span>{item.kit?.questions?.length || 0} questions</span>
                      <span>•</span>
                      <span>{item.kit?.schedule?.days_available || 5} days</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => handleDeleteKit(item._id, e)}
                      className="p-1.5 hover:bg-red-950/60 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete Kit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
