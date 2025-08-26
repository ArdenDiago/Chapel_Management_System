// src/app/api/admin/bookings/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb"; // adjust path if needed
import Booking from "@/models/Booking";

// GET all bookings
export async function GET() {
  try {
    await connectDB();
    const bookings = await Booking.find().sort({ date: 1, timeSlot: 1 });
    console.log("Booking: ",bookings);
    return NextResponse.json({ success: true, data: bookings });
  } catch (err) {
    console.error("❌ Error fetching bookings:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// Update booking
export async function PUT(req) {
  try {
    await connectDB();
    const { id, updates } = await req.json();

    const updated = await Booking.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("❌ Error updating booking:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

// Delete booking
export async function DELETE(req) {
  try {
    await connectDB();
    const { id } = await req.json();

    const deleted = await Booking.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: deleted });
  } catch (err) {
    console.error("❌ Error deleting booking:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
