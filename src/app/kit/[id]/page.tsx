'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  BookOpen,
  Calendar,
  HelpCircle,
  Plus,
  Trash2,
  RefreshCw,
  Pin,
  Save,
  PlayCircle,
  FileText,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Move,
} from 'lucide-react';
import { PrepKit, Question, Flashcard, QuestionCategory } from '@/types/kit';

export default function KitBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const kitId = params.id as string;

  const [kit, setKit] = useState<PrepKit | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'brief' | 'questions' | 'flashcards' | 'schedule' | 'weakspots'>('questions');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchKitDetails();
  }, [kitId]);

  const fetchKitDetails = async () => {
    try {
      const res = await fetch(`/api/kits/${kitId}`);
      if (!res.ok) throw new Error('Failed to load kit');
      const data = await res.json();
      setKit(data.kit);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKit = async () => {
    if (!kit) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/kits/${kitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kit }),
      });
      if (!res.ok) throw new Error('Failed to save kit');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  // Section Regeneration preserving manual edits & pinned states
  const handleRegenerateSection = async (sectionName: string) => {
    if (!kit) return;
    setRegeneratingSection(sectionName);

    try {
      const res = await fetch(`/api/kits/${kitId}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: sectionName, currentKit: kit }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Regeneration failed');
      setKit(data.kit);
    } catch (err: any) {
      alert(`Regeneration error: ${err.message}`);
    } finally {
      setRegeneratingSection(null);
    }
  };

  // Question Inline Editing & Pinning
  const handleUpdateQuestion = (index: number, fields: Partial<Question>) => {
    if (!kit) return;
    const newQuestions = [...kit.questions];
    newQuestions[index] = {
      ...newQuestions[index],
      ...fields,
      isPinned: true, // Mark as user edited / pinned
    } as any;
    setKit({ ...kit, questions: newQuestions });
  };

  const handleAddQuestion = (category: QuestionCategory = 'technical') => {
    if (!kit) return;
    const newQ: Question & { isPinned?: boolean } = {
      id: `q_custom_${Date.now()}`,
      requirement_ids: [kit.role.requirements[0]?.id || 'r1'],
      category,
      prompt: 'New custom question prompt...',
      answer_outline: 'Custom answer outline key points...',
      difficulty: 2,
      isPinned: true,
    };
    setKit({ ...kit, questions: [...kit.questions, newQ] });
  };

  const handleDeleteQuestion = (id: string) => {
    if (!kit) return;
    setKit({
      ...kit,
      questions: kit.questions.filter((q) => q.id !== id),
    });
  };

  const handleMoveQuestionOrder = (index: number, direction: 'up' | 'down') => {
    if (!kit) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= kit.questions.length) return;

    const newQuestions = [...kit.questions];
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[targetIdx];
    newQuestions[targetIdx] = temp;
    setKit({ ...kit, questions: newQuestions });
  };

  // Flashcard Editing
  const handleUpdateFlashcard = (index: number, fields: Partial<Flashcard>) => {
    if (!kit) return;
    const newFlashcards = [...kit.flashcards];
    newFlashcards[index] = { ...newFlashcards[index], ...fields };
    setKit({ ...kit, flashcards: newFlashcards });
  };

  const handleAddFlashcard = () => {
    if (!kit) return;
    const newF: Flashcard = {
      id: `f_custom_${Date.now()}`,
      front: 'Front side concept...',
      back: 'Back side answer explanation...',
      requirement_ids: [kit.role.requirements[0]?.id || 'r1'],
    };
    setKit({ ...kit, flashcards: [...kit.flashcards, newF] });
  };

  const handleDeleteFlashcard = (id: string) => {
    if (!kit) return;
    setKit({
      ...kit,
      flashcards: kit.flashcards.filter((f) => f.id !== id),
    });
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400 space-y-3">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm">Loading interview kit...</p>
      </div>
    );
  }

  if (!kit) {
    return (
      <div className="p-12 text-center text-slate-400">
        <p className="text-lg">Kit not found.</p>
        <Link href="/dashboard" className="text-sky-400 underline mt-2 inline-block text-sm">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const categories: QuestionCategory[] = ['technical', 'behavioural', 'system-design', 'company-fit'];

  return (
    <div className="space-y-8 pb-16">
      {/* Kit Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-4 z-50 bg-white/[0.03] backdrop-blur-2xl p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-brand-500/10 to-indigo-500/10 rounded-2xl opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-xs font-bold tracking-wider uppercase text-brand-400 mb-2">
            <span>{kit.source.company}</span>
            <span className="text-white/30">•</span>
            <span>{kit.source.role}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{kit.role.title} Interview Kit</h1>
          <div className="flex items-center space-x-3 text-xs font-medium text-slate-400 mt-2">
            <span className="flex items-center space-x-1"><Calendar className="w-3.5 h-3.5"/><span>{kit.schedule.days_available} days</span></span>
            <span className="text-white/20">•</span>
            <span className="flex items-center space-x-1"><HelpCircle className="w-3.5 h-3.5"/><span>{kit.questions.length} questions</span></span>
            <span className="text-white/20">•</span>
            <span className="flex items-center space-x-1"><BookOpen className="w-3.5 h-3.5"/><span>{kit.flashcards.length} flashcards</span></span>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <Link
            href={`/practice/${kitId}`}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl text-sm flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
          >
            <PlayCircle className="w-5 h-5" />
            <span>Practice Mode</span>
          </Link>

          <button
            onClick={handleSaveKit}
            disabled={saving}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold rounded-xl text-sm flex items-center space-x-2 transition-all hover:scale-105 backdrop-blur-md"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>

          <AnimatePresence>
            {saveSuccess && (
              <motion.span 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-sm text-emerald-400 font-bold flex items-center space-x-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved!</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('questions')}
          className={`pb-3 px-2 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'questions' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Question Bank ({kit.questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('flashcards')}
          className={`pb-3 px-2 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'flashcards' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Flashcards ({kit.flashcards.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`pb-3 px-2 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'schedule' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Study Schedule ({kit.schedule.days_available} Days)</span>
        </button>

        <button
          onClick={() => setActiveTab('brief')}
          className={`pb-3 px-2 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'brief' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Company Brief & Role</span>
        </button>
      </div>

      {/* QUESTION BANK TAB */}
      {activeTab === 'questions' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          {categories.map((cat, catIndex) => {
            const catQuestions = kit.questions.filter((q) => q.category === cat);
            const isRegenerating = regeneratingSection === `questions_${cat}`;

            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.1 }}
                key={cat} 
                className="bg-white/[0.02] backdrop-blur-sm p-6 rounded-2xl border border-white/10 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-slate-100 capitalize text-base">{cat} Questions</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold">
                      {catQuestions.length}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRegenerateSection(`questions_${cat}`)}
                      disabled={isRegenerating}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-brand-400 hover:text-brand-300 border border-white/10 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all"
                      title="Regenerate this category without losing manual edits"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                      <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
                    </button>

                    <button
                      onClick={() => handleAddQuestion(cat)}
                      className="px-3 py-1.5 bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {catQuestions.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No questions in this category yet.</p>
                  ) : (
                    catQuestions.map((q, qIndex) => {
                      const globalIdx = kit.questions.findIndex((item) => item.id === q.id);
                      const isPinned = (q as any).isPinned;

                      return (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: qIndex * 0.05 }}
                          key={q.id}
                          className={`p-5 rounded-xl border transition-all space-y-4 ${
                            isPinned
                              ? 'bg-amber-950/10 border-amber-500/30 shadow-lg shadow-amber-900/10'
                              : 'bg-black/20 border-white/5 hover:border-white/10 hover:bg-black/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-mono text-slate-400 font-bold bg-white/5 px-2 py-0.5 rounded">{q.id}</span>
                                {isPinned && (
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold tracking-wide uppercase border border-amber-500/30">
                                    <Pin className="w-3 h-3" />
                                    <span>Pinned</span>
                                  </span>
                                )}
                                <span className="text-[10px] px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20 font-semibold">
                                  Difficulty: {q.difficulty}/3
                                </span>
                              </div>

                              {/* Question Prompt Inline Edit */}
                              <textarea
                                value={q.prompt}
                                onChange={(e) => handleUpdateQuestion(globalIdx, { prompt: e.target.value })}
                                rows={2}
                                className="w-full bg-transparent border border-transparent hover:border-white/10 hover:bg-white/5 focus:bg-black/40 focus:border-brand-500 rounded-lg p-3 text-sm text-slate-100 font-medium focus:outline-none transition-all resize-none"
                              />
                            </div>

                            {/* Reordering Controls */}
                            <div className="flex flex-col items-center space-y-1 bg-white/5 rounded-lg p-1">
                              <button
                                onClick={() => handleMoveQuestionOrder(globalIdx, 'up')}
                                disabled={globalIdx === 0}
                                className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleMoveQuestionOrder(globalIdx, 'down')}
                                disabled={globalIdx === kit.questions.length - 1}
                                className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="p-1 hover:bg-red-500/20 rounded text-slate-500 hover:text-red-400 transition-colors mt-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Answer Outline Inline Edit */}
                          <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                              Answer Outline & Key Points
                            </label>
                            <textarea
                              value={q.answer_outline}
                              onChange={(e) => handleUpdateQuestion(globalIdx, { answer_outline: e.target.value })}
                              rows={3}
                              className="w-full bg-transparent border border-transparent hover:border-white/10 focus:border-brand-500 rounded-lg p-2 text-xs text-slate-300 focus:outline-none font-mono transition-all resize-none"
                            />
                          </div>

                          {/* Category and Requirement Mapping */}
                          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Category:</span>
                              <select
                                value={q.category}
                                onChange={(e) =>
                                  handleUpdateQuestion(globalIdx, {
                                    category: e.target.value as QuestionCategory,
                                  })
                                }
                                className="bg-white/5 border border-white/10 rounded-md px-2 py-1 text-brand-300 text-xs focus:outline-none focus:border-brand-500"
                              >
                                {categories.map((c) => (
                                  <option key={c} value={c} className="bg-slate-900">
                                    {c}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Requires:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {q.requirement_ids.map((reqId) => (
                                  <span key={reqId} className="px-2 py-0.5 bg-brand-500/10 border border-brand-500/20 rounded text-[10px] text-brand-300 font-mono">
                                    {reqId}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* FLASHCARDS TAB */}
      {activeTab === 'flashcards' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.02] backdrop-blur-sm p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="font-bold text-slate-100 text-lg flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-brand-400" />
              <span>Revision Flashcards</span>
            </h3>
            <button
              onClick={handleAddFlashcard}
              className="px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-brand-500/20 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add Flashcard</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kit.flashcards.map((f, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                key={f.id} 
                className="bg-black/20 border border-white/5 hover:border-white/10 p-5 rounded-2xl space-y-4 relative group transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 font-bold bg-white/5 px-2 py-0.5 rounded">{f.id}</span>
                  <button
                    onClick={() => handleDeleteFlashcard(f.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Front (Prompt/Concept)</label>
                  <textarea
                    value={f.front}
                    onChange={(e) => handleUpdateFlashcard(i, { front: e.target.value })}
                    rows={2}
                    className="w-full bg-white/5 border border-transparent hover:border-white/10 focus:border-brand-500 rounded-xl p-3 text-sm text-slate-200 transition-all focus:outline-none resize-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Back (Answer Summary)</label>
                  <textarea
                    value={f.back}
                    onChange={(e) => handleUpdateFlashcard(i, { back: e.target.value })}
                    rows={3}
                    className="w-full bg-white/5 border border-transparent hover:border-white/10 focus:border-brand-500 rounded-xl p-3 text-xs text-slate-300 font-mono transition-all focus:outline-none resize-none"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* SCHEDULE TAB */}
      {activeTab === 'schedule' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.02] backdrop-blur-sm p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="font-bold text-slate-100 text-lg flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-brand-400" />
                <span>Arithmetic Study Schedule</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Allocates topics across exactly {kit.schedule.days_available} days</p>
            </div>

            <button
              onClick={() => handleRegenerateSection('schedule')}
              disabled={regeneratingSection === 'schedule'}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-brand-400 border border-white/10 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all hover:scale-105"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regeneratingSection === 'schedule' ? 'animate-spin' : ''}`} />
              <span>Re-allocate Schedule</span>
            </button>
          </div>

          <div className="space-y-4">
            {kit.schedule.days.map((d, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={d.day} 
                className="bg-black/20 border border-white/5 p-5 rounded-2xl space-y-3 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center space-x-4">
                    <span className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 text-brand-400 font-extrabold text-sm flex items-center justify-center shadow-inner">
                      D{d.day}
                    </span>
                    <h4 className="font-bold text-slate-200 text-sm tracking-wide">{d.focus}</h4>
                  </div>
                  <span className="text-xs font-mono text-slate-400 px-3 py-1 bg-white/5 rounded-lg border border-white/10 font-semibold">
                    {d.minutes} Integer Minutes
                  </span>
                </div>

                <div className="space-y-2 pl-14">
                  {d.question_ids.length === 0 ? (
                    <p className="text-xs text-slate-500 italic flex items-center space-x-1.5"><Sparkles className="w-3.5 h-3.5 text-emerald-500/50"/><span>Rest / Buffer Review session.</span></p>
                  ) : (
                    d.question_ids.map((qId) => {
                      const questionObj = kit.questions.find((q) => q.id === qId);
                      return (
                        <div key={qId} className="text-xs text-slate-300 flex items-center space-x-3 bg-white/5 px-3 py-2 rounded-lg">
                          <span className="font-mono text-brand-400 font-bold bg-black/30 px-1.5 py-0.5 rounded">{qId}</span>
                          <span className="truncate flex-1 font-medium">{questionObj?.prompt || 'Question prompt'}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* BRIEF & ROLE TAB */}
      {activeTab === 'brief' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white/[0.02] backdrop-blur-sm p-6 rounded-2xl border border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-bold text-slate-100 text-lg flex items-center space-x-2">
                <Globe className="w-5 h-5 text-brand-400" />
                <span>Company Research Brief</span>
              </h3>
              <button
                onClick={() => handleRegenerateSection('company_brief')}
                disabled={regeneratingSection === 'company_brief'}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-brand-400 border border-white/10 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all hover:scale-105"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${regeneratingSection === 'company_brief' ? 'animate-spin' : ''}`} />
                <span>Regenerate Brief</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Overview & Summary</label>
                <textarea
                  value={kit.company_brief.summary}
                  onChange={(e) =>
                    setKit({
                      ...kit,
                      company_brief: { ...kit.company_brief, summary: e.target.value },
                    })
                  }
                  rows={4}
                  className="w-full bg-black/20 border border-white/5 hover:border-white/10 focus:border-brand-500 rounded-xl p-4 text-sm text-slate-200 transition-all focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">What They Do</label>
                <textarea
                  value={kit.company_brief.what_they_do}
                  onChange={(e) =>
                    setKit({
                      ...kit,
                      company_brief: { ...kit.company_brief, what_they_do: e.target.value },
                    })
                  }
                  rows={4}
                  className="w-full bg-black/20 border border-white/5 hover:border-white/10 focus:border-brand-500 rounded-xl p-4 text-sm text-slate-200 transition-all focus:outline-none resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-sm p-6 rounded-2xl border border-white/10 space-y-5">
            <h3 className="font-bold text-slate-100 text-lg border-b border-white/10 pb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-brand-400" />
              <span>Extracted Role Requirements</span>
            </h3>
            <div className="space-y-3">
              {kit.role.requirements.map((req, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={req.id} 
                  className="p-4 bg-black/20 border border-white/5 hover:border-white/10 rounded-xl flex items-center justify-between text-xs transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <span className="font-mono text-brand-400 font-bold bg-white/5 px-2 py-1 rounded">{req.id}</span>
                    <span className="text-slate-200 font-medium text-sm">{req.text}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-400 capitalize font-semibold">{req.kind}</span>
                    <span
                      className={`px-2.5 py-1 rounded-lg font-bold tracking-wide uppercase text-[10px] ${
                        req.priority === 'must' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {req.priority}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
