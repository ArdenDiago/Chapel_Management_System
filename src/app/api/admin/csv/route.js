// src/app/api/admin/bookings/csv/route.js
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET() {
    try {
        await connectDB();
        const bookings = await Booking.find().sort({ date: 1, timeSlot: 1 });

        // CSV headers
        let csv = "Date,Time Slot,Full Name,Mobile,Individual,Parish Association,Community Zone\n";

        // Add rows
        bookings.forEach((b) => {
            const dateStr = new Date(b.date).toISOString().split("T")[0];
            csv += `"${dateStr}","${b.timeSlot}","${b.fullName || b.name || ""}","${b.mobileNo || ""}",${b.parishAssociation & b.communityZone ? "Yes":"No"},"${b.parishAssociation || "No"}, ${b.communityZone || "No"}"\n`;
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
