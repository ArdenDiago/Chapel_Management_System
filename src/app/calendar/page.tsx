'use client';

import { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const localizer = momentLocalizer(moment);

type Booking = {
  _id: string;
  fullName?: string; // registration sends fullName
  name?: string;     // just in case backend used name
  email?: string;
  mobileNo?: string;
  representation?: string;
  parishAssociation?: string;
  communityZone?: string;
  timeSlot: string;  // "1:00pm - 2:00pm"
  date: string;      // "2025-09-26"
};

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('/api/admin/bookings');
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
          const mapped = (data.data as Booking[]).map((booking) => {
            // ensure timeSlot exists and split (fallbacks if format slightly different)
            const [startTimeRaw, endTimeRaw] = (booking.timeSlot || '').split(' - ').map(s => s?.trim() || '');
            // Try parsing "h:mma" (e.g. 1:00pm). If parse fails, fallback to day-only event.
            let start: Date;
            let end: Date;
            if (startTimeRaw && endTimeRaw) {
              start = moment(`${booking.date} ${startTimeRaw}`, 'YYYY-MM-DD h:mma').toDate();
              end = moment(`${booking.date} ${endTimeRaw}`, 'YYYY-MM-DD h:mma').toDate();
            } else {
              // full-day fallback
              start = moment(booking.date, 'YYYY-MM-DD').startOf('day').toDate();
              end = moment(booking.date, 'YYYY-MM-DD').endOf('day').toDate();
            }

            return {
              id: booking._id,
              title: booking.fullName || booking.name || 'Booking',
              start,
              end,
              resource: booking,
            };
          });
          setEvents(mapped);
        } else {
          console.warn('No bookings returned or unexpected format', data);
        }
      } catch (err) {
        console.error('❌ Error fetching bookings:', err);
      }
    };

    fetchBookings();
  }, []);

  return (
    <>
      <NavBar />

      <div className="p-4 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-indigo-700">🙏 Rosary & Prayer Bookings</h1>

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
            <h2 className="text-2xl font-semibold text-indigo-700 mb-3">{selectedBooking.fullName || selectedBooking.name}</h2>
            <p className="text-gray-700 mb-1"><span className="font-medium">📅</span> {selectedBooking.date}</p>
            <p className="text-gray-700 mb-1"><span className="font-medium">⏰</span> {selectedBooking.timeSlot}</p>
            {selectedBooking.email && <p className="text-gray-700 mb-1"><span className="font-medium">✉️</span> {selectedBooking.email}</p>}
            {selectedBooking.mobileNo && <p className="text-gray-700 mb-1"><span className="font-medium">📞</span> {selectedBooking.mobileNo}</p>}
            {selectedBooking.parishAssociation && <p className="text-gray-700"><span className="font-medium">⛪</span> {selectedBooking.parishAssociation}</p>}
          </div>
        )}
      </div>

      <Footer />

      <style jsx global>{`
        .custom-calendar .rbc-month-view { border-radius: 1rem; overflow: hidden; }
        .custom-calendar .rbc-event {
          background-color: #6366f1 !important;
          border-radius: 8px;
          padding: 2px 6px;
          font-weight: 500;
          font-size: 0.85rem;
        }
        .custom-calendar .rbc-event:hover { background-color: #4338ca !important; }
        .custom-calendar .rbc-today { background-color: #eef2ff !important; }
        .custom-calendar .rbc-selected { background-color: #c7d2fe !important; }
        .custom-calendar .rbc-header { background: #f5f3ff; color: #4338ca; font-weight: 600; padding: 8px; }
        .custom-calendar .rbc-toolbar button {
          border-radius: 8px; padding: 6px 12px; margin: 0 4px;
          background: #f3f4f6; border: 1px solid #e5e7eb; transition: all .2s;
        }
        .custom-calendar .rbc-toolbar button:hover { background: #6366f1; color: white; }
        .custom-calendar .rbc-toolbar-label { font-size: 1.1rem; font-weight: 600; color: #4338ca; }
      `}</style>
    </>
  );
}
