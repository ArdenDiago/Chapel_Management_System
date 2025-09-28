import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { NextResponse } from "next/server";

import { createBooking } from "../../../data/BookingSlots"


export async function POST(req) {
  await connectDB();

  const body = await req.json();
  const { data } = body;

  if (!data || !Array.isArray(data) || data.length === 0) {
    return NextResponse.json({ success: false, response: "Invalid Data" }, { status: 400 });
  }

  console.log("Received bookings:", data);

  const successfulBookings = [];
  const failedBookings = [];

  for (const d of data) {
    const {
      fullName,
      mobileNo,
      email,
      representation,
      parishAssociation,
      communityZone,
      timeSlot,
      date,
    } = d;

    const DB_Data = {
      name: fullName,
      email: email || "email@gmail.com",
      mobileNo,
      representation,
      parishAssociation,
      communityZone,
      timeSlot,
      date,
    };

    try {
      const result = await createBooking(DB_Data);

      if (result.success) {
        successfulBookings.push(DB_Data);
        console.log("Saved booking:", DB_Data);
      } else {
        failedBookings.push({ ...DB_Data, error: result.response || "Time slot already booked" });
        console.log("Failed booking:", DB_Data, "Reason:", result.response);
      }

    } catch (err) {
      console.error("Error saving booking:", DB_Data, err);
      failedBookings.push({ ...DB_Data, error: "Unexpected error" });
    }
  }

  const allSuccess = failedBookings.length === 0;

  return NextResponse.json(
    {
      success: allSuccess,
      successfulBookings,
      failedBookings,
    },
    { status: allSuccess ? 200 : 207 } // 207 = multi-status (partial success)
  );
}

export async function GET() {
  try {
    await connectDB();
    const bookings = await Booking.find();
    return new Response(JSON.stringify(bookings), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Error fetching bookings", { status: 500 });
  }
}
