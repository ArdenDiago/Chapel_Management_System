'use client';

import { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { jwtDecode } from 'jwt-decode';
import 'react-big-calendar/lib/css/react-big-calendar.css';

type User = { name: string; role: string };
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
type CalendarEvent = {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: Booking;
};

// 👇 expected payload type inside JWT
type JWTPayload = {
    name?: string;
    role?: string;
    [key: string]: any;
};

const localizer = momentLocalizer(moment);

export default function MasterAdmin() {
    const [users, setUsers] = useState<User[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [newUser, setNewUser] = useState({ name: '', password: '' });
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [currentUser, setCurrentUser] = useState<string>("");

    // ✅ Decode JWT to get logged-in user's name
    useEffect(() => {
        const token = localStorage.getItem("token"); // or however you're storing JWT
        if (token) {
            try {
                const decoded: JWTPayload = jwtDecode(token);
                setCurrentUser(decoded.name || "Admin");
            } catch (err) {
                console.error("Invalid JWT:", err);
            }
        }
    }, []);

    // Fetch bookings
    const fetchBookings = async () => {
        const res = await fetch('/api/admin/bookings');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
            const mapped: CalendarEvent[] = data.data.map((booking: Booking) => {
                const [startTimeRaw, endTimeRaw] = (booking.timeSlot || "")
                    .split(" - ")
                    .map((s) => s?.trim() || "");

                let start: Date;
                let end: Date;

                if (startTimeRaw && endTimeRaw) {
                    start = moment(
                        `${booking.date} ${startTimeRaw}`,
                        "YYYY-MM-DD h:mma"
                    ).toDate();
                    end = moment(
                        `${booking.date} ${endTimeRaw}`,
                        "YYYY-MM-DD h:mma"
                    ).toDate();
                } else {
                    start = moment(booking.date, "YYYY-MM-DD").startOf("day").toDate();
                    end = moment(booking.date, "YYYY-MM-DD").endOf("day").toDate();
                }

                return {
                    id: booking._id,
                    title: booking.fullName || booking.name || "Booking",
                    start,
                    end,
                    resource: booking,
                };
            });

            setEvents(mapped);
        }
    };

    // Fetch list of admins
    const fetchUsers = async () => {
        const res = await fetch('/api/admin/users');
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
                <h1 className="text-3xl font-bold mb-6 text-indigo-700">
                    Welcome, {currentUser}
                </h1>
                {/* Bookings */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="bg-white rounded-3xl shadow-xl p-4 md:p-6 border border-indigo-100">
                        <div className="overflow-x-auto">
                            <Calendar
                                localizer={localizer}
                                events={events}
                                startAccessor="start"
                                endAccessor="end"
                                style={{ height: 550 }}
                                views={['month', 'week', 'day']}
                                popup
                                className="text-sm md:text-base custom-calendar"
                                onSelectEvent={(event) => setSelectedBooking(event.resource)}
                                defaultDate={new Date(2025, 8, 28)}
                            />
                        </div>
                    </div>

                    {selectedBooking && (
                        <div className="mt-8 max-w-xl mx-auto p-6 rounded-2xl shadow-lg bg-white border-l-4 border-indigo-500">
                            <h2 className="text-2xl font-semibold text-indigo-700 mb-3">
                                {selectedBooking.fullName || selectedBooking.name}
                            </h2>
                            <p className="text-gray-700 mb-1"><span className="font-medium">📅</span> {selectedBooking.date}</p>
                            <p className="text-gray-700 mb-1"><span className="font-medium">⏰</span> {selectedBooking.timeSlot}</p>
                            {selectedBooking.email && <p className="text-gray-700 mb-1"><span className="font-medium">✉️</span> {selectedBooking.email}</p>}
                            {selectedBooking.mobileNo && <p className="text-gray-700 mb-1"><span className="font-medium">📞</span> {selectedBooking.mobileNo}</p>}
                            {selectedBooking.parishAssociation && <p className="text-gray-700"><span className="font-medium">⛪</span> {selectedBooking.parishAssociation}</p>}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
