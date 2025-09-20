// src/app/api/admin/bookings/excel/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET() {
  try {
    await connectDB();

    const bookings = await Booking.find().sort({ date: 1, timeSlot: 1 });

    // Group by date
    const grouped = bookings.reduce((acc, booking) => {
      const date = booking.date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(booking);
      return acc;
    }, {});

    // Convert to array for Excel
    const summary = Object.entries(grouped).map(([date, entries]) => ({
      date,
      users: entries.length,
      names: entries.map((b) => b.fullName || b.name || "Unknown").join(", "),
    }));

    return NextResponse.json(summary); // 👈 Excel can read this
  } catch (err) {
    console.error("❌ Error fetching excel data:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch excel data" },
      { status: 500 }
    );
  }
}
