// src/app/api/admin/bookings/route.js
import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/users';

export async function GET(req) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const email = url.searchParams.get('email');

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

export async function DELETE(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response(JSON.stringify({ success: false, message: "Missing booking id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const deletedBooking = await Booking.findByIdAndDelete(id);

    if (!deletedBooking) {
      return new Response(JSON.stringify({ success: false, message: "Booking not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Booking deleted successfully", data: deletedBooking }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("DELETE /api/admin/bookings error:", err);
    return new Response(JSON.stringify({ success: false, message: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
