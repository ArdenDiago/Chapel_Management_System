import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { NextResponse } from "next/server";

import { createBooking } from "../../../data/BookingSlots"

export async function POST(req) {
  await connectDB(); // only runs in Node runtime ✅
  const data = await req.json();
  // ... save booking
  console.log("Mobile No: ", typeof (data.mobileNo));

  if (!data) {
    NextResponse.json({ success: false, response: "Invalid Data" });
  }

  const { fullName,
    mobileNo,
    email,
    representation,
    parishAssociation,
    communityZone,
    timeSlot,
    date } = data;

  console.log("Data", data);

  const DB_Data = {
    name: fullName,
    email: "email@gmail.com",
    mobileNo: mobileNo,
    representation: representation,
    parishAssociation: parishAssociation,
    communityZone: communityZone,
    timeSlot: timeSlot,
    date: date,
  }
  const result = await createBooking(DB_Data);
  console.log(DB_Data);
  console.log(result);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
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
