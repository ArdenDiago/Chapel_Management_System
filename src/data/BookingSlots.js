// src/data/BookingSlots.js
import mongoose from "mongoose";
import Slot from "../models/Slot.js";
import Booking from "../models/Booking.js";

export async function createBooking(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Step 1: Find and increment slot atomically (inside transaction)
        const slot = await Slot.findOneAndUpdate(
            {
                date: data.date,
                timeSlot: data.timeSlot,
                bookingsCount: { $lt: 5 },
            },
            {
                $inc: { bookingsCount: 1 },
                $setOnInsert: { date: data.date, timeSlot: data.timeSlot },
            },
            { new: true, upsert: true, session }
        );

        if (!slot) {
            throw new Error("This slot is full (max 5 bookings allowed)");
        }

        // Step 2: Save booking (also in same transaction)
        const booking = new Booking(data);
        await booking.save({ session });

        // ✅ Commit transaction
        await session.commitTransaction();
        session.endSession();

        return {
            success: true,
            response: "Booking successful!",
            booking,
        };
    } catch (err) {
        // ❌ Rollback on error
        await session.abortTransaction();
        session.endSession();

        // Handle duplicate key error separately
        if (err.code === 11000) {
            return {
                success: false,
                response: "Duplicate booking: You already booked this slot.",
            };
        }

        return {
            success: false,
            response: err.message || "Something went wrong",
        };
    }
}
