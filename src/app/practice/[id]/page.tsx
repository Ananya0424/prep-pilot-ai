'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  RotateCw,
  ThumbsDown,
  ThumbsUp,
  Award,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Printer,
  BarChart3,
  BookOpen,
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
      <div className="p-16 text-center text-slate-400">
        <p className="text-sm">Loading Practice Mode...</p>
      </div>
    );
  }

  if (!kit || cardsQueue.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-4">
        <p className="text-lg">No flashcards found in this kit.</p>
        <Link href={`/kit/${kitId}`} className="text-sky-400 underline text-sm">
          Return to Kit Builder
        </Link>
      </div>
    );
  }

  const currentCard = cardsQueue[currentIndex];
  const totalCards = cardsQueue.length;
  const progressPercent = Math.round(((currentIndex + (completedSession ? 1 : 0)) / totalCards) * 100);

  // Weak Spots Analysis calculation (Creative Feature)
  const lowConfidenceCards = cardsQueue.filter(c => confidenceRatings[c.id] === 1);
  const mediumConfidenceCards = cardsQueue.filter(c => confidenceRatings[c.id] === 2);
  const highConfidenceCards = cardsQueue.filter(c => confidenceRatings[c.id] === 3);

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`/kit/${kitId}`}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center space-x-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Kit Builder</span>
        </Link>

        <div className="text-xs text-slate-400 font-mono">
          Card {currentIndex + 1} of {totalCards} ({progressPercent}% Covered)
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
        <div
          className="bg-gradient-to-r from-sky-500 to-emerald-500 h-2 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {!completedSession ? (
        <div className="space-y-6">
          {/* Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[320px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-slate-800 hover:border-sky-500/50 rounded-3xl p-8 cursor-pointer shadow-2xl flex flex-col justify-between transition-all group relative"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>CARD ID: {currentCard.id}</span>
              <span className="text-sky-400 group-hover:underline flex items-center space-x-1">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Click to Flip Card</span>
              </span>
            </div>

            <div className="my-auto text-center space-y-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">
                {isFlipped ? 'Answer Outline' : 'Concept / Question'}
              </span>

              <p className="text-lg sm:text-xl font-bold text-slate-100 leading-relaxed max-w-xl mx-auto">
                {isFlipped ? currentCard.back : currentCard.front}
              </p>
            </div>

            <div className="text-center text-xs text-slate-500">
              Requirement ID: {currentCard.requirement_ids.join(', ')}
            </div>
          </div>

          {/* Confidence Rating Buttons */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-3 text-center">
            <p className="text-xs font-semibold text-slate-400">Rate your confidence on this topic:</p>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleRateConfidence(1)}
                className="py-3 px-4 bg-red-950/40 hover:bg-red-950/80 border border-red-800/80 text-red-300 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-1.5"
              >
                <ThumbsDown className="w-4 h-4 text-red-400" />
                <span>Low (Needs Review)</span>
              </button>

              <button
                onClick={() => handleRateConfidence(2)}
                className="py-3 px-4 bg-amber-950/40 hover:bg-amber-950/80 border border-amber-800/80 text-amber-300 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Medium (Fair)</span>
              </button>

              <button
                onClick={() => handleRateConfidence(3)}
                className="py-3 px-4 bg-emerald-950/40 hover:bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-1.5"
              >
                <ThumbsUp className="w-4 h-4 text-emerald-400" />
                <span>High (Confident)</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* PRACTICE SESSION COMPLETE & CREATIVE WEAK SPOTS REPORT */
        <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl space-y-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Practice Session Completed!</h2>
            <p className="text-slate-400 text-sm">
              You have reviewed all {totalCards} flashcards in this kit.
            </p>
          </div>

          {/* CREATIVE FEATURE: Weak Spots Report */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 text-left space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <BarChart3 className="w-5 h-5 text-sky-400" />
              <h3 className="font-bold text-slate-100 text-sm">Creative Feature: Weak Spots Report & Coach</h3>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-red-950/40 border border-red-900 rounded-xl">
                <div className="text-xl font-extrabold text-red-400">{lowConfidenceCards.length}</div>
                <div className="text-[11px] text-red-300">Weak Spots (Low)</div>
              </div>
              <div className="p-3 bg-amber-950/40 border border-amber-900 rounded-xl">
                <div className="text-xl font-extrabold text-amber-400">{mediumConfidenceCards.length}</div>
                <div className="text-[11px] text-amber-300">Fair Topics</div>
              </div>
              <div className="p-3 bg-emerald-950/40 border border-emerald-900 rounded-xl">
                <div className="text-xl font-extrabold text-emerald-400">{highConfidenceCards.length}</div>
                <div className="text-[11px] text-emerald-300">Mastered</div>
              </div>
            </div>

            {lowConfidenceCards.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-red-400">High Priority Topics to Review First:</p>
                <div className="space-y-1.5">
                  {lowConfidenceCards.map((card) => (
                    <div key={card.id} className="p-2 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300">
                      • <span className="font-semibold">{card.front}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStartNextSession}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-sky-600/30"
            >
              <RotateCw className="w-4 h-4" />
              <span>Start Next Session (Confidence-Sorted)</span>
            </button>

            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print 1-Pager Summary</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
