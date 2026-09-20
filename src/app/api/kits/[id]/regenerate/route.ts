import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Kit } from '@/models/Kit';
import { generateCompanyBrief } from '@/lib/pipeline/briefGenerator';
import { generateQuestionsAndFlashcards } from '@/lib/pipeline/questionGenerator';
import { buildDeterministicSchedule } from '@/lib/pipeline/scheduleAllocator';
import { PrepKit, Question } from '@/types/kit';
import { memoryKits } from '@/lib/memoryStore';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { section, currentKit } = await req.json();
    if (!section || !currentKit) {
      return NextResponse.json({ error: 'section and currentKit are required' }, { status: 400 });
    }

    const kit: PrepKit = currentKit;
    const updatedKit: PrepKit = JSON.parse(JSON.stringify(kit));

    if (section === 'company_brief') {
      // Regenerate Company Brief only
      const { brief } = await generateCompanyBrief(
        kit.source.company_url,
        `Re-research company brief for ${kit.source.company}`,
        kit.source.pages_used
      );
      updatedKit.company_brief = brief;

    } else if (section.startsWith('questions_')) {
      // Regenerate questions for a specific category (e.g. questions_technical)
      const targetCategory = section.replace('questions_', '');

      // Preserve pinned/manually edited questions in this category
      const preservedQuestions = kit.questions.filter(
        q => q.category === targetCategory && (q as any).isPinned
      );

      // Re-generate fresh questions for requirements of this category
      const relevantReqs = kit.role.requirements;
      const { questions: freshQuestions } = await generateQuestionsAndFlashcards(
        relevantReqs,
        kit.company_brief.summary,
        kit.questions.length + 10,
        kit.flashcards.length + 10
      );

      const categoryFresh = freshQuestions.filter(q => q.category === targetCategory);

      // Merge: Keep preserved + new fresh questions, keep all other categories untouched
      const otherCategoryQuestions = kit.questions.filter(q => q.category !== targetCategory);
      updatedKit.questions = [...otherCategoryQuestions, ...preservedQuestions, ...categoryFresh];

    } else if (section === 'schedule') {
      // Regenerate Schedule deterministically over current questions
      updatedKit.schedule = buildDeterministicSchedule(
        kit.schedule.days_available,
        kit.questions,
        kit.role.requirements
      );
    }

    // Update memory cache
    const memKit = memoryKits.get(params.id);
    if (memKit) {
      memKit.kit = updatedKit;
      memKit.updatedAt = new Date().toISOString();
      memoryKits.set(params.id, memKit);
    }

    // Persist to MongoDB if connected
    const conn = await connectToDatabase();
    if (conn) {
      try {
        await Kit.findByIdAndUpdate(params.id, { kit: updatedKit, updatedAt: new Date() });
      } catch (dbErr) {
        // Ignore DB update error
      }
    }

    return NextResponse.json({ kit: updatedKit });
  } catch (err: any) {
    console.error('Regenerate API Error:', err);
    return NextResponse.json({ error: err?.message || 'Regeneration failed' }, { status: 500 });
  }
}
