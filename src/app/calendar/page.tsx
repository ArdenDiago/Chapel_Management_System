'use client';

import { useEffect, useState } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

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

// 👇 custom toolbar with month buttons
function CustomToolbar({ date, onNavigate }: any) {
  const year = moment(date).year();
  const allowedMonths = [9, 10, 11]; // Oct–Dec (0-indexed)

  return (
    <div className="flex items-center justify-center gap-4 mb-4">
      {allowedMonths.map((month) => {
        const monthName = moment().month(month).format('MMMM');
        const isActive = moment(date).month() === month;

        return (
          <button
            key={month}
            onClick={() => onNavigate('DATE', new Date(year, month, 1))}
            className={`px-4 py-2 rounded-xl font-medium transition ${
              isActive
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}
          >
            {monthName}
          </button>
        );
      })}
    </div>
  );
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const currentYear = moment().year();
  const allowedMonths = [9, 10, 11]; // Oct–Dec (0-based)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('/api/calendar');
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
          const mapped: CalendarEvent[] = (data.data as Booking[])
            .map((booking) => {
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
            })
            .filter((event) => {
              const eventMoment = moment(event.start);
              return (
                eventMoment.year() === currentYear &&
                allowedMonths.includes(eventMoment.month()) &&
                eventMoment.isSameOrAfter(moment().startOf("month"))
              );
            });

          setEvents(mapped);
        } else {
          console.warn("No bookings returned or unexpected format", data);
        }
      } catch (err) {
        console.error("❌ Error fetching bookings:", err);
      }
    };

    fetchBookings();
  }, []);

  const firstValidMonth = allowedMonths.find((m) => m >= moment().month());
  const defaultDate =
    firstValidMonth !== undefined
      ? new Date(currentYear, firstValidMonth, 1)
      : new Date(currentYear, 9, 1);

  const minDate = new Date(currentYear, 9, 1);   // Oct 1
  const maxDate = new Date(currentYear, 11, 31); // Dec 31

  return (
    <>
      <NavBar />

      <div className="p-4 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-indigo-700">
          CHAPEL BOOKING
        </h1>
        <p className="text-lg md:text-xl text-center text-gray-700 mb-6">
          (DATE AND TIME SLOT)
        </p>

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
              defaultDate={defaultDate}
              min={minDate}
              max={maxDate}
              components={{
                toolbar: CustomToolbar, // 👈 custom toolbar here
              }}
            />
          </div>
        </div>

        {selectedBooking && (
          <div className="mt-8 max-w-xl mx-auto p-6 rounded-2xl shadow-lg bg-white border-l-4 border-indigo-500">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-3">
              {selectedBooking.fullName || selectedBooking.name}
            </h2>
            <p className="text-gray-700 mb-1">
              <span className="font-medium">📅</span> {selectedBooking.date}
            </p>
            <p className="text-gray-700 mb-1">
              <span className="font-medium">⏰</span> {selectedBooking.timeSlot}
            </p>
            {selectedBooking.parishAssociation && (
              <p className="text-gray-700">
                <span className="font-medium">⛪</span>{" "}
                {selectedBooking.parishAssociation}
              </p>
            )}
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
      `}</style>
    </>
  );
}
