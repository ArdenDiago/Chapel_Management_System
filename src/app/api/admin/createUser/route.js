// src/app/api/admin/createUser/route.js
import { connectDB } from '@/lib/mongodb';
import users from '@/models/users';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, password, role = 'admin' } = body;

    if (!name || !password) {
      return new Response(JSON.stringify({ success: false, message: 'Name and password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await connectDB();

    const existingUser = await users.findOne({ name });
    if (existingUser) {
      return new Response(JSON.stringify({ success: false, message: 'User already exists' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    console.log("Hash password: ", password);

    const hashedPassword = password;

    await users.create({
      name,
      role,
      passwordHash: hashedPassword,
      createdAt: new Date(),
    });

    return new Response(JSON.stringify({ success: true, message: 'Admin created' }), {
      status: 201,
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
