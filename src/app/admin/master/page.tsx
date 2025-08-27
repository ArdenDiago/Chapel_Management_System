'use client';

import { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';

type User = { name: string; role: string; };
type Booking = { fullName: string; mobileNo?: string; date: string; timeSlot: string; };

export default function MasterAdmin() {
    const [users, setUsers] = useState<User[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [newUser, setNewUser] = useState({ name: '', password: '' });

    // Fetch bookings (all bookings are accessible)
    const fetchBookings = async () => {
        const res = await fetch('/api/admin/bookings');
        const data = await res.json();
        if (data.success) setBookings(data.data);
    };

    // Fetch list of admins
    const fetchUsers = async () => {
        const res = await fetch('/api/admin/users'); // API should return list of admins
        console.log(res);
        const data = await res.json();
        if (data.success) setUsers(data.data);
    };

    // Add a new admin
    const handleAddUser = async () => {
        const res = await fetch('/api/admin/createUser', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser),
        });
        console.log(res);

        const data = await res.json();
        if (data.success) fetchUsers();
    };

    useEffect(() => {
        fetchBookings();
        fetchUsers();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <NavBar />

            <main className="container mx-auto p-4 md:p-8">
                <h1 className="text-3xl font-bold mb-6 text-indigo-700">Master Admin Dashboard</h1>

                {/* Add Admin Form */}
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h2 className="font-semibold text-lg mb-2">Add New Admin</h2>
                    <input
                        className="border p-2 rounded mr-2"
                        placeholder="Name"
                        value={newUser.name}
                        onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                    />
                    <input
                        className="border p-2 rounded mr-2"
                        placeholder="Password"
                        value={newUser.password}
                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    />
                    <button
                        onClick={handleAddUser}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                        Add Admin
                    </button>
                </div>

                {/* Admin Users */}
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h2 className="font-semibold text-lg mb-2">Admin Users</h2>
                    <ul>
                        {users.map((u, idx) => (
                            <li key={idx}>{u.name} - {u.role}</li>
                        ))}
                    </ul>
                </div>

                {/* Bookings */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="font-semibold text-lg mb-2">Bookings</h2>
                    <ul>
                        {bookings.map((b, idx) => (
                            <li key={idx}>{b.fullName} | {b.mobileNo || '-'} | {b.date} | {b.timeSlot}</li>
                        ))}
                    </ul>
                </div>
            </main>

            <Footer />
        </div>
    );
}
