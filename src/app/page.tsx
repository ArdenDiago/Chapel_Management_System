"use client";
import Link from "next/link";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";

export default function Home() {

  return (
    <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <NavBar />

      {/* Hero Section */}
      <section id="home" className="bg-blue-100 py-20 text-center px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Welcome to Your Chapel Booking
          </h2>
          <p className="text-base md:text-lg mb-6">
            Streamline car operations with our all-in-one platform for events,
            donations, and member management.
          </p>
          <Link
            href="/registration"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block"
          >
            Get Started
          </Link>
        </div>
      </section>

      <section className="h-[600px] w-full">
        <iframe
          src="/ifram"   // make sure the route matches your Next.js page filename
          frameBorder="0"
          className="w-full h-full rounded-xl shadow-lg"
        ></iframe>
      </section>


      {/* Footer */}
      <Footer />
    </div>
  );
}
