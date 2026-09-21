'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Calendar, HelpCircle, Plus, Trash2, RefreshCw,
  Save, PlayCircle, FileText, CheckCircle2, ChevronDown,
  Globe, Briefcase, Clock, Sparkles, Layers, ArrowLeft,
  CheckSquare, Square, Edit3, Tag, AlertCircle, BarChart2,
  TrendingDown, Minus, TrendingUp, X, ArrowRight, Award
} from 'lucide-react';
import { PrepKit, Question, Flashcard, QuestionCategory, Requirement, RequirementKind, RequirementPriority } from '@/types/kit';

// ─── Local Types & LocalStorage Keys ─────────────────────────────────────────
type Confidence = 'low' | 'medium' | 'high';
type ConfidenceMap = Record<string, Confidence>;
const CONF_STORAGE_KEY = 'preppilot_kit_confidence';
const DONE_DAYS_KEY = 'preppilot_kit_schedule_done';

export default function KitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const kitId = (params.kitId || params.id) as string;

  const [kit, setKit] = useState<PrepKit | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'questions' | 'flashcards' | 'schedule' | 'practice'>('overview');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Confidence & Schedule State
  const [confidenceMap, setConfidenceMap] = useState<ConfidenceMap>({});
  const [doneDays, setDoneDays] = useState<Set<number>>(new Set());

  // Active Day Practice Modal State
  const [activeDayPractice, setActiveDayPractice] = useState<{
    dayNum: number;
    dayFocus: string;
    questions: Question[];
  } | null>(null);

  useEffect(() => {
    fetchKitDetails();
  }, [kitId]);

  useEffect(() => {
    if (!kitId) return;
    try {
      const rawConf = localStorage.getItem(`${CONF_STORAGE_KEY}_${kitId}`);
      if (rawConf) setConfidenceMap(JSON.parse(rawConf));

      const rawDays = localStorage.getItem(`${DONE_DAYS_KEY}_${kitId}`);
      if (rawDays) setDoneDays(new Set(JSON.parse(rawDays)));
    } catch {}
  }, [kitId]);

  const fetchKitDetails = async () => {
    try {
      setErrorMsg(null);
      const res = await fetch(`/api/kits/${kitId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.kit) {
          setKit(data.kit);
          return;
        }
      }
      throw new Error('Failed to load kit details');
    } catch (err: any) {
      try {
        const stored = sessionStorage.getItem(`kit_${kitId}`);
        if (stored) {
          setKit(JSON.parse(stored));
          return;
        }
      } catch (e) {}
      setErrorMsg(err?.message || 'Could not fetch kit');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKit = async (updatedKit?: PrepKit) => {
    const targetKit = updatedKit || kit;
    if (!targetKit) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/kits/${kitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kit: targetKit }),
      });
      if (!res.ok) throw new Error('Failed to save changes');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save kit changes');
    } finally {
      setSaving(false);
    }
  };

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
      handleSaveKit(data.kit);
    } catch (err: any) {
      alert(`Regeneration error: ${err.message}`);
    } finally {
      setRegeneratingSection(null);
    }
  };

  // ─── Question Handlers ──────────────────────────────────────────────────────
  const handleUpdateQuestion = (index: number, fields: Partial<Question>) => {
    if (!kit) return;
    const updatedQs = [...kit.questions];
    updatedQs[index] = { ...updatedQs[index], ...fields };
    const updated = { ...kit, questions: updatedQs };
    setKit(updated);
    handleSaveKit(updated);
  };

  const handleDeleteQuestion = (index: number) => {
    if (!kit) return;
    const updatedQs = kit.questions.filter((_, i) => i !== index);
    const updated = { ...kit, questions: updatedQs };
    setKit(updated);
    handleSaveKit(updated);
  };

  const handleAddQuestion = (category: QuestionCategory) => {
    if (!kit) return;
    const newQ: Question = {
      id: `q_${Date.now()}`,
      prompt: 'New Question Prompt',
      answer_outline: 'Enter answer key outline here...',
      category,
      difficulty: 2,
      requirement_ids: [],
    };
    const updated = { ...kit, questions: [...kit.questions, newQ] };
    setKit(updated);
    handleSaveKit(updated);
  };

  const handleMoveQuestionCategory = (index: number, newCategory: QuestionCategory) => {
    if (!kit) return;
    const updatedQs = [...kit.questions];
    updatedQs[index].category = newCategory;
    const updated = { ...kit, questions: updatedQs };
    setKit(updated);
    handleSaveKit(updated);
  };

  // ─── Flashcard Handlers ─────────────────────────────────────────────────────
  const handleUpdateFlashcard = (index: number, fields: Partial<Flashcard>) => {
    if (!kit) return;
    const updatedCards = [...kit.flashcards];
    updatedCards[index] = { ...updatedCards[index], ...fields };
    const updated = { ...kit, flashcards: updatedCards };
    setKit(updated);
    handleSaveKit(updated);
  };

  const handleDeleteFlashcard = (index: number) => {
    if (!kit) return;
    const updatedCards = kit.flashcards.filter((_, i) => i !== index);
    const updated = { ...kit, flashcards: updatedCards };
    setKit(updated);
    handleSaveKit(updated);
  };

  const handleAddFlashcard = () => {
    if (!kit) return;
    const newFc: Flashcard = {
      id: `fc_${Date.now()}`,
      front: 'Front Question / Concept',
      back: 'Back Explanation / Key Points',
      requirement_ids: [],
    };
    const updated = { ...kit, flashcards: [...kit.flashcards, newFc] };
    setKit(updated);
    handleSaveKit(updated);
  };

  // ─── Confidence / Schedule Handlers ─────────────────────────────────────────
  const updateConfidence = (cardId: string, c: Confidence) => {
    setConfidenceMap(prev => {
      const next = { ...prev, [cardId]: c };
      try { localStorage.setItem(`${CONF_STORAGE_KEY}_${kitId}`, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const markDayDone = (dayNum: number) => {
    setDoneDays(prev => {
      const next = new Set(prev);
      next.add(dayNum);
      try { localStorage.setItem(`${DONE_DAYS_KEY}_${kitId}`, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const toggleDayDone = (dayNum: number) => {
    setDoneDays(prev => {
      const next = new Set(prev);
      next.has(dayNum) ? next.delete(dayNum) : next.add(dayNum);
      try { localStorage.setItem(`${DONE_DAYS_KEY}_${kitId}`, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] p-8 max-w-[1200px] mx-auto space-y-6">
        <div className="h-8 bg-slate-200/60 rounded-xl w-64 animate-pulse" />
        <div className="h-4 bg-slate-200/50 rounded-xl w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="h-40 bg-white rounded-2xl animate-pulse border border-slate-200/60" />
          <div className="h-40 bg-white rounded-2xl animate-pulse border border-slate-200/60" />
          <div className="h-40 bg-white rounded-2xl animate-pulse border border-slate-200/60" />
        </div>
      </div>
    );
  }

  if (errorMsg || !kit) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center p-6">
        <div className="bg-white border border-red-100 rounded-2xl p-8 text-center max-w-md shadow-sm">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-[18px] font-bold text-slate-900 mb-1">Kit Not Found</h2>
          <p className="text-[13px] text-slate-500 mb-6">{errorMsg || 'Could not load this preparation kit.'}</p>
          <button
            onClick={() => router.push('/dashboard/kits')}
            className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-[13px] rounded-xl"
          >
            Back to My Prep Kits
          </button>
        </div>
      </div>
    );
  }

  const tabs: { id: typeof activeTab; label: string; icon: any; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: Briefcase },
    { id: 'requirements', label: 'Requirements', icon: Tag, count: kit.role?.requirements?.length || 0 },
    { id: 'questions', label: 'Questions', icon: HelpCircle, count: kit.questions?.length || 0 },
    { id: 'flashcards', label: 'Flashcards', icon: Layers, count: kit.flashcards?.length || 0 },
    { id: 'schedule', label: 'Schedule', icon: Calendar, count: kit.schedule?.days?.length || 0 },
    { id: 'practice', label: 'Practice', icon: PlayCircle },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-7 pb-24 space-y-6">

        {/* Back Link & Header */}
        <div>
          <button
            onClick={() => router.push('/dashboard/kits')}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Prep Kits
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-extrabold text-[15px] flex items-center justify-center shadow-sm">
                  {(kit.source?.company || 'C').charAt(0).toUpperCase()}
                </span>
                <div>
                  <h1 className="text-[22px] font-extrabold text-slate-900 tracking-tight leading-snug">
                    {kit.role?.title || 'Job Role'}
                  </h1>
                  <p className="text-[13px] font-semibold text-indigo-600">
                    {kit.source?.company || 'Company'} {kit.source?.location ? `• ${kit.source.location}` : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {saveSuccess && (
                <span className="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 animate-pulse">
                  Saved successfully!
                </span>
              )}
              <button
                onClick={() => handleSaveKit()}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-[13px] font-bold rounded-xl transition-all shadow-sm shadow-indigo-600/20 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Kit'}
              </button>
            </div>
          </div>
        </div>

        {/* Top Horizontal Navigation Tabs */}
        <div className="border-b border-slate-200/80 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 text-[13px] font-bold transition-all ${
                    isActive
                      ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-xl'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 rounded-t-xl'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="pt-2">

          {/* ── 1. OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-[16px] font-bold text-slate-900">Company Brief & Role Info</h2>
                <button
                  onClick={() => handleRegenerateSection('company_brief')}
                  disabled={regeneratingSection === 'company_brief'}
                  className="flex items-center gap-1.5 text-[12px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${regeneratingSection === 'company_brief' ? 'animate-spin' : ''}`} />
                  Regenerate Brief
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Brief Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-[14px] font-bold text-slate-900">About {kit.source?.company || 'Company'}</h3>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Company Summary</p>
                    <p className="text-[13px] text-slate-700 leading-relaxed">{kit.company_brief?.summary || 'No summary available.'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">What They Do</p>
                    <p className="text-[13px] text-slate-700 leading-relaxed">{kit.company_brief?.what_they_do || 'Information not provided.'}</p>
                  </div>
                  {kit.source?.company_url && (
                    <div className="pt-2">
                      <a href={kit.source.company_url} target="_blank" rel="noreferrer" className="text-[12px] font-bold text-indigo-600 hover:underline inline-flex items-center gap-1">
                        Visit Website <Globe className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Role Details Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-[14px] font-bold text-slate-900">Role Requirements & Info</h3>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Title</p>
                      <p className="text-[14px] font-bold text-slate-900">{kit.role?.title || 'Software Engineer'}</p>
                    </div>
                    {kit.role?.seniority && (
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Seniority</p>
                        <span className="text-[12px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-md border border-indigo-100">
                          {kit.role.seniority}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Core Responsibilities</p>
                    <ul className="space-y-1.5">
                      {kit.role?.responsibilities?.map((resp, i) => (
                        <li key={i} className="text-[13px] text-slate-700 flex items-start gap-2">
                          <span className="text-indigo-500 font-bold">•</span>
                          <span>{resp}</span>
                        </li>
                      )) || <p className="text-[13px] text-slate-400">No responsibilities listed.</p>}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 2. REQUIREMENTS TAB ── */}
          {activeTab === 'requirements' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[16px] font-bold text-slate-900">Role Requirements</h2>
                  <p className="text-[13px] text-slate-500">Key competencies extracted from the job description.</p>
                </div>
                <button
                  onClick={() => handleRegenerateSection('role')}
                  disabled={regeneratingSection === 'role'}
                  className="flex items-center gap-1.5 text-[12px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${regeneratingSection === 'role' ? 'animate-spin' : ''}`} />
                  Regenerate Requirements
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm overflow-hidden">
                {kit.role?.requirements?.map((req) => {
                  const kindColor: Record<RequirementKind, string> = {
                    technical: 'bg-indigo-50 text-indigo-700 border-indigo-100',
                    behavioural: 'bg-violet-50 text-violet-700 border-violet-100',
                    domain: 'bg-amber-50 text-amber-700 border-amber-100',
                  };

                  return (
                    <div key={req.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-extrabold text-slate-400 w-12 font-mono">{req.id}</span>
                        <span className="text-[14px] font-semibold text-slate-800">{req.text}</span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Priority Badge */}
                        {req.priority === 'must' ? (
                          <span className="text-[11px] font-bold bg-indigo-600 text-white px-2.5 py-0.5 rounded-md shadow-sm">
                            Must Have
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold border border-slate-300 text-slate-500 px-2 py-0.5 rounded-md">
                            Nice to Have
                          </span>
                        )}

                        {/* Kind Tag */}
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${kindColor[req.kind] || 'bg-slate-100 text-slate-600'}`}>
                          {req.kind}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── 3. QUESTIONS TAB ── */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[16px] font-bold text-slate-900">Question Bank</h2>
                  <p className="text-[13px] text-slate-500">Grouped by category with expandable answers and editable prompts.</p>
                </div>
                <button
                  onClick={() => handleRegenerateSection('questions')}
                  disabled={regeneratingSection === 'questions'}
                  className="flex items-center gap-1.5 text-[12px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${regeneratingSection === 'questions' ? 'animate-spin' : ''}`} />
                  Regenerate Questions
                </button>
              </div>

              {(['technical', 'behavioural', 'system-design', 'company-fit'] as QuestionCategory[]).map((cat) => {
                const catQs = (kit.questions || []).map((q, idx) => ({ ...q, originalIndex: idx })).filter(q => q.category === cat);

                return (
                  <div key={cat} className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold uppercase tracking-wider text-slate-500">{cat}</span>
                        <span className="text-[11px] font-bold bg-slate-200/60 text-slate-700 px-2 py-0.5 rounded-full">
                          {catQs.length}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAddQuestion(cat)}
                        className="text-[12px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Question
                      </button>
                    </div>

                    <div className="space-y-3">
                      {catQs.map((q) => (
                        <QuestionItem
                          key={q.id}
                          question={q}
                          onUpdate={(fields) => handleUpdateQuestion(q.originalIndex, fields)}
                          onDelete={() => handleDeleteQuestion(q.originalIndex)}
                          onMoveCategory={(newCat) => handleMoveQuestionCategory(q.originalIndex, newCat)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── 4. FLASHCARDS TAB ── */}
          {activeTab === 'flashcards' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[16px] font-bold text-slate-900">Flashcard Deck</h2>
                  <p className="text-[13px] text-slate-500">Tap cards to flip. Edit or add cards anytime.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddFlashcard()}
                    className="flex items-center gap-1.5 text-[12px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-xl transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Card
                  </button>
                  <button
                    onClick={() => handleRegenerateSection('flashcards')}
                    disabled={regeneratingSection === 'flashcards'}
                    className="flex items-center gap-1.5 text-[12px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${regeneratingSection === 'flashcards' ? 'animate-spin' : ''}`} />
                    Regenerate Flashcards
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {kit.flashcards?.map((fc, idx) => (
                  <FlashcardEditorCard
                    key={fc.id || idx}
                    card={fc}
                    index={idx}
                    onUpdate={(fields) => handleUpdateFlashcard(idx, fields)}
                    onDelete={() => handleDeleteFlashcard(idx)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── 5. SCHEDULE TAB ── */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[16px] font-bold text-slate-900">Day-by-Day Study Schedule</h2>
                  <p className="text-[13px] text-slate-500">Structured study plan over {kit.schedule?.days_available || 7} days.</p>
                </div>
                <button
                  onClick={() => handleRegenerateSection('schedule')}
                  disabled={regeneratingSection === 'schedule'}
                  className="flex items-center gap-1.5 text-[12px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${regeneratingSection === 'schedule' ? 'animate-spin' : ''}`} />
                  Regenerate Schedule
                </button>
              </div>

              <div className="space-y-3">
                {kit.schedule?.days?.map((day) => {
                  const isDone = doneDays.has(day.day);
                  const linkedQs = (kit.questions || []).filter(q => day.question_ids?.includes(q.id));
                  const cleanFocus = day.focus.replace(/^Day \d+:\s*/i, '');

                  return (
                    <div
                      key={day.day}
                      className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${isDone ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[13px] ${isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>
                            {isDone ? '✓' : day.day}
                          </span>
                          <div>
                            <h3 className={`text-[14px] font-bold ${isDone ? 'text-emerald-800 line-through decoration-emerald-300' : 'text-slate-900'}`}>
                              Day {day.day}: {cleanFocus}
                            </h3>
                            <p className="text-[12px] font-medium text-slate-400">
                              Duration: {day.minutes} mins • {linkedQs.length} questions linked
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setActiveDayPractice({
                              dayNum: day.day,
                              dayFocus: cleanFocus,
                              questions: linkedQs.length > 0 ? linkedQs : (kit.questions || []).slice(0, 3)
                            })}
                            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-sm"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                            Practice Day {day.day}
                          </button>

                          <button
                            onClick={() => toggleDayDone(day.day)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                              isDone ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            {isDone ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                            {isDone ? 'Completed' : 'Mark Done'}
                          </button>
                        </div>
                      </div>

                      {linkedQs.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                          {linkedQs.map((q, qIdx) => (
                            <div key={q.id || qIdx} className="text-[12px] font-medium text-slate-700 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                              <span className="truncate">{q.prompt}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── 6. PRACTICE TAB ── */}
          {activeTab === 'practice' && (
            <ScopedPracticeTab
              flashcards={kit.flashcards || []}
              confidenceMap={confidenceMap}
              onUpdateConfidence={updateConfidence}
            />
          )}

        </div>

      </div>

      {/* Sequential Day Practice Modal */}
      {activeDayPractice && (
        <DayPracticeModal
          dayNum={activeDayPractice.dayNum}
          dayFocus={activeDayPractice.dayFocus}
          questions={activeDayPractice.questions}
          totalDays={kit.schedule?.days?.length || 7}
          onClose={() => setActiveDayPractice(null)}
          onCompleteDay={() => {
            markDayDone(activeDayPractice.dayNum);
          }}
          onNextDay={() => {
            markDayDone(activeDayPractice.dayNum);
            const nextDayNum = activeDayPractice.dayNum + 1;
            const nextDay = kit.schedule?.days?.find(d => d.day === nextDayNum);
            if (nextDay) {
              const nextLinked = (kit.questions || []).filter(q => nextDay.question_ids?.includes(q.id));
              setActiveDayPractice({
                dayNum: nextDayNum,
                dayFocus: nextDay.focus.replace(/^Day \d+:\s*/i, ''),
                questions: nextLinked.length > 0 ? nextLinked : (kit.questions || []).slice(0, 3)
              });
            } else {
              setActiveDayPractice(null);
            }
          }}
        />
      )}
    </div>
  );
}

// ─── Sub-Component: DayPracticeModal ─────────────────────────────────────────
function DayPracticeModal({
  dayNum, dayFocus, questions, totalDays, onClose, onCompleteDay, onNextDay,
}: {
  dayNum: number;
  dayFocus: string;
  questions: Question[];
  totalDays: number;
  onClose: () => void;
  onCompleteDay: () => void;
  onNextDay: () => void;
}) {
  const [qIdx, setQIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);

  const currentQ = questions[qIdx];
  const isLast = qIdx === questions.length - 1;

  const handleNext = () => {
    if (!isLast) {
      setQIdx(i => i + 1);
      setRevealed(false);
    } else {
      setFinished(true);
      onCompleteDay();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[24px] shadow-2xl w-full max-w-xl p-7 relative space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">Day {dayNum} Practice Session</span>
            <h3 className="text-[16px] font-bold text-slate-900 mt-0.5">{dayFocus}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {finished ? (
          /* Day Completed Celebration */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-[20px] font-extrabold text-slate-900">Day {dayNum} Completed! 🎉</h2>
              <p className="text-[13px] text-slate-500 font-medium mt-1">
                Great job! All {questions.length} topic questions for Day {dayNum} have been reviewed.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-bold rounded-xl transition-colors"
              >
                Close & Review
              </button>
              {dayNum < totalDays && (
                <button
                  onClick={onNextDay}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  Start Day {dayNum + 1} Practice <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Question Stepper Flow */
          <div className="space-y-4">
            <div className="flex justify-between text-[12px] font-bold text-slate-400">
              <span>Question {qIdx + 1} of {questions.length}</span>
              <span className="text-indigo-600 uppercase">{currentQ?.category}</span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${((qIdx + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Prompt Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Question Prompt</p>
              <p className="text-[15px] font-bold text-slate-900 leading-snug">{currentQ?.prompt}</p>
            </div>

            {/* Answer Outline Box */}
            {revealed ? (
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-5 space-y-2 animate-fadeIn">
                <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Answer Key & Outline</p>
                <p className="text-[13px] font-medium text-slate-800 leading-relaxed whitespace-pre-line">{currentQ?.answer_outline}</p>
              </div>
            ) : (
              <button
                onClick={() => setRevealed(true)}
                className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold rounded-xl text-[13px] transition-colors"
              >
                Reveal Answer Key & Outline
              </button>
            )}

            {revealed && (
              <button
                onClick={handleNext}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[13px] transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {isLast ? 'Complete Day Practice ✨' : 'Next Question →'}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ─── Sub-Component: Question Item ─────────────────────────────────────────────
function QuestionItem({
  question, onUpdate, onDelete, onMoveCategory,
}: {
  question: Question;
  onUpdate: (fields: Partial<Question>) => void;
  onDelete: () => void;
  onMoveCategory: (newCat: QuestionCategory) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [promptText, setPromptText] = useState(question.prompt);
  const [outlineText, setOutlineText] = useState(question.answer_outline);

  const handleSaveEdit = () => {
    onUpdate({ prompt: promptText, answer_outline: outlineText });
    setEditing(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={promptText}
                onChange={e => setPromptText(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-semibold text-slate-900"
              />
              <textarea
                rows={3}
                value={outlineText}
                onChange={e => setOutlineText(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-medium text-slate-700"
              />
              <div className="flex gap-2">
                <button onClick={handleSaveEdit} className="px-3 py-1 bg-indigo-600 text-white text-[11px] font-bold rounded-md">Save</button>
                <button onClick={() => setEditing(false)} className="px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md">Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[14px] font-bold text-slate-900 leading-snug">{question.prompt}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {/* Difficulty Bars */}
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Diff:</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map(lvl => (
                      <span
                        key={lvl}
                        className={`w-2.5 h-2.5 rounded-full ${lvl <= question.difficulty ? 'bg-amber-400' : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Category Selector */}
                <select
                  value={question.category}
                  onChange={e => onMoveCategory(e.target.value as QuestionCategory)}
                  className="text-[11px] font-bold bg-slate-100 border border-slate-200 rounded-md px-2 py-0.5 text-slate-700 cursor-pointer"
                >
                  <option value="technical">Technical</option>
                  <option value="behavioural">Behavioural</option>
                  <option value="system-design">System Design</option>
                  <option value="company-fit">Company Fit</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!editing && (
            <button onClick={() => setEditing(true)} className="p-1 text-slate-400 hover:text-indigo-600">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={onDelete} className="p-1 text-slate-400 hover:text-red-500">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setExpanded(!expanded)} className="p-1 text-slate-400 hover:text-slate-600">
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {expanded && !editing && (
        <div className="border-t border-slate-100 pt-3 text-[13px] text-slate-700 bg-indigo-50/30 p-3 rounded-xl">
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-1">Answer Outline</p>
          <p className="leading-relaxed whitespace-pre-line">{question.answer_outline}</p>
        </div>
      )}
    </div>
  );
}

// ─── Sub-Component: Flashcard Editor Card ─────────────────────────────────────
function FlashcardEditorCard({
  card, index, onUpdate, onDelete,
}: {
  card: Flashcard;
  index: number;
  onUpdate: (fields: Partial<Flashcard>) => void;
  onDelete: () => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const [editing, setEditing] = useState(false);
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);

  const handleSave = () => {
    onUpdate({ front, back });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="bg-white border border-indigo-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Front Question</label>
          <input
            value={front}
            onChange={e => setFront(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-medium"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Back Explanation</label>
          <textarea
            rows={3}
            value={back}
            onChange={e => setBack(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[12px] font-medium"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} className="px-3 py-1 bg-indigo-600 text-white text-[11px] font-bold rounded-md">Save</button>
          <button onClick={() => setEditing(false)} className="px-3 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className="bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:border-indigo-300 hover:shadow-sm transition-all min-h-[160px] flex flex-col justify-between group relative"
    >
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
          {flipped ? 'Back (Answer)' : 'Front (Question)'}
        </span>
        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          <button onClick={() => setEditing(true)} className="p-1 text-slate-300 hover:text-indigo-600"><Edit3 className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-1 text-slate-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <p className="text-[14px] font-semibold text-slate-800 my-3 leading-snug">
        {flipped ? card.back : card.front}
      </p>

      <div className="text-[10px] font-bold text-slate-300 flex justify-between items-center pt-2 border-t border-slate-100">
        <span>Card #{index + 1}</span>
        <span>Tap to flip</span>
      </div>
    </div>
  );
}

// ─── Sub-Component: Scoped Practice Tab ───────────────────────────────────────
function ScopedPracticeTab({
  flashcards, confidenceMap, onUpdateConfidence,
}: {
  flashcards: Flashcard[];
  confidenceMap: ConfidenceMap;
  onUpdateConfidence: (cardId: string, c: Confidence) => void;
}) {
  const [inSession, setInSession] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  // Sort lowest confidence first
  const sortedCards = [...flashcards].sort((a, b) => {
    const order: Record<string, number> = { low: 1, medium: 2, high: 3 };
    const confA = order[confidenceMap[a.id]] || 0;
    const confB = order[confidenceMap[b.id]] || 0;
    return confA - confB;
  });

  const currentCard = sortedCards[currentIdx];
  const reviewedCount = flashcards.filter(fc => confidenceMap[fc.id]).length;

  const handleRate = (c: Confidence) => {
    if (!currentCard) return;
    onUpdateConfidence(currentCard.id, c);
    if (currentIdx < sortedCards.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setRevealed(false);
    } else {
      setInSession(false);
    }
  };

  if (!flashcards.length) {
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
        <p className="text-[15px] font-bold text-slate-600">No flashcards available in this kit to practice.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Coverage Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-[15px] font-bold text-slate-900">Kit Practice Coverage</h3>
            <p className="text-[12px] text-slate-400 font-medium">
              {reviewedCount} of {flashcards.length} cards reviewed in this kit
            </p>
          </div>
          <button
            onClick={() => { setInSession(true); setCurrentIdx(0); setRevealed(false); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[13px] rounded-xl transition-all shadow-sm"
          >
            <PlayCircle className="w-4 h-4" /> Start Practice Session
          </button>
        </div>

        <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${(flashcards.filter(c => confidenceMap[c.id] === 'high').length / flashcards.length) * 100}%` }}
          />
          <div
            className="h-full bg-amber-400 rounded-full"
            style={{ width: `${(flashcards.filter(c => confidenceMap[c.id] === 'medium').length / flashcards.length) * 100}%` }}
          />
          <div
            className="h-full bg-red-400 rounded-full"
            style={{ width: `${(flashcards.filter(c => confidenceMap[c.id] === 'low').length / flashcards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Practice Session Card View */}
      {inSession && currentCard && (
        <div className="bg-white border border-indigo-200 rounded-2xl p-6 shadow-md max-w-xl mx-auto space-y-4">
          <div className="flex justify-between items-center text-[12px] font-bold text-slate-400">
            <span>Card {currentIdx + 1} of {sortedCards.length}</span>
            <button onClick={() => setInSession(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
          </div>

          <div
            onClick={() => setRevealed(!revealed)}
            className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-6 cursor-pointer min-h-[160px] flex flex-col justify-between"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
              {revealed ? 'Answer Outline' : 'Question Prompt'}
            </span>
            <p className="text-[15px] font-semibold text-slate-900 my-4">
              {revealed ? currentCard.back : currentCard.front}
            </p>
            <span className="text-[11px] font-bold text-indigo-400 text-center">
              {revealed ? 'Tap to see prompt' : 'Tap to reveal answer'}
            </span>
          </div>

          {revealed ? (
            <div className="space-y-2 text-center pt-2">
              <p className="text-[12px] font-bold text-slate-500">Rate your confidence:</p>
              <div className="flex gap-3">
                <button onClick={() => handleRate('low')} className="flex-1 py-2.5 bg-red-50 text-red-700 font-bold border border-red-100 rounded-xl text-[13px] hover:bg-red-100">Low</button>
                <button onClick={() => handleRate('medium')} className="flex-1 py-2.5 bg-amber-50 text-amber-700 font-bold border border-amber-100 rounded-xl text-[13px] hover:bg-amber-100">Medium</button>
                <button onClick={() => handleRate('high')} className="flex-1 py-2.5 bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 rounded-xl text-[13px] hover:bg-emerald-100">High</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setRevealed(true)}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl text-[13px] hover:bg-indigo-700"
            >
              Reveal Answer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
