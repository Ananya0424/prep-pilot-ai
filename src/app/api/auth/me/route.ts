import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      const user = await User.findById(session.userId).select('-passwordHash');
      if (user) {
        return NextResponse.json({
          user: { id: user._id.toString(), email: user.email, name: user.name },
        });
      }
    }

    return NextResponse.json({
      user: { id: session.userId, email: session.email, name: 'Candidate' },
    });
  } catch (err: any) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
