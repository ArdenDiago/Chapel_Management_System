// src/app/api/admin/bookings/route.js
import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/users';

export async function GET(req) {
  try {
    await connectDB();

    // Optional: get query params if needed
    const url = new URL(req.url);
    const email = url.searchParams.get('email');

    // If you want to check authorization:
    if (email) {
      const user = await User.findOne({ email });
      if (!user) {
        return new Response(JSON.stringify({ success: false, message: 'Not authorized' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const bookings = await Booking.find();

    return new Response(JSON.stringify({ success: true, data: bookings }), {
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
