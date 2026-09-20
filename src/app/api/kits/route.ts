import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Kit } from '@/models/Kit';
import { runPrepKitPipeline } from '@/lib/pipeline';

// In-memory fallback store for session kits when MongoDB is not connected
const memoryKits: Map<string, any> = new Map();

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      const kits = await Kit.find({ userId: session.userId }).sort({ updatedAt: -1 });
      return NextResponse.json({ kits });
    }

    const userKits = Array.from(memoryKits.values()).filter(k => k.userId === session.userId);
    return NextResponse.json({ kits: userKits });
  } catch (err: any) {
    return NextResponse.json({ kits: [] });
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

    const conn = await connectToDatabase();
    const title = `${generatedKit.role.title} at ${generatedKit.source.company}`;

    if (conn) {
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
    }

    // Fallback store in memory
    const memoryId = `kit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const kitObj = {
      _id: memoryId,
      userId: session.userId,
      title,
      company: generatedKit.source.company,
      kit: generatedKit,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryKits.set(memoryId, kitObj);

    return NextResponse.json({
      id: memoryId,
      kit: generatedKit,
    });
  } catch (err: any) {
    console.error('Create Kit Error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to generate kit' }, { status: 500 });
  }
}
