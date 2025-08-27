'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/app/components/NavBar';
import Footer from '@/app/components/Footer';
import { jwtDecode } from 'jwt-decode';

// Define token payload type
interface TokenPayload {
  userId: string;
  name: string;
  role: 'master' | 'user';
  exp: number;
}

export default function AdminLogin() {
  const router = useRouter();
  const [loginInfo, setLoginInfo] = useState({ name: '', password: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true); // 🔹 New state

  // Show message for 4 seconds
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // 🔹 Check token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: TokenPayload = jwtDecode(token);

        // check expiry
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setCheckingToken(false);
          return;
        }

        // Redirect based on role
        if (decoded.role === 'master') {
          router.push('/admin/master');
        } else {
          router.push('/admin/user');
        }
      } catch (err) {
        console.error('Invalid token:', err);
        localStorage.removeItem('token');
        setCheckingToken(false);
      }
    } else {
      setCheckingToken(false); // No token → show login page
    }
  }, [router]);

  const handleLogin = async () => {
    if (!loginInfo.name || !loginInfo.password) {
      showMessage('error', 'Name and password are required');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginInfo),
      });

      const data = await res.json();
      console.log(data);

      if (data.success) {
        // Save JWT token in localStorage
        localStorage.setItem('token', data.token);

        showMessage('success', 'Login successful!');

        // Redirect based on role
        if (data.user.role === 'master') {
          router.push('/admin/master');
        } else {
          router.push('/admin/user');
        }
      } else {
        showMessage('error', 'Access denied');
      }
    } catch (err) {
      console.error(err);
      showMessage('error', 'Server error during login');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Show loading while checking token
  if (checkingToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-bold text-indigo-700">Checking session...</h2>
        <p className="text-gray-600 mt-2">Please wait while we verify your access.</p>
      </div>
    );
  }

  // 🔹 If no valid token → show login form
  return (
    <>
      <NavBar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96 mt-8">
          <h2 className="text-2xl font-bold mb-4 text-indigo-700 text-center">Admin Login</h2>

          {message && (
            <div
              className={`p-3 mb-4 rounded ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <input
            className="border p-2 rounded w-full mb-2"
            placeholder="Name"
            value={loginInfo.name}
            onChange={e => setLoginInfo({ ...loginInfo, name: e.target.value })}
          />
          <input
            type="password"
            className="border p-2 rounded w-full mb-4"
            placeholder="Password"
            value={loginInfo.password}
            onChange={e => setLoginInfo({ ...loginInfo, password: e.target.value })}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-indigo-600 text-white w-full py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
