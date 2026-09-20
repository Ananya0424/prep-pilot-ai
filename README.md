# PrepPilot AI — Personalised AI Interview Preparation Kit Engine

> Full-Stack AI Engineering Assessment Submission for Trao (`FS-AI-INTERVIEW-01`).

PrepPilot AI is an AI-powered web application and CLI pipeline that transforms job descriptions and company website URLs into structured, personalized interview preparation kits — including company briefs, role requirement breakdowns, categorized question banks, flashcards, interactive practice modes, and deterministic daily study schedules.

---

## 1. Tech Stack & Architecture

### Tech Stack
- **Frontend:** Next.js 14 (App Router, TypeScript, Tailwind CSS, Lucide Icons)
- **Backend:** Node.js / Next.js API Routes (TypeScript)
- **Database:** MongoDB (Mongoose, Atlas Free Tier)
- **AI Engine:** Google Gemini API (`gemini-1.5-flash`) / OpenAI SDK with exponential backoff rate-limit retry handler
- **Scraping Engine:** Cheerio + Axios (Robots.txt parser, relative link resolver, link ranker)
- **Testing:** Vitest (Schedule allocation math, requirement coverage checking, Zod schema validator)

---

## 2. Quick Start & Setup Instructions

### Prerequisites
- Node.js v18+
- npm or yarn

### Local Setup
```bash
# 1. Clone repository
git clone <your-repo-url>
cd PrepPilot-AI

# 2. Install dependencies
npm install

# 3. Create .env file (copy from .env.example)
cp .env.example .env

# Set your API Key in .env:
# GEMINI_API_KEY=your_gemini_api_key
```

### Running the Web Application
```bash
# Start local dev server
npm run dev

# Open http://localhost:3000 in your browser
```

---

## 3. Mandatory Batch Entry Point (Section 9)

You can run the full retrieval, generation, and validation pipeline headlessly via CLI without opening the UI:

```bash
npm run evaluate -- --input <cases.json> --output <kits.json>
```

### Example Usage:
```bash
npm run evaluate -- --input sample_cases.json --output sample_results.json
```

---

## 4. Multi-Step Research & Generation Pipeline

The kit is generated through a sequence of deliberate, non-monolithic steps:

```
[1. Web Crawling & Scraping]
       │ Crawls company site, ranks links (careers/about), respects robots.txt
       ▼
[2. Requirement Extraction]
       │ Extracts title, seniority, responsibilities & requirements (must vs. nice)
       ▼
[3. Company Brief Generation]
       │ Summarizes company product, culture & hiring details honestly
       ▼
[4. Question & Flashcard Draft (Pass 1)]
       │ Generates categorized questions & revision cards linked to requirement IDs
       ▼
[5. Deterministic Coverage Check (Non-LLM)]
       │ Code checks if every MUST-HAVE requirement has >= 1 question
       ├── Gaps Found? ──► [6. The Second Pass Loop] ──► Re-check
       └── 0 Gaps?
       ▼
[7. Deterministic Schedule Allocation (Non-LLM)]
       │ Arithmetic distribution of questions across requested days
       ▼
[8. Appendix A Zod Schema Validation]
```

---

## 5. State Management: Generated, Edited & Pinned State

One of the core requirements is that **regenerating one section must not clobber user manual edits**.

### How it works:
1. When a user manually edits a question, answer outline, or adds a custom question, the item is tagged with `isPinned: true`.
2. When the user clicks **Regenerate Section** (e.g. `questions_technical`):
   - All questions in that category with `isPinned: true` are preserved.
   - Unpinned questions are refreshed via the LLM pipeline.
   - Preserved + fresh questions are merged back smoothly.

---

## 6. Deterministic Schedule Allocation Algorithm

As required by Section 8, schedule creation is **pure arithmetic and allocation in code**, not handed to the LLM prompt:

- Questions are sorted by **Priority** (Must-haves first) and **Difficulty** (3 -> 2 -> 1).
- Questions are distributed round-robin across the requested `days_available`.
- Harder and higher-priority topics are placed in earlier days.
- Durations are calculated in **integer minutes** (Difficulty 3 = 45m, 2 = 30m, 1 = 20m).

---

## 7. Creative Feature: Weak Spots Report & Smart Coach

In **Practice Mode**, candidates flip flashcards and rate their confidence (Low, Medium, High). 

When the session finishes:
- The **Weak Spots Report** analyzes low-confidence cards and flags requirement areas needing urgent review.
- Clicking **Start Next Session (Confidence-Sorted)** automatically sorts the queue by lowest confidence cards first (Spaced Repetition).
- Clicking **Print 1-Pager Summary** exports a clean, printable summary for offline practice.

---

## 8. Unit Testing

Run unit tests covering schedule allocation, coverage checking, and schema validation:

```bash
npm test
```
