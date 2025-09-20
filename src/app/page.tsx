'use client';
import Link from 'next/link';
import Footer from './components/Footer';
import NavBar from './components/NavBar';
import Calander from './components/Calander';

export default function Home() {
  return (
    <div className="bg-gray-50 font-sans min-h-screen flex flex-col">
      <NavBar />

      {/* Hero Section */}
      <section id="home" className="bg-indigo-100 py-16 md:py-24 text-center px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-indigo-800">13 Hours Adoration before Blessed Sacrament</h1>
          <p className="text-lg md:text-xl text-gray-700 mb-6">
            COME AND STAY AWHILE WITH ME  <br /><strong>(MARK 6:31)</strong>.
          </p>
          <p className="text-lg md:text-xl text-gray-700 mb-6">
            1<sup>ST</sup> October - 31<sup>ST</sup> December 2025
          </p>
          <Link
            href="/registration"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-semibold transition-colors"
          >
            Register
          </Link>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-12 px-4">
        <div className="container  bg-white shadow-lg rounded-xl p-4 md:p-6 border border-indigo-100">
          <h2 className="text-4xl font-extrabold mb-6 text-center text-indigo-700">Booking Calendar</h2>
          <Calander />
        </div>
      </section>

      <Footer />
    </div>
  );
}
