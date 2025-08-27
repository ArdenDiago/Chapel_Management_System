'use client';
import Link from 'next/link';
import Footer from './components/Footer';
import NavBar from './components/NavBar';

export default function Home() {
  return (
    <div className="bg-gray-50 font-sans min-h-screen flex flex-col">
      <NavBar />

      {/* Hero Section */}
      <section id="home" className="bg-indigo-100 py-16 md:py-24 text-center px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-indigo-800">Jai Yesu 🙏</h1>
          <p className="text-lg md:text-xl text-gray-700 mb-6">
            Tentative start date of the 13 Hours in the Chapel is <strong>9th September 2025</strong>.
            We need about <strong>10 volunteers</strong> to help manage the bookings.
          </p>
          <Link
            href="/registration"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-semibold transition-colors"
          >
            Register
          </Link>
        </div>
      </section>

      {/* Announcement Details */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl bg-white shadow-lg rounded-xl p-6 md:p-12 border border-indigo-100">
          <h2 className="text-2xl font-bold mb-4 text-indigo-700">Important Announcements</h2>
          <ul className="list-disc list-inside space-y-3 text-gray-700">
            <li>Your name and number will be the contact for blocking that date and time for parishioners.</li>
            <li>Volunteers will receive only text messages with the name and number of the parishioners booking slots.</li>
            <li>One person will manage the Excel sheet where booked slots are noted.</li>
            <li>Expect teething troubles in the first month, but it will get smoother over time.</li>
            <li>Your suggestions are welcome! Please share your opinion as soon as you read this message. 🙏🏻</li>
          </ul>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl bg-white shadow-lg rounded-xl p-4 md:p-6 border border-indigo-100">
          <h2 className="text-2xl font-bold text-indigo-700 mb-6 text-center">Booking Calendar</h2>
          <iframe
            src="/ifram"
            frameBorder="0"
            className="w-full h-[600px] rounded-xl shadow-lg"
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}
