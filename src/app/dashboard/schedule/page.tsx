'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Clock, BookOpen, ChevronDown, Loader2, PlusCircle, CheckSquare, Square, Layers } from 'lucide-react';

type Question = { id: string; prompt: string; category: string; difficulty: 1 | 2 | 3 };
type ScheduleDay = { day: number; focus: string; question_ids: string[]; minutes: number };
type Kit = {
  _id: string;
  title: string;
  company: string;
  kit: {
    schedule: { days_available: number; days: ScheduleDay[] };
    questions: Question[];
    role: { title: string };
  };
};

const DONE_KEY = 'preppilot_schedule_done';
const categoryColors: Record<string, string> = {
  technical:       'bg-indigo-50 text-indigo-700 border-indigo-100',
  behavioural:     'bg-violet-50 text-violet-700 border-violet-100',
  'system-design': 'bg-amber-50 text-amber-700 border-amber-100',
  'company-fit':   'bg-emerald-50 text-emerald-700 border-emerald-100',
};
const difficultyLabel = (d: 1 | 2 | 3) =>
  d === 1 ? '🟢 Easy' : d === 2 ? '🟡 Medium' : '🔴 Hard';

// ─── ScheduleDayCard ──────────────────────────────────────────────────────────
function ScheduleDayCard({
  day, questions, doneDays, onToggleDay,
}: {
  day: ScheduleDay;
  questions: Question[];
  doneDays: Set<number>;
  onToggleDay: (d: number) => void;
}) {
  const [expanded, setExpanded] = useState(day.day === 1);
  const isDone = doneDays.has(day.day);
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const linkedQs = questions.filter(q => day.question_ids.includes(q.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: day.day * 0.04 }}
      className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-all ${
        isDone ? 'border-emerald-200' : 'border-slate-200 hover:border-indigo-200'
      }`}
    >
      {/* Day header */}
      <div
        className={`flex items-center justify-between px-5 py-4 cursor-pointer ${isDone ? 'bg-emerald-50/40' : 'hover:bg-slate-50'} transition-colors`}
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-4">
          {/* Day number badge */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-[15px] flex-shrink-0 ${
            isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
          }`}>
            {isDone ? '✓' : day.day}
          </div>
          <div>
            <p className={`text-[14px] font-bold ${isDone ? 'text-emerald-700 line-through decoration-emerald-300' : 'text-slate-900'}`}>
              Day {day.day} — {day.focus}
            </p>
            <div className="flex items-center gap-3 mt-0.5 text-[12px] font-medium text-slate-400">
              <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {linkedQs.length} questions</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {day.minutes} min</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mark done toggle */}
          <button
            onClick={e => { e.stopPropagation(); onToggleDay(day.day); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-colors ${
              isDone
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-emerald-200 hover:text-emerald-600'
            }`}
          >
            {isDone ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            {isDone ? 'Done' : 'Mark done'}
          </button>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Expanded questions */}
      {expanded && linkedQs.length > 0 && (
        <div className="border-t border-slate-100 px-5 pb-4 pt-3 space-y-2.5">
          {linkedQs.map((q, i) => (
            <div key={q.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-extrabold text-slate-400 mt-0.5 flex-shrink-0 w-5">Q{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-800 leading-snug">{q.prompt}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryColors[q.category] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {q.category}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">{difficultyLabel(q.difficulty)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {expanded && linkedQs.length === 0 && (
        <div className="border-t border-slate-100 px-5 py-4">
          <p className="text-[13px] text-slate-400 font-medium">No specific questions linked to this day.</p>
        </div>
      )}
    </motion.div>
  );
}

// ─── KitSelector ──────────────────────────────────────────────────────────────
function KitSelector({ kits, selectedId, onSelect }: { kits: Kit[]; selectedId: string; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const selected = kits.find(k => k._id === selectedId);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-slate-700 hover:border-indigo-300 transition-colors max-w-xs"
      >
        <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-[11px] flex items-center justify-center flex-shrink-0">
          {(selected?.company || 'K').charAt(0)}
        </span>
        <span className="truncate">{selected?.kit?.role?.title || selected?.title || 'Select kit'}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
      </button>
      {open && (
        <div className="absolute left-0 top-12 z-30 w-72 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5">
          {kits.map(k => (
            <button
              key={k._id}
              onClick={() => { onSelect(k._id); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-[13px] font-semibold hover:bg-indigo-50 transition-colors flex items-center gap-2 ${k._id === selectedId ? 'text-indigo-700 bg-indigo-50/60' : 'text-slate-700'}`}
            >
              <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                {(k.company || 'K').charAt(0)}
              </span>
              {k.kit?.role?.title || k.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Schedule Page ───────────────────────────────────────────────────────
export default function SchedulePage() {
  const router = useRouter();
  const [kits, setKits] = useState<Kit[]>([]);
  const [selectedKitId, setSelectedKitId] = useState('');
  const [loading, setLoading] = useState(true);
  const [doneDays, setDoneDays] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetch('/api/kits')
      .then(r => r.json())
      .then(data => {
        if (data.kits?.length) {
          setKits(data.kits);
          setSelectedKitId(data.kits[0]._id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedKitId) return;
    try {
      const raw = localStorage.getItem(`${DONE_KEY}_${selectedKitId}`);
      setDoneDays(raw ? new Set(JSON.parse(raw)) : new Set());
    } catch { setDoneDays(new Set()); }
  }, [selectedKitId]);

  const toggleDay = (day: number) => {
    setDoneDays(prev => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      try { localStorage.setItem(`${DONE_KEY}_${selectedKitId}`, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const selectedKit = kits.find(k => k._id === selectedKitId);
  const schedule = selectedKit?.kit?.schedule;
  const questions: Question[] = selectedKit?.kit?.questions || [];
  const days = schedule?.days || [];
  const doneCount = doneDays.size;
  const totalDays = days.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!kits.length) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Calendar className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-[18px] font-bold text-slate-900 mb-2">No schedule yet</h2>
          <p className="text-[13px] text-slate-400 font-medium max-w-xs mx-auto mb-6">
            Generate a prep kit to get a personalized day-by-day study schedule.
          </p>
          <button
            onClick={() => router.push('/dashboard/create')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold rounded-xl transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Create Kit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <div className="max-w-[860px] mx-auto px-6 sm:px-8 pt-8 pb-24 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight">Study Schedule</h1>
            <p className="text-[14px] text-slate-400 font-medium mt-1">
              Your personalized day-by-day interview preparation plan.
            </p>
          </div>
          {kits.length > 1 && (
            <KitSelector kits={kits} selectedId={selectedKitId} onSelect={setSelectedKitId} />
          )}
        </div>

        {/* Progress overview card */}
        {days.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[14px] font-bold text-slate-900">Overall Progress</p>
                <p className="text-[12px] text-slate-400 font-medium mt-0.5">
                  {doneCount} of {totalDays} days completed · {schedule?.days_available} days until interview
                </p>
              </div>
              <span className={`text-[13px] font-extrabold px-3 py-1.5 rounded-xl ${
                doneCount === totalDays
                  ? 'bg-emerald-50 text-emerald-700'
                  : doneCount > 0
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {totalDays === 0 ? '0' : Math.round((doneCount / totalDays) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${totalDays === 0 ? 0 : (doneCount / totalDays) * 100}%` }}
              />
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-3 text-[11px] font-semibold text-slate-400 flex-wrap">
              {[
                { label: 'Technical', cls: 'bg-indigo-100 text-indigo-600' },
                { label: 'Behavioural', cls: 'bg-violet-100 text-violet-600' },
                { label: 'System Design', cls: 'bg-amber-100 text-amber-600' },
                { label: 'Company Fit', cls: 'bg-emerald-100 text-emerald-600' },
              ].map(l => (
                <span key={l.label} className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${l.cls}`}>{l.label}</span>
              ))}
            </div>
          </div>
        )}

        {/* Day cards */}
        {days.length > 0 ? (
          <div className="space-y-3">
            {days.map(day => (
              <ScheduleDayCard
                key={day.day}
                day={day}
                questions={questions}
                doneDays={doneDays}
                onToggleDay={toggleDay}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-[15px] font-bold text-slate-500">No schedule data in this kit.</p>
          </div>
        )}

      </div>
    </div>
  );
}
