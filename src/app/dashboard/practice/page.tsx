'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, Play, ChevronDown, X, RotateCcw,
  Loader2, PlusCircle, CheckCircle2, BarChart2,
  TrendingDown, Minus, TrendingUp, ChevronRight, ChevronLeft
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Flashcard = { id: string; front: string; back: string };
type Confidence = 'low' | 'medium' | 'high';
type ConfidenceMap = Record<string, Confidence>;

type Kit = {
  _id: string;
  title: string;
  company: string;
  kit: { flashcards: Flashcard[]; role: { title: string } };
};

// ─── FlashcardBrowseGrid ──────────────────────────────────────────────────────
function FlashcardBrowseGrid({
  cards, confidenceMap,
}: {
  cards: Flashcard[];
  confidenceMap: ConfidenceMap;
}) {
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  const confBadge = (id: string) => {
    const c = confidenceMap[id];
    if (!c) return null;
    const map: Record<Confidence, { label: string; cls: string }> = {
      low:    { label: 'Low',    cls: 'bg-red-50 text-red-600 border-red-100' },
      medium: { label: 'Medium', cls: 'bg-amber-50 text-amber-600 border-amber-100' },
      high:   { label: 'High',   cls: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[c].cls}`}>
        {map[c].label}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          onClick={() => setFlipped(prev => ({ ...prev, [card.id]: !prev[card.id] }))}
          className="cursor-pointer group"
          style={{ perspective: 1000 }}
        >
          <div
            className="relative w-full transition-all duration-500"
            style={{
              transformStyle: 'preserve-3d',
              transform: flipped[card.id] ? 'rotateY(180deg)' : 'rotateY(0deg)',
              minHeight: 160,
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between group-hover:border-indigo-200 group-hover:shadow-sm transition-all"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="flex justify-between items-start gap-2">
                {confBadge(card.id)}
                <span className="text-[10px] font-bold text-slate-300 ml-auto">Tap to flip</span>
              </div>
              <p className="text-[14px] font-semibold text-slate-800 leading-snug mt-3">{card.front}</p>
              <div className="mt-3 text-[11px] font-bold text-indigo-400">Q {i + 1}</div>
            </div>
            {/* Back */}
            <div
              className="absolute inset-0 bg-indigo-50 border border-indigo-200 rounded-2xl p-5 flex flex-col justify-between"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <span className="text-[10px] font-bold text-indigo-400">Answer</span>
              <p className="text-[13px] text-slate-700 leading-relaxed mt-2 flex-1">{card.back}</p>
              <div className="mt-3 text-[11px] font-bold text-indigo-400">Q {i + 1}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── ConfidenceRater ──────────────────────────────────────────────────────────
function ConfidenceRater({ onRate }: { onRate: (c: Confidence) => void }) {
  const options: { label: string; value: Confidence; icon: React.ReactNode; cls: string }[] = [
    { label: 'Low',    value: 'low',    icon: <TrendingDown className="w-4 h-4" />, cls: 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100' },
    { label: 'Medium', value: 'medium', icon: <Minus className="w-4 h-4" />,        cls: 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100' },
    { label: 'High',   value: 'high',   icon: <TrendingUp className="w-4 h-4" />,  cls: 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100' },
  ];
  return (
    <div className="flex gap-3">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onRate(o.value)}
          className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-4 border-2 rounded-xl text-[13px] font-bold transition-all ${o.cls}`}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── PracticeSessionModal ─────────────────────────────────────────────────────
function PracticeSessionModal({
  cards, confidenceMap, onClose, onUpdate,
}: {
  cards: Flashcard[];
  confidenceMap: ConfidenceMap;
  onClose: () => void;
  onUpdate: (id: string, c: Confidence) => void;
}) {
  // Sort: lowest confidence first, unrated first
  const sorted = [...cards].sort((a, b) => {
    const order: Record<string, number> = { undefined: 0, low: 1, medium: 2, high: 3 };
    return (order[confidenceMap[a.id] ?? 'undefined'] ?? 0) - (order[confidenceMap[b.id] ?? 'undefined'] ?? 0);
  });

  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sessionMap, setSessionMap] = useState<ConfidenceMap>({});

  const current = sorted[idx];
  const isLast = idx === sorted.length - 1;
  const rated = Object.keys(sessionMap);

  const handleRate = (c: Confidence) => {
    setSessionMap(prev => ({ ...prev, [current.id]: c }));
    onUpdate(current.id, c);
    if (!isLast) {
      setIdx(i => i + 1);
      setRevealed(false);
    }
  };

  const distrib = {
    low:    rated.filter(id => sessionMap[id] === 'low').length,
    medium: rated.filter(id => sessionMap[id] === 'medium').length,
    high:   rated.filter(id => sessionMap[id] === 'high').length,
  };

  const done = isLast && !!sessionMap[current.id];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg p-7 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-widest text-indigo-500">Practice Session</p>
            <p className="text-[14px] font-bold text-slate-700 mt-0.5">
              {done ? 'Session Complete!' : `Card ${idx + 1} of ${sorted.length}`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-100 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${(rated.length / sorted.length) * 100}%` }}
          />
        </div>

        {done ? (
          /* Session Summary */
          <div className="text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <p className="text-[20px] font-extrabold text-slate-900">{sorted.length} cards reviewed</p>
              <p className="text-[13px] text-slate-400 mt-1">Here's your confidence breakdown:</p>
            </div>
            <div className="flex gap-3">
              {[
                { label: 'Low', value: distrib.low, cls: 'bg-red-50 text-red-700 border-red-100' },
                { label: 'Medium', value: distrib.medium, cls: 'bg-amber-50 text-amber-700 border-amber-100' },
                { label: 'High', value: distrib.high, cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
              ].map(d => (
                <div key={d.label} className={`flex-1 text-center border rounded-xl py-3 ${d.cls}`}>
                  <p className="text-[22px] font-extrabold">{d.value}</p>
                  <p className="text-[11px] font-bold uppercase tracking-wider mt-0.5">{d.label}</p>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors">
              Done
            </button>
          </div>
        ) : (
          /* Card Flow */
          <div>
            {/* Card */}
            <div
              className={`rounded-2xl p-6 mb-5 min-h-[160px] flex flex-col cursor-pointer transition-all ${revealed ? 'bg-indigo-50 border border-indigo-200' : 'bg-slate-50 border border-slate-200'}`}
              onClick={() => !revealed && setRevealed(true)}
            >
              <p className="text-[11px] font-bold uppercase tracking-widest mb-3 text-slate-400">
                {revealed ? 'Answer' : 'Question — tap to reveal'}
              </p>
              <p className={`text-[15px] leading-relaxed flex-1 ${revealed ? 'text-slate-800 font-medium' : 'text-slate-800 font-semibold'}`}>
                {revealed ? current.back : current.front}
              </p>
              {!revealed && (
                <p className="text-[12px] text-indigo-400 font-bold mt-4 text-center">Tap to reveal answer</p>
              )}
            </div>

            {/* Rate or Reveal */}
            {revealed ? (
              <div className="space-y-3">
                <p className="text-[12px] font-bold text-slate-500 text-center">How confident do you feel?</p>
                <ConfidenceRater onRate={handleRate} />
              </div>
            ) : (
              <button
                onClick={() => setRevealed(true)}
                className="w-full py-3 border-2 border-indigo-200 text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors"
              >
                Reveal Answer
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Coverage Summary Bar ─────────────────────────────────────────────────────
function CoverageSummary({ cards, confidenceMap }: { cards: Flashcard[]; confidenceMap: ConfidenceMap }) {
  const total = cards.length;
  const reviewed = cards.filter(c => confidenceMap[c.id]).length;
  const high   = cards.filter(c => confidenceMap[c.id] === 'high').length;
  const medium = cards.filter(c => confidenceMap[c.id] === 'medium').length;
  const low    = cards.filter(c => confidenceMap[c.id] === 'low').length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[14px] font-bold text-slate-900">Coverage</p>
          <p className="text-[12px] text-slate-400 font-medium mt-0.5">{reviewed} of {total} cards reviewed</p>
        </div>
        <BarChart2 className="w-5 h-5 text-slate-300" />
      </div>
      {/* Progress bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4 flex gap-0.5">
        {high   > 0 && <div style={{ width: `${(high / total) * 100}%` }}   className="h-full bg-emerald-400 rounded-full" />}
        {medium > 0 && <div style={{ width: `${(medium / total) * 100}%` }} className="h-full bg-amber-400 rounded-full" />}
        {low    > 0 && <div style={{ width: `${(low / total) * 100}%` }}    className="h-full bg-red-400 rounded-full" />}
      </div>
      <div className="flex gap-4 text-[12px] font-semibold">
        <span className="flex items-center gap-1.5 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />High {high}</span>
        <span className="flex items-center gap-1.5 text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Med {medium}</span>
        <span className="flex items-center gap-1.5 text-red-600"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Low {low}</span>
        <span className="flex items-center gap-1.5 text-slate-400"><span className="w-2 h-2 rounded-full bg-slate-200 inline-block" />Not rated {total - reviewed}</span>
      </div>
    </div>
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

// ─── Main Practice Page ───────────────────────────────────────────────────────
const STORAGE_KEY = 'preppilot_confidence';

export default function PracticePage() {
  const router = useRouter();
  const [kits, setKits] = useState<Kit[]>([]);
  const [selectedKitId, setSelectedKitId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [confidenceMap, setConfidenceMap] = useState<ConfidenceMap>({});

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

  // Load confidence from localStorage
  useEffect(() => {
    if (!selectedKitId) return;
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}_${selectedKitId}`);
      setConfidenceMap(raw ? JSON.parse(raw) : {});
    } catch { setConfidenceMap({}); }
  }, [selectedKitId]);

  const updateConfidence = useCallback((id: string, c: Confidence) => {
    setConfidenceMap(prev => {
      const next = { ...prev, [id]: c };
      try { localStorage.setItem(`${STORAGE_KEY}_${selectedKitId}`, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [selectedKitId]);

  const resetConfidence = () => {
    setConfidenceMap({});
    try { localStorage.removeItem(`${STORAGE_KEY}_${selectedKitId}`); } catch {}
  };

  const selectedKit = kits.find(k => k._id === selectedKitId);
  const flashcards: Flashcard[] = selectedKit?.kit?.flashcards || [];

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
            <Layers className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-[18px] font-bold text-slate-900 mb-2">No prep kits yet</h2>
          <p className="text-[13px] text-slate-400 font-medium max-w-xs mx-auto mb-6">
            Create a prep kit first to unlock flashcards and practice sessions.
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
      <div className="max-w-[1100px] mx-auto px-6 sm:px-8 pt-8 pb-24 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-extrabold text-slate-900 tracking-tight">Practice</h1>
            <p className="text-[14px] text-slate-400 font-medium mt-1">
              Flip flashcards, rate your confidence, and track your progress.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {kits.length > 1 && (
              <KitSelector kits={kits} selectedId={selectedKitId} onSelect={setSelectedKitId} />
            )}
            <button
              onClick={resetConfidence}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-[13px] font-semibold text-slate-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              onClick={() => setSessionOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold rounded-xl transition-all shadow-sm shadow-indigo-600/20"
            >
              <Play className="w-4 h-4" /> Start Practice Session
            </button>
          </div>
        </div>

        {/* Coverage bar */}
        {flashcards.length > 0 && (
          <CoverageSummary cards={flashcards} confidenceMap={confidenceMap} />
        )}

        {/* Flashcard grid */}
        {flashcards.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">
                Flashcards — {flashcards.length} cards
              </p>
              <p className="text-[12px] text-slate-400 font-medium">Tap any card to flip</p>
            </div>
            <FlashcardBrowseGrid cards={flashcards} confidenceMap={confidenceMap} />
          </div>
        ) : (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
            <p className="text-[15px] font-bold text-slate-500">No flashcards in this kit yet.</p>
          </div>
        )}

      </div>

      {/* Session modal */}
      <AnimatePresence>
        {sessionOpen && flashcards.length > 0 && (
          <PracticeSessionModal
            cards={flashcards}
            confidenceMap={confidenceMap}
            onClose={() => setSessionOpen(false)}
            onUpdate={updateConfidence}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
