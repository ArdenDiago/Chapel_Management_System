import { connectDB } from '@/lib/mongodb';
import users from '@/models/users';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, password } = body;

    if (!name || !password) {
      return new Response(JSON.stringify({ success: false, message: 'Name and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await connectDB();

    const user = await users.findOne({ name });
    if (!user) {
      return new Response(JSON.stringify({ success: false, message: 'User not found' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log("User: ",user);

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = jwt.sign({ userId: user._id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    return new Response(JSON.stringify({ success: true, token, user: { name: user.name, role: user.role } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, message: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
