// pages/api/admin/createUser.js
import connectDB from '../../../../lib/mongodb';
import User from '../../../models/User';
import bcrypt from 'bcrypt';

connectDB();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { masterEmail, name, email, password } = req.body;

  try {
    // Check if master admin
    const master = await User.findOne({ email: masterEmail });
    if (!master || master.role !== 'master') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check for existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new admin user
    const user = new User({ name, email, password: passwordHash, role: 'admin' });
    await user.save();

    res.status(201).json({ success: true, message: 'Admin user created', user: { name, email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
}
