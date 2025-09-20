// src/app/api/admin/bookings/csv/route.js
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import {csvPassword} from "@/lib/envVariables"
// put your secret password in an environment variable
const CSV_EXPORT_PASSWORD = csvPassword || "mySecret123";

export async function GET(req) {
  try {
    // 🔑 check query params for password
    const { searchParams } = new URL(req.url);
    const password = searchParams.get("password");

    if (password !== CSV_EXPORT_PASSWORD) {
      return new Response("❌ Access denied: Invalid password", { status: 403 });
    }

    await connectDB();
    const bookings = await Booking.find().sort({ date: 1, timeSlot: 1 });

    // CSV headers
    let csv =
      "Date,Time Slot,Full Name,Mobile,Individual,Parish Association,Community Zone\n";

    // Add rows
    bookings.forEach((b) => {
      const dateStr = new Date(b.date).toISOString().split("T")[0];
      csv += `"${dateStr}","${b.timeSlot}","${b.fullName || b.name || ""}","${
        b.mobileNo || ""
      }",${b.parishAssociation && b.communityZone ? "Yes" : "No"},"${
        b.parishAssociation || "No"
      }","${b.communityZone || "No"}"\n`;
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
