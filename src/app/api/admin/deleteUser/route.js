// /src/app/api/admin/deleteUser/route.js
import { connectDB } from '@/lib/mongodb';
import users from '@/models/users';

connectDB();

export async function DELETE(req) {
  try {
    const { user, email } = await req.json();

    // if (!email || !masterEmail) {
    //   return new Response(JSON.stringify({ success: false, message: 'Missing required fields' }), { status: 400 });
    // }
    console.log("email: ", email);

    const master = await users.findOne({ name: user });
    console.log(user);
    if (!master || master.role !== 'master') {
      return new Response(JSON.stringify({ success: false, message: 'Not authorized' }), { status: 403 });
    }

    const result = await users.deleteOne({ name: email });

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ success: false, message: 'User not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, message: 'User deleted successfully' }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, message: 'Server error' }), { status: 500 });
  }
}
