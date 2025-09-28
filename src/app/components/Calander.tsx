'use client';

import { useEffect, useState, useMemo } from 'react';
import { Calendar, momentLocalizer, Event as RBCEvent, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

type Booking = {
  _id: string;
  fullName?: string;
  name?: string;
  email?: string;
  mobileNo?: string;
  representation?: string;
  parishAssociation?: string;
  communityZone?: string;
  timeSlot: string;  // "1:00pm - 2:00pm"
  date: string;      // "2025-09-26"
};

// Extend react-big-calendar Event to include our booking resource
type BookingEvent = RBCEvent & {
  resource: Booking;
};

export default function Calander() {
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2025, 9, 1)); // October 2025 start
  const [currentView, setCurrentView] = useState<View>('month');

  // Allowed months: Oct, Nov, Dec 2025
  const allowedMonths = useMemo(
    () => [
      new Date(2025, 9, 1),  // October
      new Date(2025, 10, 1), // November
      new Date(2025, 11, 1), // December
    ],
    []
  );

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('/api/calendar');
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
          const mapped: BookingEvent[] = (data.data as Booking[]).map((booking) => {
            const [startTimeRaw, endTimeRaw] = (booking.timeSlot || "")
              .split(" - ")
              .map((s) => s?.trim() || "");

            let start: Date;
            let end: Date;
            booking.name = booking.name?.toUpperCase();

            if (startTimeRaw && endTimeRaw) {
              start = moment(`${booking.date} ${startTimeRaw}`, "YYYY-MM-DD h:mma").toDate();
              end = moment(`${booking.date} ${endTimeRaw}`, "YYYY-MM-DD h:mma").toDate();
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
        } else {
          console.warn("No bookings returned or unexpected format", data);
        }
      } catch (err) {
        console.error('❌ Error fetching bookings:', err);
      }
    };

    fetchBookings();
  }, []);

  // Auto-remove past months
  useEffect(() => {
    const now = new Date();
    const validMonths = allowedMonths.filter(month => month >= new Date(now.getFullYear(), now.getMonth(), 1));
    if (validMonths.length > 0 && currentMonth < validMonths[0]) {
      setCurrentMonth(validMonths[0]);
    }
  }, [currentMonth, allowedMonths]);

  return (
    <>
      <div className="p-4 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-indigo-700">CHAPEL BOOKING</h1>
        <p className="text-lg md:text-xl text-center text-gray-700 mb-6">
          (DATE AND TIME SLOT)
        </p>

        {/* Month Tabs */}
        <div className="flex justify-center space-x-4 mb-4">
          {allowedMonths
            .filter(month => month >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)) // hide past months
            .map((month, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentMonth(month)}
                className={`px-4 py-2 rounded-lg font-medium transition ${moment(currentMonth).isSame(month, 'month')
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-indigo-100'
                  }`}
              >
                {moment(month).format("MMMM YYYY")}
              </button>
            ))}
        </div>

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
              date={currentMonth}
              view={currentView}
              onView={(view) => setCurrentView(view)}
              onNavigate={() => { }} // disable built-in navigation
            />
          </div>
        </div>

        {selectedBooking && (
          <div className="mt-8 max-w-xl mx-auto p-6 rounded-2xl shadow-lg bg-white border-l-4 border-indigo-500">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-3">
              {selectedBooking.name?.toUpperCase()}
            </h2>
            <p className="text-gray-700 mb-1"><span className="font-medium">📅</span> {selectedBooking.date}</p>
            <p className="text-gray-700 mb-1"><span className="font-medium">⏰</span> {selectedBooking.timeSlot}</p>
          </div>
        )}
      </div>

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
        .custom-calendar .rbc-toolbar { display: none; } /* hide default toolbar */
      `}</style>
    </>
  );
}
