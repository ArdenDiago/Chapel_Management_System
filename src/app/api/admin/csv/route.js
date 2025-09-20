// src/app/api/admin/bookings/csv/route.js
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET() {
  try {
    await connectDB();
    const bookings = await Booking.find().sort({ date: 1, timeSlot: 1 });

    // CSV headers
    let csv = "Date,Time Slot,Full Name,Email,Mobile,Parish Association\n";

    // Add rows
    bookings.forEach((b) => {
      csv += `"${b.date}","${b.timeSlot}","${b.fullName || b.name || ""}","${b.email || ""}","${b.mobileNo || ""}","${b.parishAssociation || ""}"\n`;
    });

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "inline; filename=bookings.csv",
      },
    });
  } catch (err) {
    console.error("❌ Error exporting CSV:", err);
    return new Response("Failed to export CSV", { status: 500 });
  }
}
