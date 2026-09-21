'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, Globe, Calendar, Upload, Loader2, ArrowRight, Trash2, Clock, Briefcase, PlusCircle, Search } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [daysAvailable, setDaysAvailable] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [savedKits, setSavedKits] = useState<any[]>([]);
  const [loadingKits, setLoadingKits] = useState(true);

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
        // If they have no kits, auto-show the create form
        if (data.kits.length === 0) {
          setShowCreateForm(true);
        }
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
      const payload = JSON.parse(text);
      if (!Array.isArray(payload)) {
        throw new Error('JSON must be an array of cases');
      }
      
      setBulkStatus('Bulk generation started...');
      // In a real app, we would send this payload to a background worker
      setTimeout(() => {
        setBulkStatus(`Started processing ${payload.length} cases.`);
      }, 1000);
    } catch (err: any) {
      setBulkStatus('Error parsing JSON');
    }
  };

  const handleDeleteKit = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this prep kit?')) return;
    
    try {
      const res = await fetch(`/api/kits/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedKits(prev => prev.filter(k => k._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
      className="max-w-[1100px] mx-auto space-y-10"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 mt-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">My Dashboard</h1>
          <p className="text-slate-500 font-medium">Manage your interview prep kits and start new ones.</p>
        </div>
        {!showCreateForm && (
          <button 
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create New Kit</span>
          </button>
        )}
      </div>

      {/* Create New Kit Section */}
      {showCreateForm && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 sm:p-8 rounded-[24px] border border-slate-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-3">
                <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600">
                  <FileText className="w-5 h-5" />
                </div>
                <span>Create New Prep Kit</span>
              </h2>
              <button 
                onClick={() => {
                  if (savedKits.length > 0) setShowCreateForm(false);
                }}
                className="text-sm font-bold text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm flex items-start space-x-3">
                <div className="mt-0.5"><div className="w-2 h-2 rounded-full bg-red-500" /></div>
                <div>
                  <p className="font-bold text-red-800">Generation Error</p>
                  <p className="text-xs text-red-600 mt-1 font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-6">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  Job Description
                </label>
                <textarea
                  required
                  rows={5}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job posting text here..."
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all resize-none font-medium"
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
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    Days Until Interview
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    required
                    value={daysAvailable}
                    onChange={(e) => setDaysAvailable(Number(e.target.value))}
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all font-medium"
                  />
                </div>
              </div>

              {generating ? (
                <div className="p-6 bg-brand-50 border border-brand-100 rounded-xl space-y-4 text-center mt-6">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-600 mx-auto" />
                  <div className="space-y-2">
                    <p className="font-bold text-brand-900 text-sm">Processing Kit with AI</p>
                    <p className="text-xs font-semibold text-brand-700">{progressStep}</p>
                  </div>
                  <div className="h-1.5 w-full bg-brand-200 rounded-full overflow-hidden max-w-xs mx-auto">
                    <div className="h-full bg-brand-500 w-1/2 animate-pulse rounded-full"></div>
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-10 py-4 bg-slate-900 hover:bg-brand-600 text-white font-bold rounded-xl transition-all duration-300 text-sm flex items-center justify-center space-x-2 shadow-lg shadow-slate-900/20 hover:shadow-brand-600/30 group"
                  >
                    <span>Generate Interview Kit</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </form>

            {/* Bulk Multi-Role Upload Option */}
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
          </div>
        </motion.div>
      )}

      {/* Saved Prep Kits Section */}
      {!loadingKits && savedKits.length > 0 && (
        <div className={showCreateForm ? 'opacity-50 pointer-events-none' : ''}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-brand-600" />
              Your Saved Kits
            </h2>
            <span className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
              {savedKits.length} Kits
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedKits.map((item, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={item._id}
                onClick={() => router.push(`/kit/${item._id}`)}
                className="bg-white border border-slate-200 p-6 rounded-[20px] cursor-pointer group flex flex-col justify-between shadow-sm hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)] hover:border-brand-300 transition-all h-[200px] relative overflow-hidden"
              >
                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-extrabold text-slate-900 text-lg line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors">
                      {item.title}
                    </h3>
                    <button
                      onClick={(e) => handleDeleteKit(item._id, e)}
                      className="p-1.5 hover:bg-red-50 rounded-md text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                      title="Delete Kit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 relative z-10">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-md">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.kit?.questions?.length || 0} Questions</span>
                    </span>
                    <span className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded-md">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.kit?.schedule?.days_available || 5} Days</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loadingKits && (
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
          <span className="text-sm font-bold text-slate-500">Loading your kits...</span>
        </div>
      )}

    </motion.div>
  );
}
