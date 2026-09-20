import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Kit } from '@/models/Kit';
import { runPrepKitPipeline } from '@/lib/pipeline';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const kits = await Kit.find({ userId: session.userId }).sort({ updatedAt: -1 });

    return NextResponse.json({ kits });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobDescription, companyUrl, daysAvailable } = await req.json();

    if (!jobDescription || !companyUrl || !daysAvailable) {
      return NextResponse.json(
        { error: 'jobDescription, companyUrl, and daysAvailable are required' },
        { status: 400 }
      );
    }

    // Run Full AI Pipeline
    const generatedKit = await runPrepKitPipeline({
      jobDescription,
      companyUrl,
      daysAvailable: Number(daysAvailable),
    });

    await connectToDatabase();

    const title = `${generatedKit.role.title} at ${generatedKit.source.company}`;
    const newKitDoc = await Kit.create({
      userId: session.userId,
      title,
      company: generatedKit.source.company,
      kit: generatedKit,
    });

    return NextResponse.json({
      id: newKitDoc._id.toString(),
      kit: generatedKit,
    });
  } catch (err: any) {
    console.error('Create Kit Error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to generate kit' }, { status: 500 });
  }
}
