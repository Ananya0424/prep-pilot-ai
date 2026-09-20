'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
  Globe,
  Briefcase,
  Clock,
  Sparkles
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
  const [activeTab, setActiveTab] = useState<'brief' | 'questions' | 'flashcards' | 'schedule'>('questions');
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
      <div className="p-16 text-center text-slate-500 space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand-600" />
        <p className="text-sm">Loading workspace...</p>
      </div>
    );
  }

  if (!kit) {
    return (
      <div className="p-12 text-center text-slate-600 bg-white rounded-xl border border-slate-200">
        <p className="text-base font-medium">Workspace not found.</p>
        <Link href="/dashboard" className="text-brand-600 hover:text-brand-700 underline mt-2 inline-block text-sm">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const categories: QuestionCategory[] = ['technical', 'behavioural', 'system-design', 'company-fit'];
  const coveragePercent = Math.round(
    (kit.questions.reduce((acc, q) => {
      q.requirement_ids.forEach(r => acc.add(r));
      return acc;
    }, new Set()).size / Math.max(1, kit.role.requirements.length)) * 100
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Kit Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-4 z-40 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6"
      >
        <div className="space-y-3 flex-1">
          <div className="flex items-center space-x-2 text-xs font-bold tracking-wider uppercase text-slate-500">
            <span className="flex items-center space-x-1.5"><Globe className="w-3.5 h-3.5" /><span>{kit.source.company}</span></span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center space-x-1.5"><Briefcase className="w-3.5 h-3.5" /><span>{kit.source.role}</span></span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{kit.role.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
            <span className="flex items-center space-x-1.5 bg-slate-100 px-2.5 py-1 rounded-md"><Clock className="w-3.5 h-3.5 text-slate-400"/><span>{kit.schedule.days_available} Days Prep</span></span>
            <span className="flex items-center space-x-1.5 bg-slate-100 px-2.5 py-1 rounded-md"><HelpCircle className="w-3.5 h-3.5 text-slate-400"/><span>{kit.questions.length} Questions</span></span>
            <span className="flex items-center space-x-1.5 bg-slate-100 px-2.5 py-1 rounded-md"><BookOpen className="w-3.5 h-3.5 text-slate-400"/><span>{kit.flashcards.length} Flashcards</span></span>
            <span className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100"><CheckCircle2 className="w-3.5 h-3.5"/><span>{coveragePercent}% Req Coverage</span></span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <AnimatePresence>
            {saveSuccess && (
              <motion.span 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-sm text-emerald-600 font-bold flex items-center space-x-1.5 px-3"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved!</span>
              </motion.span>
            )}
          </AnimatePresence>

          <button
            onClick={handleSaveKit}
            disabled={saving}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm flex items-center justify-center space-x-2 transition-colors shadow-sm"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin text-slate-400" /> : <Save className="w-4 h-4 text-slate-400" />}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>

          <Link
            href={`/practice/${kitId}`}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 shadow-sm transition-colors"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Practice Mode</span>
          </Link>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 space-x-6 px-2">
        <button
          onClick={() => setActiveTab('questions')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'questions' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Question Bank ({kit.questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('flashcards')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'flashcards' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Flashcards ({kit.flashcards.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'schedule' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Study Schedule</span>
        </button>

        <button
          onClick={() => setActiveTab('brief')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'brief' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Company & Role Brief</span>
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
                transition={{ delay: catIndex * 0.05 }}
                key={cat} 
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-bold text-slate-900 capitalize text-base">{cat} Questions</h3>
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold">
                      {catQuestions.length}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRegenerateSection(`questions_${cat}`)}
                      disabled={isRegenerating}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
                      title="Regenerate this category without losing manual edits"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                      <span>{isRegenerating ? 'Regenerating...' : 'Regenerate Section'}</span>
                    </button>

                    <button
                      onClick={() => handleAddQuestion(cat)}
                      className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {catQuestions.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <p className="text-sm text-slate-500 font-medium">No questions generated for this category.</p>
                      <button onClick={() => handleAddQuestion(cat)} className="mt-2 text-xs text-brand-600 hover:underline font-semibold">Click to add one manually.</button>
                    </div>
                  ) : (
                    catQuestions.map((q, qIndex) => {
                      const globalIdx = kit.questions.findIndex((item) => item.id === q.id);
                      const isPinned = (q as any).isPinned;

                      return (
                        <div
                          key={q.id}
                          className={`p-5 rounded-xl border transition-all space-y-4 ${
                            isPinned
                              ? 'bg-amber-50/30 border-amber-200 shadow-sm'
                              : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center space-x-3">
                                <span className="text-xs font-mono text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{q.id}</span>
                                {isPinned && (
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold tracking-wide uppercase border border-amber-200">
                                    <Pin className="w-3 h-3" />
                                    <span>Pinned</span>
                                  </span>
                                )}
                                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                                  q.difficulty === 1 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                  q.difficulty === 2 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                  'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                  {q.difficulty === 1 ? 'Easy' : q.difficulty === 2 ? 'Medium' : 'Hard'}
                                </span>
                              </div>

                              <textarea
                                value={q.prompt}
                                onChange={(e) => handleUpdateQuestion(globalIdx, { prompt: e.target.value })}
                                rows={2}
                                className="w-full bg-transparent border border-transparent hover:border-slate-200 hover:bg-slate-50 focus:bg-white focus:border-brand-500 rounded-lg p-2 text-sm text-slate-900 font-semibold focus:outline-none transition-all resize-none shadow-sm-hover"
                              />
                            </div>

                            <div className="flex flex-col items-center space-y-1 bg-slate-50 rounded-lg p-1 border border-slate-100">
                              <button
                                onClick={() => handleMoveQuestionOrder(globalIdx, 'up')}
                                disabled={globalIdx === 0}
                                className="p-1 hover:bg-slate-200 rounded-md text-slate-500 hover:text-slate-700 disabled:opacity-30 transition-colors"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleMoveQuestionOrder(globalIdx, 'down')}
                                disabled={globalIdx === kit.questions.length - 1}
                                className="p-1 hover:bg-slate-200 rounded-md text-slate-500 hover:text-slate-700 disabled:opacity-30 transition-colors"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="p-1 hover:bg-red-100 rounded-md text-slate-400 hover:text-red-600 transition-colors mt-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center space-x-1.5">
                              <FileText className="w-3 h-3" />
                              <span>Answer Outline</span>
                            </label>
                            <textarea
                              value={q.answer_outline}
                              onChange={(e) => handleUpdateQuestion(globalIdx, { answer_outline: e.target.value })}
                              rows={3}
                              className="w-full bg-white border border-slate-200 focus:border-brand-500 rounded-lg p-3 text-sm text-slate-700 focus:outline-none transition-shadow resize-none shadow-sm"
                            />
                          </div>

                          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Category:</span>
                              <select
                                value={q.category}
                                onChange={(e) =>
                                  handleUpdateQuestion(globalIdx, {
                                    category: e.target.value as QuestionCategory,
                                  })
                                }
                                className="bg-white border border-slate-200 rounded-md px-2 py-1.5 text-slate-700 text-xs focus:outline-none focus:border-brand-500 font-medium shadow-sm"
                              >
                                {categories.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Covers:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {q.requirement_ids.map((reqId) => (
                                  <span key={reqId} className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-[10px] text-slate-600 font-mono font-bold">
                                    {reqId}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
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
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-slate-400" />
              <span>Revision Flashcards</span>
            </h3>
            <button
              onClick={handleAddFlashcard}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Flashcard</span>
            </button>
          </div>

          {kit.flashcards.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No flashcards found.</p>
              <p className="text-slate-400 text-sm mt-1">Create your first flashcard to start practicing.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {kit.flashcards.map((f, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  key={f.id} 
                  className="bg-white border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md p-5 rounded-2xl space-y-4 relative group transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500 font-semibold bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">{f.id}</span>
                    <button
                      onClick={() => handleDeleteFlashcard(f.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Front (Question)</label>
                    <textarea
                      value={f.front}
                      onChange={(e) => handleUpdateFlashcard(i, { front: e.target.value })}
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl p-3 text-sm text-slate-900 transition-colors focus:outline-none resize-none font-semibold shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Back (Answer)</label>
                    <textarea
                      value={f.back}
                      onChange={(e) => handleUpdateFlashcard(i, { back: e.target.value })}
                      rows={3}
                      className="w-full bg-white border border-slate-200 focus:border-brand-500 rounded-xl p-3 text-sm text-slate-700 transition-colors focus:outline-none resize-none"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* SCHEDULE TAB */}
      {activeTab === 'schedule' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-slate-400" />
                <span>Preparation Schedule</span>
              </h3>
              <p className="text-sm text-slate-500 mt-1 font-medium">Daily study plan mapped across {kit.schedule.days_available} days</p>
            </div>

            <button
              onClick={() => handleRegenerateSection('schedule')}
              disabled={regeneratingSection === 'schedule'}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
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
                transition={{ delay: i * 0.05 }}
                key={d.day} 
                className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-4">
                    <span className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 text-brand-700 font-extrabold text-sm flex items-center justify-center">
                      Day {d.day}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base">{d.focus}</h4>
                  </div>
                  <span className="text-xs font-mono text-slate-600 px-3 py-1 bg-slate-100 rounded-md border border-slate-200 font-semibold flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{d.minutes} min</span>
                  </span>
                </div>

                <div className="space-y-2 pl-14">
                  {d.question_ids.length === 0 ? (
                    <p className="text-sm text-slate-500 italic flex items-center space-x-1.5"><Sparkles className="w-4 h-4 text-emerald-500"/><span>Buffer day / Concept review.</span></p>
                  ) : (
                    d.question_ids.map((qId) => {
                      const questionObj = kit.questions.find((q) => q.id === qId);
                      return (
                        <div key={qId} className="text-sm text-slate-700 flex items-start space-x-3 bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-100">
                          <span className="font-mono text-slate-500 font-bold bg-white border border-slate-200 px-1.5 py-0.5 rounded text-xs mt-0.5">{qId}</span>
                          <span className="flex-1 font-medium">{questionObj?.prompt || 'Question prompt missing'}</span>
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
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-900 text-lg flex items-center space-x-2">
                <Globe className="w-5 h-5 text-slate-400" />
                <span>Company Research Brief</span>
              </h3>
              <button
                onClick={() => handleRegenerateSection('company_brief')}
                disabled={regeneratingSection === 'company_brief'}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${regeneratingSection === 'company_brief' ? 'animate-spin' : ''}`} />
                <span>Regenerate Brief</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Company Overview</label>
                <textarea
                  value={kit.company_brief.summary}
                  onChange={(e) =>
                    setKit({
                      ...kit,
                      company_brief: { ...kit.company_brief, summary: e.target.value },
                    })
                  }
                  rows={6}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl p-4 text-sm text-slate-800 transition-colors focus:outline-none resize-none leading-relaxed shadow-inner"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Key Products / What They Do</label>
                <textarea
                  value={kit.company_brief.what_they_do}
                  onChange={(e) =>
                    setKit({
                      ...kit,
                      company_brief: { ...kit.company_brief, what_they_do: e.target.value },
                    })
                  }
                  rows={6}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl p-4 text-sm text-slate-800 transition-colors focus:outline-none resize-none leading-relaxed shadow-inner"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-4 flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-slate-400" />
              <span>Extracted Requirements</span>
            </h3>
            
            <div className="space-y-3">
              {kit.role.requirements.map((req, i) => (
                <div 
                  key={req.id} 
                  className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between text-sm shadow-sm gap-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start sm:items-center space-x-4">
                    <span className="font-mono text-slate-500 font-bold bg-slate-100 border border-slate-200 px-2 py-1 rounded-md text-xs mt-0.5 sm:mt-0">{req.id}</span>
                    <span className="text-slate-800 font-medium leading-snug">{req.text}</span>
                  </div>
                  <div className="flex items-center space-x-2 ml-12 sm:ml-0">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-600 capitalize font-semibold text-xs tracking-wide">{req.kind}</span>
                    <span
                      className={`px-2.5 py-1 rounded-md font-bold tracking-wide uppercase text-[10px] border ${
                        req.priority === 'must' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      {req.priority === 'must' ? 'Must Have' : 'Nice to Have'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
