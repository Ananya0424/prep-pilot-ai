'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-sky-400 mb-1">
            <span>{kit.source.company}</span>
            <span>•</span>
            <span>{kit.source.role}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{kit.role.title} Interview Kit</h1>
          <p className="text-xs text-slate-400 mt-1">
            Generated across {kit.schedule.days_available} day(s) • {kit.questions.length} questions • {kit.flashcards.length} flashcards
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/practice/${kitId}`}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-emerald-600/20"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Practice Mode</span>
          </Link>

          <button
            onClick={handleSaveKit}
            disabled={saving}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-sky-600/20"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>

          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved!</span>
            </span>
          )}
        </div>
      </div>

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
        <div className="space-y-8">
          {categories.map((cat) => {
            const catQuestions = kit.questions.filter((q) => q.category === cat);
            const isRegenerating = regeneratingSection === `questions_${cat}`;

            return (
              <div key={cat} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-slate-100 capitalize text-base">{cat} Questions</h3>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs">
                      {catQuestions.length}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRegenerateSection(`questions_${cat}`)}
                      disabled={isRegenerating}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-sky-400 hover:text-sky-300 border border-slate-700/80 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all"
                      title="Regenerate this category without losing manual edits"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                      <span>{isRegenerating ? 'Regenerating...' : 'Regenerate Section'}</span>
                    </button>

                    <button
                      onClick={() => handleAddQuestion(cat)}
                      className="px-3 py-1.5 bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 rounded-lg text-xs font-semibold flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Question</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {catQuestions.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No questions in this category yet.</p>
                  ) : (
                    catQuestions.map((q) => {
                      const globalIdx = kit.questions.findIndex((item) => item.id === q.id);
                      const isPinned = (q as any).isPinned;

                      return (
                        <div
                          key={q.id}
                          className={`p-4 rounded-xl border transition-all space-y-3 ${
                            isPinned
                              ? 'bg-amber-950/20 border-amber-500/40'
                              : 'bg-slate-900/80 border-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-mono text-slate-400 font-bold">{q.id}</span>
                                {isPinned && (
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                                    <Pin className="w-3 h-3" />
                                    <span>Pinned / Edited</span>
                                  </span>
                                )}
                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                  Difficulty: {q.difficulty}/3
                                </span>
                              </div>

                              {/* Question Prompt Inline Edit */}
                              <textarea
                                value={q.prompt}
                                onChange={(e) => handleUpdateQuestion(globalIdx, { prompt: e.target.value })}
                                rows={2}
                                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-sm text-slate-100 font-medium focus:outline-none focus:border-sky-500"
                              />
                            </div>

                            {/* Reordering Controls */}
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleMoveQuestionOrder(globalIdx, 'up')}
                                disabled={globalIdx === 0}
                                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-30"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleMoveQuestionOrder(globalIdx, 'down')}
                                disabled={globalIdx === kit.questions.length - 1}
                                className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-30"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="p-1.5 hover:bg-red-950/60 rounded text-slate-500 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Answer Outline Inline Edit */}
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                              Answer Outline & Key Points
                            </label>
                            <textarea
                              value={q.answer_outline}
                              onChange={(e) => handleUpdateQuestion(globalIdx, { answer_outline: e.target.value })}
                              rows={3}
                              className="w-full bg-slate-950 border border-slate-700/60 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-sky-500 font-mono"
                            />
                          </div>

                          {/* Category and Requirement Mapping */}
                          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs border-t border-slate-800/60">
                            <div>
                              <span className="text-slate-500 mr-1.5">Category:</span>
                              <select
                                value={q.category}
                                onChange={(e) =>
                                  handleUpdateQuestion(globalIdx, {
                                    category: e.target.value as QuestionCategory,
                                  })
                                }
                                className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-300 text-xs"
                              >
                                {categories.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="flex items-center space-x-1">
                              <span className="text-slate-500">Requires:</span>
                              {q.requirement_ids.map((reqId) => (
                                <span key={reqId} className="px-1.5 py-0.5 bg-slate-800 rounded text-[10px] text-sky-300 font-mono">
                                  {reqId}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FLASHCARDS TAB */}
      {activeTab === 'flashcards' && (
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="font-bold text-slate-100 text-lg">Revision Flashcards</h3>
            <button
              onClick={handleAddFlashcard}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Flashcard</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kit.flashcards.map((f, i) => (
              <div key={f.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 font-bold">{f.id}</span>
                  <button
                    onClick={() => handleDeleteFlashcard(f.id)}
                    className="p-1 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Front (Prompt/Concept)</label>
                  <textarea
                    value={f.front}
                    onChange={(e) => handleUpdateFlashcard(i, { front: e.target.value })}
                    rows={2}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Back (Answer Summary)</label>
                  <textarea
                    value={f.back}
                    onChange={(e) => handleUpdateFlashcard(i, { back: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-300 font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCHEDULE TAB */}
      {activeTab === 'schedule' && (
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-slate-100 text-lg">Arithmetic Study Schedule</h3>
              <p className="text-xs text-slate-400">Allocates topics across exactly {kit.schedule.days_available} days</p>
            </div>

            <button
              onClick={() => handleRegenerateSection('schedule')}
              disabled={regeneratingSection === 'schedule'}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regeneratingSection === 'schedule' ? 'animate-spin' : ''}`} />
              <span>Re-allocate Schedule</span>
            </button>
          </div>

          <div className="space-y-4">
            {kit.schedule.days.map((d) => (
              <div key={d.day} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 font-bold text-sm flex items-center justify-center">
                      D{d.day}
                    </span>
                    <h4 className="font-semibold text-slate-200 text-sm">{d.focus}</h4>
                  </div>
                  <span className="text-xs font-mono text-slate-400 px-2 py-1 bg-slate-950 rounded border border-slate-800">
                    {d.minutes} Integer Minutes
                  </span>
                </div>

                <div className="space-y-1.5 pl-11">
                  {d.question_ids.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">Rest / Buffer Review session.</p>
                  ) : (
                    d.question_ids.map((qId) => {
                      const questionObj = kit.questions.find((q) => q.id === qId);
                      return (
                        <div key={qId} className="text-xs text-slate-300 flex items-center space-x-2">
                          <span className="font-mono text-sky-400 font-bold">{qId}:</span>
                          <span className="truncate">{questionObj?.prompt || 'Question prompt'}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BRIEF & ROLE TAB */}
      {activeTab === 'brief' && (
        <div className="space-y-6">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-lg">Company Research Brief</h3>
              <button
                onClick={() => handleRegenerateSection('company_brief')}
                disabled={regeneratingSection === 'company_brief'}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${regeneratingSection === 'company_brief' ? 'animate-spin' : ''}`} />
                <span>Regenerate Brief</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Overview & Summary</label>
              <textarea
                value={kit.company_brief.summary}
                onChange={(e) =>
                  setKit({
                    ...kit,
                    company_brief: { ...kit.company_brief, summary: e.target.value },
                  })
                }
                rows={3}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">What They Do</label>
              <textarea
                value={kit.company_brief.what_they_do}
                onChange={(e) =>
                  setKit({
                    ...kit,
                    company_brief: { ...kit.company_brief, what_they_do: e.target.value },
                  })
                }
                rows={3}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-200"
              />
            </div>
          </div>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-100 text-lg border-b border-slate-800 pb-3">Extracted Role Requirements</h3>
            <div className="space-y-3">
              {kit.role.requirements.map((req) => (
                <div key={req.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-sky-400 font-bold">{req.id}</span>
                    <span className="text-slate-200 font-medium">{req.text}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 capitalize">{req.kind}</span>
                    <span
                      className={`px-2 py-0.5 rounded font-semibold ${
                        req.priority === 'must' ? 'bg-red-950/60 text-red-300 border border-red-800/60' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {req.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
