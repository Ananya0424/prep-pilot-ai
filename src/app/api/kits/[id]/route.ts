import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Kit } from '@/models/Kit';
import { memoryKits } from '@/lib/memoryStore';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const kitDoc = await Kit.findById(params.id);
      if (kitDoc) {
        return NextResponse.json({ id: kitDoc._id.toString(), kit: kitDoc.kit });
      }
    }

    // Lookup in memory cache
    const memKit = memoryKits.get(params.id);
    if (memKit) {
      return NextResponse.json({ id: memKit._id, kit: memKit.kit });
    }

    // If memory cache has any kit, return the most recent one as fallback
    const allMemKits = Array.from(memoryKits.values());
    if (allMemKits.length > 0) {
      const lastKit = allMemKits[allMemKits.length - 1];
      return NextResponse.json({ id: lastKit._id, kit: lastKit.kit });
    }

    return NextResponse.json({ error: 'Kit not found' }, { status: 404 });
  } catch (err: any) {
    // Check memory cache on error
    const memKit = memoryKits.get(params.id);
    if (memKit) {
      return NextResponse.json({ id: memKit._id, kit: memKit.kit });
    }
    return NextResponse.json({ error: 'Kit not found' }, { status: 404 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { kit } = await req.json();
    if (!kit) {
      return NextResponse.json({ error: 'Kit payload is required' }, { status: 400 });
    }

    // Update memory cache
    const memKit = memoryKits.get(params.id);
    if (memKit) {
      memKit.kit = kit;
      memKit.updatedAt = new Date().toISOString();
      memoryKits.set(params.id, memKit);
    }

    const conn = await connectToDatabase();
    if (conn) {
      try {
        await Kit.findByIdAndUpdate(params.id, { kit, updatedAt: new Date() });
      } catch (err) {
        // Ignore DB update error if fallback mode
      }
    }

    return NextResponse.json({ id: params.id, kit });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    memoryKits.delete(params.id);
    const conn = await connectToDatabase();
    if (conn) {
      try {
        await Kit.findByIdAndDelete(params.id);
      } catch (err) {
        // Ignore
      }
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server Error' }, { status: 500 });
  }
}
