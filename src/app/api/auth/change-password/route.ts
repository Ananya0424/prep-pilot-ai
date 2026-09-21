import { NextResponse } from 'next/server';
import { getSessionUser, comparePassword, hashPassword } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 });
    }

    const conn = await connectToDatabase();
    if (conn) {
      const user = await User.findById(session.userId);
      if (user) {
        const isValid = await comparePassword(currentPassword, user.passwordHash);
        if (!isValid) {
          return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        user.passwordHash = await hashPassword(newPassword);
        await user.save();

        return NextResponse.json({ message: 'Password updated successfully' });
      }
    }

    // Demo mode fallback if DB not connected
    return NextResponse.json({ message: 'Password updated successfully (Demo Mode)' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update password' }, { status: 500 });
  }
}
