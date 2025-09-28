// src/app/api/admin/bookings/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb"; // adjust path if needed
import Booking from "@/models/Booking";

// GET all bookings
export async function GET() {
  try {
    await connectDB();
    const bookings = await Booking.find().select({ name: 1, date: 1, timeSlot: 1 }).sort({ date: 1, timeSlot: 1 });
    console.log("Booking: ", bookings);
    return NextResponse.json({ success: true, data: bookings });
  } catch (err) {
    console.error("❌ Error fetching bookings:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}