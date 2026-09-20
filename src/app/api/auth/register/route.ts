import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { hashPassword, signToken, setTokenCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || password.length < 4) {
      return NextResponse.json({ error: 'Valid email and password (min 4 chars) are required' }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const newUser = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      name: name || '',
    });

    const token = signToken(newUser._id.toString(), newUser.email);
    setTokenCookie(token);

    return NextResponse.json({
      user: { id: newUser._id.toString(), email: newUser.email, name: newUser.name },
    });
  } catch (err: any) {
    console.error('Register API Error:', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
