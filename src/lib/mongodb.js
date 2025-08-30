import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { MONGODB_URI, adminPassword } from "./envVariables";

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("✅ MongoDB connected");

    const db = conn.connection.db;
    const usersCollection = db.collection("users");

    // master admin:
    const defaultAdmin = {
      name: "admin".toUpperCase(),
      passwordHash: await bcrypt.hash(adminPassword, 10), // hash the password
      role: "master",
    };

    // 🔹 check if a user exists
    const user = await usersCollection.findOne({ name: defaultAdmin.name });

    if (user) {
      console.log("✅ User found:", user.name);
    } else {
      console.log("⚠️ No such user found, creating default admin...");
      await usersCollection.insertOne(defaultAdmin);
      console.log("✅ Default admin created");
    }
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw new Error("Failed to connect to MongoDB");
  }
}
