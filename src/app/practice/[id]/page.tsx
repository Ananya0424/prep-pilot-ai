'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCw,
  ThumbsDown,
  ThumbsUp,
  Award,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Sparkles,
  Printer
} from 'lucide-react';
import { PrepKit, Flashcard } from '@/types/kit';

export default function PracticeModePage() {
  const params = useParams();
  const router = useRouter();
  const kitId = params.id as string;

  const [kit, setKit] = useState<PrepKit | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Practice session state
  const [cardsQueue, setCardsQueue] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Confidence ratings map: cardId -> score (1 = Low, 2 = Medium, 3 = High)
  const [confidenceRatings, setConfidenceRatings] = useState<Record<string, number>>({});
  const [completedSession, setCompletedSession] = useState(false);

  useEffect(() => {
    fetchKit();
  }, [kitId]);

  const fetchKit = async () => {
    try {
      const res = await fetch(`/api/kits/${kitId}`);
      if (!res.ok) throw new Error('Failed to load kit');
      const data = await res.json();
      const loadedKit: PrepKit = data.kit;
      setKit(loadedKit);
      setCardsQueue(loadedKit.flashcards || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRateConfidence = (score: number) => {
    const currentCard = cardsQueue[currentIndex];
    if (!currentCard) return;

    const newRatings = { ...confidenceRatings, [currentCard.id]: score };
    setConfidenceRatings(newRatings);
    setIsFlipped(false);

    if (currentIndex + 1 < cardsQueue.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCompletedSession(true);
    }
  };

  // Sort next session queue by lowest confidence (Confidence-weighted Spaced Repetition)
  const handleStartNextSession = () => {
    const sorted = [...cardsQueue].sort((a, b) => {
      const scoreA = confidenceRatings[a.id] || 0;
      const scoreB = confidenceRatings[b.id] || 0;
      return scoreA - scoreB; // Lowest confidence cards come first
    });

    setCardsQueue(sorted);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompletedSession(false);
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-500 space-y-4">
        <RotateCw className="w-8 h-8 animate-spin mx-auto text-brand-600" />
        <p className="text-sm font-semibold text-slate-600 animate-pulse">Warming up practice mode...</p>
      </div>
    );
  }

  if (!kit || cardsQueue.length === 0) {
    return (
      <div className="p-12 text-center text-slate-600 space-y-4 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
        <p className="text-lg text-slate-800 font-semibold">No flashcards found in this kit.</p>
        <Link href={`/kit/${kitId}`} className="text-brand-700 hover:text-brand-800 font-bold text-sm bg-brand-50 hover:bg-brand-100 border border-brand-200 px-5 py-2.5 rounded-xl inline-block transition-colors">
          Return to Kit Builder
        </Link>
      </div>
    );
  }

  const currentCard = cardsQueue[currentIndex];
  const totalCards = cardsQueue.length;
  const progressPercent = Math.round(((currentIndex + (completedSession ? 1 : 0)) / totalCards) * 100);

  // Weak Spots Analysis calculation
  const lowConfidenceCards = cardsQueue.filter(c => confidenceRatings[c.id] === 1);
  const mediumConfidenceCards = cardsQueue.filter(c => confidenceRatings[c.id] === 2);
  const highConfidenceCards = cardsQueue.filter(c => confidenceRatings[c.id] === 3);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8 pb-16"
    >
      {/* Navigation Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <Link
          href={`/kit/${kitId}`}
          className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-brand-600 flex items-center space-x-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Builder</span>
        </Link>

        <div className="text-xs text-brand-700 font-bold bg-brand-50 px-3.5 py-1.5 rounded-lg border border-brand-200">
          Card {currentIndex + 1} of {totalCards} ({progressPercent}% Covered)
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="bg-brand-600 h-full relative"
        />
      </div>

      <AnimatePresence mode="wait">
        {!completedSession ? (
          <motion.div 
            key="practice-session"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="space-y-6 perspective-1000"
          >
            {/* 3D Flip Card Container */}
            <motion.div
              onClick={() => setIsFlipped(!isFlipped)}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
              className="w-full min-h-[360px] cursor-pointer transform-style-3d relative"
            >
              {/* Front of Card */}
              <div className={`absolute inset-0 bg-white border border-slate-200 hover:border-brand-300 rounded-3xl p-8 sm:p-12 shadow-sm flex flex-col justify-between backface-hidden transition-colors ${isFlipped ? 'invisible' : 'visible'}`}>
                
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono font-bold tracking-wider relative z-10">
                  <span>CARD ID: {currentCard.id}</span>
                  <span className="text-brand-600 flex items-center space-x-1 animate-pulse">
                    <RotateCw className="w-4 h-4" />
                    <span>Click to Flip</span>
                  </span>
                </div>

                <div className="my-auto text-center space-y-4 relative z-10 py-10">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block bg-slate-100 border border-slate-200 inline-block px-3 py-1 rounded-full">
                    Concept / Question
                  </span>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-relaxed max-w-xl mx-auto">
                    {currentCard.front}
                  </p>
                </div>

                <div className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider relative z-10">
                  Requirement: <span className="text-brand-600">{currentCard.requirement_ids.join(', ')}</span>
                </div>
              </div>

              {/* Back of Card */}
              <div className={`absolute inset-0 bg-slate-50 border border-slate-300 rounded-3xl p-8 sm:p-12 shadow-inner flex flex-col justify-between backface-hidden rotate-y-180 ${!isFlipped ? 'invisible' : 'visible'}`}>
                
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono font-bold tracking-wider relative z-10">
                  <span>CARD ID: {currentCard.id}</span>
                  <span className="text-brand-600 flex items-center space-x-1">
                    <RotateCw className="w-4 h-4" />
                    <span>Flip Back</span>
                  </span>
                </div>

                <div className="my-auto text-center space-y-4 relative z-10 py-10">
                  <span className="text-[10px] font-bold text-brand-700 uppercase tracking-widest block bg-brand-50 border border-brand-200 inline-block px-3 py-1 rounded-full">
                    Answer Outline
                  </span>
                  <p className="text-lg sm:text-xl font-medium text-slate-700 leading-relaxed max-w-xl mx-auto">
                    {currentCard.back}
                  </p>
                </div>

                <div className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider relative z-10">
                  Requirement: <span className="text-brand-600">{currentCard.requirement_ids.join(', ')}</span>
                </div>
              </div>
            </motion.div>

            {/* Confidence Rating Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isFlipped ? 1 : 0.5, y: 0 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-center"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Rate your confidence (Revealed after flip):</p>

              <div className="grid grid-cols-3 gap-4">
                <button
                  disabled={!isFlipped}
                  onClick={() => handleRateConfidence(1)}
                  className="py-3 px-2 sm:px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span className="hidden sm:inline">Needs Review</span>
                  <span className="sm:hidden">Low</span>
                </button>

                <button
                  disabled={!isFlipped}
                  onClick={() => handleRateConfidence(2)}
                  className="py-3 px-2 sm:px-4 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-xl font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <span className="hidden sm:inline">Medium (Fair)</span>
                  <span className="sm:hidden">Fair</span>
                </button>

                <button
                  disabled={!isFlipped}
                  onClick={() => handleRateConfidence(3)}
                  className="py-3 px-2 sm:px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="hidden sm:inline">High (Confident)</span>
                  <span className="sm:hidden">High</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          /* PRACTICE SESSION COMPLETE & CREATIVE WEAK SPOTS REPORT */
          <motion.div 
            key="completion-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 p-8 sm:p-12 rounded-3xl space-y-10 text-center shadow-sm relative overflow-hidden"
          >
            <motion.div 
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", damping: 15 }}
              className="w-20 h-20 bg-emerald-100 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto relative z-10"
            >
              <Award className="w-10 h-10 text-emerald-600" />
            </motion.div>

            <div className="space-y-3 relative z-10">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Session Mastered!</h2>
              <p className="text-slate-600 font-medium">
                You have reviewed all {totalCards} flashcards. Keep the momentum going!
              </p>
            </div>

            {/* CREATIVE FEATURE: Weak Spots Report */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 text-left space-y-6 relative z-10 shadow-inner">
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-4">
                <BarChart3 className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">AI Weak Spots Report & Coach</h3>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-white border border-red-200 rounded-xl shadow-sm">
                  <div className="text-3xl font-extrabold text-red-600 relative z-10">{lowConfidenceCards.length}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1 relative z-10">Weak Spots</div>
                </div>
                <div className="p-4 bg-white border border-amber-200 rounded-xl shadow-sm">
                  <div className="text-3xl font-extrabold text-amber-500 relative z-10">{mediumConfidenceCards.length}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1 relative z-10">Fair Topics</div>
                </div>
                <div className="p-4 bg-white border border-emerald-200 rounded-xl shadow-sm">
                  <div className="text-3xl font-extrabold text-emerald-600 relative z-10">{highConfidenceCards.length}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1 relative z-10">Mastered</div>
                </div>
              </div>

              {lowConfidenceCards.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4"/>
                    <span>High Priority To Review Next:</span>
                  </p>
                  <div className="space-y-2">
                    {lowConfidenceCards.map((card) => (
                      <div key={card.id} className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-medium shadow-sm">
                        • {card.front}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <button
                onClick={handleStartNextSession}
                className="w-full sm:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 transition-colors shadow-sm"
              >
                <RotateCw className="w-4 h-4" />
                <span>Start Next Session (Targeted)</span>
              </button>

              <button
                onClick={() => window.print()}
                className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print Report</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
