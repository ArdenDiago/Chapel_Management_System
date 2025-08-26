"use client";

import { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const localizer = momentLocalizer(moment);

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("/api/calendar");
        const data = await res.json();

        if (data.success) {
          const mapped = data.data.map((booking) => {
            const [startTime, endTime] = booking.timeSlot.split(" - ");

            const start = moment(
              `${booking.date} ${startTime}`,
              "YYYY-MM-DD h:mma"
            ).toDate();

            const end = moment(
              `${booking.date} ${endTime}`,
              "YYYY-MM-DD h:mma"
            ).toDate();

            return {
              id: booking._id,
              title: booking.name,
              start,
              end,
              resource: booking,
            };
          });
          setEvents(mapped);
        }
      } catch (err) {
        console.error("❌ Error fetching bookings:", err);
      }
    };

    fetchBookings();
  }, []);

  return (
    <>
      <NavBar />

      <div className="p-4 min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-indigo-700">
          🙏 Rosary & Prayer Bookings
        </h1>

        {/* Calendar container */}
        <div className="bg-white rounded-3xl shadow-xl p-4 md:p-6 border border-indigo-100">
          <div className="overflow-x-auto">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 550 }}
              views={["month", "week", "day"]}
              popup
              className="text-sm md:text-base custom-calendar"
              onSelectEvent={(event) => setSelectedBooking(event.resource)}
              defaultDate={new Date(2025, 8, 28)}
            />
          </div>
        </div>

        {/* Booking details */}
        {selectedBooking && (
          <div className="mt-8 max-w-xl mx-auto p-6 rounded-2xl shadow-lg bg-white border-l-4 border-indigo-500">
            <h2 className="text-2xl font-semibold text-indigo-800 mb-3">
              {selectedBooking.name}
            </h2>
            <p className="text-gray-700">
              <span className="font-medium">📅 Slot:</span>{" "}
              {selectedBooking.date} | {selectedBooking.timeSlot}
            </p>
          </div>
        )}
      </div>

      <Footer />

      <style jsx global>{`
        /* Calendar overrides */
        .custom-calendar .rbc-today {
          background-color: #eef2ff !important; /* soft indigo */
        }
        .custom-calendar .rbc-event {
          background-color: #6366f1 !important; /* indigo */
          border-radius: 0.75rem;
          padding: 2px 6px;
          font-weight: 500;
          font-size: 0.85rem;
        }
        .custom-calendar .rbc-event:hover {
          background-color: #4338ca !important; /* darker indigo */
        }
        .custom-calendar .rbc-toolbar {
          margin-bottom: 1rem;
        }
        .custom-calendar .rbc-toolbar button {
          background: #eef2ff;
          border-radius: 0.5rem;
          padding: 6px 12px;
          margin: 0 2px;
          color: #4338ca;
          font-weight: 500;
          transition: 0.2s;
        }
        .custom-calendar .rbc-toolbar button:hover {
          background: #c7d2fe;
        }
        .custom-calendar .rbc-toolbar button.rbc-active {
          background: #6366f1;
          color: white;
        }
        .custom-calendar .rbc-header {
          font-weight: 600;
          color: #4338ca;
        }
      `}</style>
    </>
  );
}
