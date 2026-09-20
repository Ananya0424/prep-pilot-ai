import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Kit } from '@/models/Kit';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const kitDoc = await Kit.findOne({ _id: params.id, userId: session.userId });
    if (!kitDoc) {
      return NextResponse.json({ error: 'Kit not found' }, { status: 404 });
    }

    return NextResponse.json({ id: kitDoc._id.toString(), kit: kitDoc.kit });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { kit } = await req.json();
    if (!kit) {
      return NextResponse.json({ error: 'Kit payload is required' }, { status: 400 });
    }

    await connectToDatabase();
    const kitDoc = await Kit.findOneAndUpdate(
      { _id: params.id, userId: session.userId },
      { kit, updatedAt: new Date() },
      { new: true }
    );

    if (!kitDoc) {
      return NextResponse.json({ error: 'Kit not found' }, { status: 404 });
    }

    return NextResponse.json({ id: kitDoc._id.toString(), kit: kitDoc.kit });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    await Kit.deleteOne({ _id: params.id, userId: session.userId });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server Error' }, { status: 500 });
  }
}
