import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-blue-600 text-white py-6 mt-auto">
            <div className="container mx-auto text-center px-4">
                <p>&copy; 2025 Chapel Management System. All rights reserved.</p>
                <div className="mt-4 space-x-4">
                    <Link href="#contact" className="text-white hover:underline">Contact Us</Link>
                    <Link href="#privacy" className="text-white hover:underline">Privacy Policy</Link>
                </div>
            </div>
        </footer>
    );
}