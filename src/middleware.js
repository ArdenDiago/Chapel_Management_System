// src/middleware.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function middleware(req) {
  // await connectDB(); // ensures DB is ready before any route
  return NextResponse.next();
}
