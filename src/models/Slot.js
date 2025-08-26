import mongoose from "mongoose";


const SlotSchema = new mongoose.Schema({
  date: { type: String, required: true },
  timeSlot: { type: String, required: true },
  bookingsCount: { type: Number, default: 0 },
});

// ensure uniqueness of date+timeSlot combo
SlotSchema.index({ date: 1, timeSlot: 1 }, { unique: true });

export default mongoose.models.Slot || mongoose.model("Slot", SlotSchema);
