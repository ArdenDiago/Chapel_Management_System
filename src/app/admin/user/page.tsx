'use client';

import { useState, useEffect } from 'react';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { jwtDecode } from 'jwt-decode'; // fixed import
import 'react-big-calendar/lib/css/react-big-calendar.css';

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

type JWTPayload = { name?: string; role?: string;[key: string]: unknown };

const localizer = momentLocalizer(moment);

export default function MasterAdmin() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>(""); // for table view

  // Decode JWT to get logged-in user's name
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        setCurrentUser(decoded.name as string || "Admin");
      } catch (_err) {
        console.error("Invalid JWT",_err);
      }
    }
  }, []);

  // Fetch bookings
  const fetchBookings = async () => {
    const res = await fetch('/api/admin/bookings');
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      setBookings(data.data); // save for table
      const mapped: CalendarEvent[] = data.data.map((booking: Booking) => {
        const [startTimeRaw, endTimeRaw] = (booking.timeSlot || "").split(" - ").map(s => s?.trim() || "");
        let start: Date;
        let end: Date;

        if (startTimeRaw && endTimeRaw) {
          start = moment(`${booking.date} ${startTimeRaw}`, "YYYY-MM-DD h:mma").toDate();
          end = moment(`${booking.date} ${endTimeRaw}`, "YYYY-MM-DD h:mma").toDate();
        } else {
          start = moment(booking.date, "YYYY-MM-DD").startOf("day").toDate();
          end = moment(booking.date, "YYYY-MM-DD").endOf("day").toDate();
        }

        return { id: booking._id, title: booking.fullName || booking.name || "Booking", start, end, resource: booking };
      });
      setEvents(mapped);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  // Filter bookings for table view
  const filteredBookings = filterDate
    ? bookings.filter(b => b.date === filterDate)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <NavBar />
      <main className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-6 text-indigo-700">
          Welcome, {currentUser}
        </h1>

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
            onSelectEvent={event => setSelectedBooking(event.resource)}
            defaultDate={new Date(2025, 8, 28)}
          />
        </div>

        {selectedBooking && (
          <div className="mt-4 max-w-xl mx-auto p-6 rounded-2xl shadow-lg bg-white border-l-4 border-indigo-500">
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

        {/* Date filter table */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="font-semibold text-lg mb-4">Bookings Table</h2>
          <div className="mb-4 flex items-center gap-2">
            <label>Select Date:</label>
            <input
              type="date"
              className="border p-2 rounded"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
            />
            {filterDate && (
              <button className="ml-2 bg-gray-300 px-2 py-1 rounded" onClick={() => setFilterDate("")}>
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
      <Footer />
    </div>
  );
}
