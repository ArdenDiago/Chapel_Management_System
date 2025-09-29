import Link from "next/link";
import { useState } from "react";


export default function NavBar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-blue-600 text-white">
            <div className="container mx-auto flex justify-between items-center p-4">
                <h1 className="text-2xl font-bold">
                    <Link href="/">Our Lady of Egypt Church</Link>
                </h1>
                {/* Desktop Menu */}
                <div className="hidden md:flex space-x-4 items-center justify-center">
                    <Link href="/" className="hover:underline">Home</Link>
                    <Link href="/calendar" className="hover:underline">Calendar</Link>
                    <Link
                        href="/admin/login"
                        className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-200"
                    >
                        Login
                    </Link>
                </div>


                {/* Mobile Hamburger */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden focus:outline-none text-2xl"
                >
                    {isOpen ? "✖" : "☰"}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden flex flex-col space-y-2 px-4 pb-4">
                    <Link href="/" className="hover:underline">Home</Link>
                    <Link href="/calendar" className="hover:underline">Calendar</Link>
                    <Link href="/admin/login" className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-200">
                        Login
                    </Link>
                </div>
            )}
        </nav>
    );
}