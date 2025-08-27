// src/app/api/admin/users/route.js
import { connectDB } from '@/lib/mongodb';
import users from '@/models/users';

export async function GET() {
  try {
    await connectDB();

    const data = await users.find({});
    const safeAdmins = data.map(u => ({ name: u.name, role: u.role }));

    return new Response(JSON.stringify({ success: true, data: safeAdmins }), {
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
