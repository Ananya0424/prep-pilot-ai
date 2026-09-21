'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Folder, ArrowRight, Trash2, MoreHorizontal, Calendar, Loader2, PlusCircle, Sparkles, CheckCircle2, Clock } from 'lucide-react';

export default function MyKitsPage() {
  const router = useRouter();
  const [savedKits, setSavedKits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchKits();
  }, []);

  const fetchKits = async () => {
    try {
      let serverKits: any[] = [];
      const res = await fetch('/api/kits');
      if (res.status === 401) { router.push('/login'); return; }
      if (res.ok) {
        const data = await res.json();
        if (data.kits) serverKits = data.kits;
      }

      let localKits: any[] = [];
      try {
        const rawLocal = localStorage.getItem('preppilot_saved_kits_list');
        if (rawLocal) localKits = JSON.parse(rawLocal);
      } catch (e) {}

      const kitMap = new Map();
      [...serverKits, ...localKits].forEach(k => {
        if (k && (k._id || k.id)) kitMap.set(k._id || k.id, k);
      });

      const merged = Array.from(kitMap.values());
      setSavedKits(merged);
      try { localStorage.setItem('preppilot_saved_kits_list', JSON.stringify(merged)); } catch (e) {}
    } catch (err) {
      try {
        const rawLocal = localStorage.getItem('preppilot_saved_kits_list');
        if (rawLocal) setSavedKits(JSON.parse(rawLocal));
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(null);
    if (!confirm('Are you sure you want to delete this prep kit?')) return;
    try {
      await fetch(`/api/kits/${id}`, { method: 'DELETE' });
    } catch (err) {}
    setSavedKits(prev => {
      const updated = prev.filter(k => (k._id || k.id) !== id);
      try { localStorage.setItem('preppilot_saved_kits_list', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const calculateDaysRemaining = (createdAtStr: string, daysAvailable: number) => {
    const createdDate = new Date(createdAtStr || Date.now());
    const targetDate = new Date(createdDate.getTime() + (daysAvailable || 7) * 24 * 60 * 60 * 1000);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Interview passed', overdue: true };
    if (diffDays === 0) return { label: 'Interview today!', overdue: false };
    return { label: `${diffDays} days remaining`, overdue: false };
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 pt-8 pb-24">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight mb-1">My Prep Kits</h1>
            <p className="text-[14px] text-slate-500 font-medium">All your interview preparation kits in one place.</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/create')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-indigo-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            New Kit
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : savedKits.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5">
              <Folder className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-[18px] font-bold text-slate-900 mb-2">No prep kits yet</h2>
            <p className="text-[14px] text-slate-400 font-medium max-w-sm mb-7 leading-relaxed">
              Create your first prep kit by pasting a job description. AI will build your personalized preparation plan.
            </p>
            <button
              onClick={() => router.push('/dashboard/create')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[14px] font-bold rounded-xl transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              Create Your First Kit
            </button>
          </div>
        ) : (
          /* Kits Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {savedKits.map((item, i) => {
              const initial = (item.company || 'C').charAt(0).toUpperCase();
              const reqs = item.kit?.role?.requirements || [];
              const questions = item.kit?.questions || [];
              const totalReqs = reqs.length || 6;
              const coveredReqsCount = reqs.length ? Math.min(reqs.length, Math.max(1, Math.round(reqs.length * 0.8))) : 5;
              const daysAvailable = item.kit?.schedule?.days_available || 7;
              const daysInfo = calculateDaysRemaining(item.createdAt, daysAvailable);
              const role = item.kit?.role?.title || item.title || 'Role';
              const company = item.company || 'Company';

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => router.push(`/dashboard/kits/${item._id}`)}
                  className="group bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:border-indigo-300 hover:shadow-[0_4px_24px_-4px_rgba(99,102,241,0.14)] transition-all flex flex-col justify-between"
                >
                  {/* Top Header */}
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 text-[16px] font-extrabold flex-shrink-0">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[15px] font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{company}</h3>
                          <p className="text-[12px] font-semibold text-slate-500 truncate">{role}</p>
                        </div>
                      </div>

                      {/* Three-dot menu */}
                      <div className="relative" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === item._id ? null : item._id)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        {openMenuId === item._id && (
                          <div className="absolute right-0 top-8 z-20 w-36 bg-white border border-slate-200 rounded-xl shadow-lg py-1">
                            <button
                              onClick={(e) => handleDelete(item._id, e)}
                              className="w-full text-left px-3 py-2.5 text-[13px] text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete Kit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metadata Badges */}
                    <div className="space-y-3 mb-5">
                      {/* Days Remaining Badge */}
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className={`text-[12px] font-bold ${daysInfo.overdue ? 'text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md' : 'text-slate-700'}`}>
                          {daysInfo.label}
                        </span>
                      </div>

                      {/* Coverage Fraction */}
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[12px] font-semibold text-slate-600">
                          <strong className="text-slate-900 font-bold">{coveredReqsCount}/{totalReqs}</strong> requirements covered
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Date & Link */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span>Updated {formatDate(item.updatedAt || item.createdAt)}</span>
                    <span className="text-[12px] font-bold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Open Kit <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
