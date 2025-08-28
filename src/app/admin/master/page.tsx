'use client';

import { useState, useEffect } from 'react';
import NavBarWithLogout from '@/app/components/NavBarWithLogout';
import Footer from '../../components/Footer';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { jwtDecode } from 'jwt-decode'; // fixed import
import 'react-big-calendar/lib/css/react-big-calendar.css';
import bcrypt from 'bcryptjs';

type User = { name: string; role: string; email?: string };
type Booking = {
    _id: string;
    fullName?: string;
    name?: string;
    email?: string;
    mobileNo?: string;
    representation?: string;
    parishAssociation?: string;
    communityZone?: string;
    timeSlot: string;
    date: string;
};
type CalendarEvent = { id: string; title: string; start: Date; end: Date; resource: Booking };
type JWTPayload = { name?: string; role?: string;[key: string]: unknown };

const localizer = momentLocalizer(moment);

export default function MasterAdmin() {
    const [users, setUsers] = useState<User[]>([]);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [enPasswd, setEnPasswd] = useState<string>("");
    // selectedBooking is not used, so removed
    const [currentUser, setCurrentUser] = useState<string>("");
    const [filterDate, setFilterDate] = useState<string>("");
    const [newUser, setNewUser] = useState({ name: '', password: '', role: '' });

    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // Message states for Add User
    const [userMessage, setUserMessage] = useState<string | null>(null);
    const [userMessageType, setUserMessageType] = useState<'success' | 'error' | null>(null);

    // Delete booking
    const [deleteBookingMessage, setDeleteBookingMessage] = useState<string | null>(null);
    const [deleteBookingMessageType, setDeleteBookingMessageType] = useState<'success' | 'error' | null>(null);


    // Decode JWT
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode<JWTPayload>(token);
                setCurrentUser((decoded.name as string) || "Admin");
            } catch (_err) {
                console.error("Invalid JWT", _err);
            }
        }
    }, []);

    // Fetch users
    const fetchUsers = async () => {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        if (data.success) setUsers(data.data);
    };

    // Fetch bookings
    const fetchBookings = async () => {
        const res = await fetch('/api/admin/bookings');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
            console.log(data.data);
            setBookings(data.data);
            const mapped: CalendarEvent[] = data.data.map((booking: Booking) => {
                const [startTimeRaw, endTimeRaw] = (booking.timeSlot || "").split(" - ").map(s => s?.trim() || "");
                const start = startTimeRaw && endTimeRaw
                    ? moment(`${booking.date} ${startTimeRaw}`, "YYYY-MM-DD h:mma").toDate()
                    : moment(booking.date, "YYYY-MM-DD").startOf("day").toDate();
                const end = startTimeRaw && endTimeRaw
                    ? moment(`${booking.date} ${endTimeRaw}`, "YYYY-MM-DD h:mma").toDate()
                    : moment(booking.date, "YYYY-MM-DD").endOf("day").toDate();
                return { id: booking._id, title: booking.fullName || booking.name || "Booking", start, end, resource: booking };
            });
            setEvents(mapped);
        }
    };

    useEffect(() => { fetchBookings(); fetchUsers(); }, []);

    const filteredBookings = filterDate ? bookings.filter(b => b.date === filterDate) : [];

    // Add new user
    const handleAddUser = async () => {
        setUserMessage(null);

        if (!newUser.name || !newUser.password || !newUser.role) {
            setUserMessage("Please fill all fields and select a role.");
            setUserMessageType("error");
            return;
        }

        try {
            // hash password directly into a local variable
            const hashedPassword = await bcrypt.hash(newUser.password, 10);

            const res = await fetch('/api/admin/createUser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newUser.name,
                    role: newUser.role,
                    password: hashedPassword, // send hashed password
                }),
            });

            const data = await res.json();

            if (data.success) {
                fetchUsers();
                setUserMessage("User created successfully!");
                setUserMessageType("success");
                // reset form fields
                setNewUser({ name: '', password: '', role: '' });
            } else {
                setUserMessage(data.message || "Failed to create user.");
                setUserMessageType("error");
            }
        } catch (err) {
            setUserMessage("Server error during user creation.");
            setUserMessageType("error");
            console.error(err);
        }
    };


    // Delete user modal
    const handleDeleteUser = async (email: string) => {
        setDeleteError(null);
        setDeleteTarget(email);
        setShowDeleteModal(true);
    };

    const confirmDeleteUser = async () => {
        if (!deleteTarget) return;
        try {
            const res = await fetch('/api/admin/deleteUser', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: currentUser, email: deleteTarget }),
            });
            const data = await res.json();
            if (!data.success) {
                setDeleteError(data.message || "Failed to delete admin");
                return;
            }
            fetchUsers();
            setShowDeleteModal(false);
            setDeleteTarget(null);
        } catch (_err) {
            setDeleteError("Server error during deletion");
            console.error(_err);
        }
    };

    const deleteUserBooking = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/bookings?id=${id}`, { method: "DELETE" });
            const data = await res.json();

            if (!data.success) {
                setDeleteBookingMessage(data.message || "Failed to delete booking");
                setDeleteBookingMessageType("error");
                return;
            }

            // ✅ Update local state (remove deleted booking)
            setBookings(prev => prev.filter(b => b._id !== id));
            setFilteredBookings(prev => prev.filter(b => b._id !== id));

            setDeleteBookingMessage("Booking deleted successfully");
            setDeleteBookingMessageType("success");
        } catch (err: any) {
            setDeleteBookingMessage(err.message || "Error deleting booking");
            setDeleteBookingMessageType("error");
        }
    };


    return (
        <div className={`min-h-screen flex flex-col ${showDeleteModal ? "overflow-hidden" : ""}`}>
            <NavBarWithLogout />
            <main className={`container mx-auto p-4 md:p-8 ${showDeleteModal ? "blur-sm pointer-events-none" : ""}`}>
                <h1 className="text-3xl font-bold mb-6 text-indigo-700">Welcome, {currentUser}</h1>

                {/* Add Admin */}
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h2 className="font-semibold text-lg mb-2">Add New User</h2>
                    {userMessage && (
                        <div className={`mb-4 p-2 rounded ${userMessageType === 'success' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                            {userMessage}
                        </div>
                    )}
                    <input
                        className="border p-2 rounded mr-2 mb-2 block"
                        placeholder="Name"
                        value={newUser.name}
                        onChange={e => setNewUser({ ...newUser, name: e.target.value.toUpperCase() })}
                    />
                    <input
                        className="border p-2 rounded mr-2 mb-2 block"
                        placeholder="Password"
                        type="password"
                        value={newUser.password}
                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                    />
                    <div className="mb-2">
                        <span className="mr-4 font-medium">Role:</span>
                        <label className="mr-4">
                            <input
                                type="radio"
                                name="role"
                                value="admin"
                                checked={newUser.role === 'admin'}
                                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                className="mr-1"
                            />
                            Admin
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="role"
                                value="master"
                                checked={newUser.role === 'master'}
                                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                className="mr-1"
                            />
                            Master Admin
                        </label>
                    </div>
                    <button
                        onClick={handleAddUser}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                    >
                        Add User
                    </button>
                </div>

                {/* Admin Users */}
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h2 className="font-semibold text-lg mb-2">Admin Users</h2>
                    <ul>
                        {users.map((u, idx) => (
                            <li key={idx} className="flex items-center justify-between border-b py-1">
                                <span>{u.name.toUpperCase()} - {u.role.toUpperCase()}</span>
                                {u.name !== currentUser && u.role !== "master" && (
                                    <button
                                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                        onClick={() => handleDeleteUser(u.email || u.name)}
                                    >
                                        Delete
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Calendar */}
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 550 }}
                        views={['month', 'week', 'day']}
                        popup
                        defaultDate={new Date(2025, 8, 28)}
                    />
                </div>

                {/* Bookings Table */}
                <div className="mt-8 bg-white p-6 rounded-lg shadow">
                    <h2 className="font-semibold text-lg mb-4">Bookings Table</h2>
                    <div className="mb-4 flex items-center gap-2">
                        <label className="font-medium">Select Date:</label>
                        <input
                            type="date"
                            className="border p-2 rounded"
                            value={filterDate}
                            onChange={e => setFilterDate(e.target.value)}
                        />
                        {filterDate && (
                            <button
                                className="ml-2 bg-gray-300 px-2 py-1 rounded"
                                onClick={() => setFilterDate("")}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    {filteredBookings.length > 0 ? (
                        <table className="min-w-full border">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border px-4 py-2">Time Slot</th>
                                    <th className="border px-4 py-2">Name</th>
                                    <th className="border px-4 py-2">Email</th>
                                    <th className="border px-4 py-2">Mobile</th>
                                    <th className="border px-4 py-2">Option</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    const grouped: { timeSlot: string; items: Booking[] }[] = [];
                                    filteredBookings.forEach(b => {
                                        const group = grouped.find(g => g.timeSlot === b.timeSlot);
                                        if (group) group.items.push(b);
                                        else grouped.push({ timeSlot: b.timeSlot, items: [b] });
                                    });

                                    return grouped.flatMap(group =>
                                        group.items.map((b, idx) => (
                                            <tr key={b._id || `${b.timeSlot}-${idx}`} className="text-center">
                                                {idx === 0 && (
                                                    <td className="border px-4 py-2" rowSpan={group.items.length}>
                                                        {b.timeSlot}
                                                    </td>
                                                )}
                                                <td className="border px-4 py-2">{b.fullName || b.name || '-'}</td>
                                                <td className="border px-4 py-2">{b.email || '-'}</td>
                                                <td className="border px-4 py-2">{b.mobileNo || '-'}</td>
                                                <td className="border px-4 py-2">
                                                    <button
                                                        onClick={() => deleteUserBooking(b._id)}
                                                        className="text-red-600 hover:underline"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    );
                                })()}
                            </tbody>
                        </table>
                    ) : (
                        filterDate && <p>No bookings for selected date.</p>
                    )}
                </div>
            </main>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-80">
                        <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                        <p className="mb-4">Are you sure you want to delete <span className="font-bold">{deleteTarget}</span>?</p>
                        {deleteError && <p className="text-red-600 mb-2">{deleteError}</p>}
                        <div className="flex justify-end gap-2">
                            <button onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); setDeleteError(null); }} className="px-3 py-1 rounded border">Cancel</button>
                            <button onClick={confirmDeleteUser} className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
