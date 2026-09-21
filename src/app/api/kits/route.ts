import { NextResponse } from 'next/server';
import { getSessionUser, signToken, setTokenCookie } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Kit } from '@/models/Kit';
import { runPrepKitPipeline } from '@/lib/pipeline';
import { memoryKits } from '@/lib/memoryStore';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let session = await getSessionUser();
    if (!session) {
      const demoUserId = 'demo-user-123';
      const token = signToken(demoUserId, 'candidate@example.com');
      setTokenCookie(token);
      session = { userId: demoUserId, email: 'candidate@example.com' };
    }

    const conn = await connectToDatabase();
    if (conn) {
      const dbKits = await Kit.find({ userId: session.userId }).sort({ updatedAt: -1 });
      const memKitsList = Array.from(memoryKits.values()).filter(k => k.userId === session.userId);
      const kitMap = new Map();
      [...memKitsList, ...dbKits].forEach(k => {
        const id = k._id ? k._id.toString() : k.id;
        if (id) kitMap.set(id, k);
      });
      return NextResponse.json({ kits: Array.from(kitMap.values()) });
    }

    const userKits = Array.from(memoryKits.values());
    return NextResponse.json({ kits: userKits });
  } catch (err: any) {
    return NextResponse.json({ kits: Array.from(memoryKits.values()) });
  }
}

export async function POST(req: Request) {
  try {
    let session = await getSessionUser();
    if (!session) {
      const demoUserId = 'demo-user-123';
      const token = signToken(demoUserId, 'candidate@example.com');
      setTokenCookie(token);
      session = { userId: demoUserId, email: 'candidate@example.com' };
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

    // Save in memory cache
    memoryKits.set(memoryId, kitObj);

    if (conn) {
      try {
        const newKitDoc = await Kit.create({
          userId: session.userId,
          title,
          company: generatedKit.source.company,
          kit: generatedKit,
        });

        // Also save doc ID in memory cache for instant lookup
        memoryKits.set(newKitDoc._id.toString(), {
          _id: newKitDoc._id.toString(),
          userId: session.userId,
          title,
          company: generatedKit.source.company,
          kit: generatedKit,
        });

        return NextResponse.json({
          id: newKitDoc._id.toString(),
          kit: generatedKit,
        });
      } catch (dbErr) {
        // Fallback to memory ID if DB write fails
      }
    }

    return NextResponse.json({
      id: memoryId,
      kit: generatedKit,
    });
  } catch (err: any) {
    console.error('Create Kit Error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to generate kit' }, { status: 500 });
  }
}
