import mongoose from "mongoose";

/* 
Schema fields:
fullName: '',
mobileNo: '',
email: '',
representation: '',
parishAssociation: '',
communityZone: '',
timings: '',
date: '',
*/

const BookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobileNo: {
    type: String,
    required: true,
    trim: true,
  },
  representation: { type: String },
  parishAssociation: { type: String },
  communityZone: { type: String },
  timeSlot: { type: String, required: true },
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Avoid OverwriteModelError in Next.js (hot reload safety)
export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
