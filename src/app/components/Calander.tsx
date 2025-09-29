'use client';

import { useEffect, useState, useMemo } from 'react';
import { Calendar, momentLocalizer, Event as RBCEvent, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

type BookingRaw = {
  date: string;
  timeSlot: string;
  name?: string;
};

type BookingSlot = {
  date: string;
  timeSlot: string;
  count: number;
  names: string[]; // store names of people in this slot
};

type BookingEvent = RBCEvent & {
  resource: BookingSlot;
};

export default function Calander() {
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingSlot | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2025, 9, 1)); // October 2025
  const [currentView, setCurrentView] = useState<View>('month');

  const allowedMonths = useMemo(
    () => [
      new Date(2025, 9, 1),  // Oct
      new Date(2025, 10, 1), // Nov
      new Date(2025, 11, 1), // Dec
    ],
    []
  );

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('/api/booking');
        const rawData: BookingRaw[] = await res.json();

        // Aggregate by date + timeSlot
        const slotsMap: Record<string, BookingSlot> = {};
        rawData.forEach((b) => {
          const key = `${b.date}-${b.timeSlot}`;
          if (!slotsMap[key]) {
            slotsMap[key] = { date: b.date, timeSlot: b.timeSlot, count: 1, names: [b.name || 'Unknown'] };
          } else {
            slotsMap[key].count += 1;
            slotsMap[key].names.push(b.name || 'Unknown');
          }
        });

        const aggregatedSlots = Object.values(slotsMap);

        // Map to Calendar events
        const mapped: BookingEvent[] = aggregatedSlots.map((slot, idx) => {
          const [startTimeRaw, endTimeRaw] = slot.timeSlot.split(" - ").map(s => s.trim());
          const start = moment(`${slot.date} ${startTimeRaw}`, "YYYY-MM-DD h:mma").toDate();
          const end = moment(`${slot.date} ${endTimeRaw}`, "YYYY-MM-DD h:mma").toDate();

          return {
            id: `${slot.date}-${slot.timeSlot}-${idx}`,
            title: `${slot.timeSlot} ${slot.count} PPL`, 
            start,
            end,
            resource: slot,
          };
        });

        setEvents(mapped);
      } catch (err) {
        console.error('❌ Error fetching bookings:', err);
      }
    };

    fetchBookings();
  }, []);

  // Navigate function for week/month view
  const handleNavigate = (direction: 'prev' | 'next') => {
    let newDate;
    if (currentView === 'week') {
      newDate = moment(currentMonth).add(direction === 'next' ? 1 : -1, 'week').toDate();
    } else {
      newDate = moment(currentMonth).add(direction === 'next' ? 1 : -1, 'month').toDate();
    }

    const minDate = allowedMonths[0]; // October 2025
    const maxDate = moment(allowedMonths[allowedMonths.length - 1]).endOf('month').toDate(); // Dec 2025 end

    if (newDate < minDate) newDate = minDate;
    if (newDate > maxDate) newDate = maxDate;

    setCurrentMonth(newDate);
  };

  return (
    <>
      <div className="p-4 bg-gradient-to-br from-indigo-50 via-white to-indigo-100 flex flex-col items-center">

        <h1 className="text-3xl font-extrabold mb-6 text-center text-indigo-700">CHAPEL BOOKING</h1>
        <p className="text-lg md:text-xl text-center text-gray-700 mb-6">(DATE AND TIME SLOT)</p>

        {/* Month Tabs */}
        <div className="flex justify-center space-x-4 mb-4">
          {allowedMonths
            .filter(month => month >= new Date(new Date().getFullYear(), new Date().getMonth(), 1))
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

        {/* View Toggle and Navigation */}
        <div className="flex justify-center items-center gap-4 mb-4">
          {currentView === 'week' && <button
            onClick={() => handleNavigate('prev')}
            className="px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            ◀
          </button>
          }
          <button
            onClick={() => setCurrentView('month')}
            className={`px-3 py-1 rounded-lg font-medium ${currentView === 'month' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-indigo-100'}`}
          >
            Month
          </button>
          <button
            onClick={() => setCurrentView('week')}
            className={`px-3 py-1 rounded-lg font-medium ${currentView === 'week' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-indigo-100'}`}
          >
            Week
          </button>
          {currentView === 'week' && <button
            onClick={() => handleNavigate('next')}
            className="px-3 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            ▶
          </button>}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-4 md:p-6 border border-indigo-100 w-full max-w-1xl ">
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
              onNavigate={() => { }} // navigation handled manually
            />
          </div>
        </div>

        {selectedBooking && (
          <div className="mt-8 max-w-xl mx-auto p-6 rounded-2xl shadow-lg bg-white border-l-4 border-indigo-500">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-3">{selectedBooking.timeSlot}</h2>

            <div className="flex justify-center gap-10 mb-2">
              <p className="text-gray-700 flex items-center">
                <span className="font-medium mr-1">📅</span> {selectedBooking.date}
              </p>
              <p className="text-gray-700 flex items-center">
                <span className="font-medium mr-1">👥</span> {selectedBooking.count} People
              </p>
            </div>

            {/* {selectedBooking.names?.length > 0 && (
              <>
                <p className="font-medium mt-2">Names:</p>
                <ul className="list-disc list-inside text-gray-700">
                  {selectedBooking.names.map((n, i) => (
                    <li key={i}>{n.toUpperCase()}</li>
                  ))}
                </ul>
              </>
            )} */}
          </div>
        )}
      </div>

      

      <style jsx global>{`
        .custom-calendar .rbc-month-view { border-radius: 1rem; overflow: hidden; }
        .custom-calendar .rbc-event { background-color: #6366f1 !important; border-radius: 8px; padding: 2px 6px; font-weight: 500; font-size: 0.85rem; }
        .custom-calendar .rbc-event:hover { background-color: #4338ca !important; }
        .custom-calendar .rbc-today { background-color: #eef2ff !important; }
        .custom-calendar .rbc-selected { background-color: #c7d2fe !important; }
        .custom-calendar .rbc-header { background: #f5f3ff; color: #4338ca; font-weight: 600; padding: 8px; }
        .custom-calendar .rbc-toolbar { display: none; }
      `}</style>
    </>
  );
}
