'use client';

import { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNo: '',
    email: '',
    representation: '',
    parishAssociation: '',
    communityZone: '',
    timings: '',
    startDate: '',
    endDate: '',
  });


  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    console.log(formData);

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          fullName: formData.fullName,
          mobileNo: String(formData.mobileNo).trim(),
          email: formData.email,
          representation: formData.representation,
          parishAssociation: formData.parishAssociation,
          communityZone: formData.communityZone,
          timeSlot: formData.timings,
          startDate: formData.startDate,
          endDate: formData.endDate,
        }),
      });

      const result = await res.json();
      if (result.success) {
        setStatus({ type: 'success', message: result.response || 'Booking successful' });
        setShowForm(false);
        // clear form data
        setFormData({
          fullName: '',
          mobileNo: '',
          email: '',
          representation: '',
          parishAssociation: '',
          communityZone: '',
          timings: '',
          startDate: '',
          endDate: '',
        });
      } else {
        setStatus({ type: 'error', message: result.response || 'Booking failed' });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status?.type === 'success') {
      const timer = setTimeout(() => {
        setStatus(null);
        setShowForm(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="bg-gray-100 font-sans min-h-screen flex flex-col">
      <NavBar />

      <section className="py-8 px-4 sm:py-12 flex-1">
        <div className="container mx-auto max-w-lg md:max-w-2xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8">
            Event Registration
          </h2>

          {status && status.type === 'error' && (
            <div className="mb-6 p-4 rounded-lg text-center bg-red-100 text-red-700 border border-red-400">
              {status.message}
            </div>
          )}

          {!showForm && status?.type === 'success' && (
            <div className="bg-green-100 text-green-700 border border-green-400 p-6 rounded-lg text-center shadow-md">
              <h3 className="text-lg font-semibold mb-2">Booking Confirmed ✅</h3>
              <p>{status.message}</p>
              <p className="text-sm mt-4 text-gray-600">You will be redirected back to the form in 10 seconds.</p>
            </div>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-md space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input type="text" id="fullName" name="fullName" value={formData.fullName}
                  onChange={handleChange} required className="mt-1 block w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
              </div>

              {/* Mobile */}
              <div>
                <label htmlFor="mobileNo" className="block text-sm font-medium text-gray-700">Mobile No. *</label>
                <input type="tel" id="mobileNo" name="mobileNo" value={formData.mobileNo}
                  onChange={handleChange} required pattern="[0-9]{10}" placeholder="1234567890"
                  className="mt-1 block w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
              </div>

              {/* Representation */}
              <div>
                <label htmlFor="representation" className="block text-sm font-medium text-gray-700">I Represent (Select One) *</label>
                <select id="representation" name="representation" value={formData.representation} onChange={handleChange} required
                  className="mt-1 block w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select an option</option>
                  <option value="parish">Parish Association</option>
                  <option value="community">Community/Zone</option>
                  <option value="individual">Individual</option>
                </select>
              </div>

              {formData.representation === 'parish' && (
                <div>
                  <label htmlFor="parishAssociation" className="block text-sm font-medium text-gray-700">Name of Parish Association</label>
                  <input type="text" id="parishAssociation" name="parishAssociation" value={formData.parishAssociation}
                    onChange={handleChange} className="mt-1 block w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>
              )}

              {formData.representation === 'community' && (
                <div>
                  <label htmlFor="communityZone" className="block text-sm font-medium text-gray-700">Name of Community/Zone</label>
                  <input type="text" id="communityZone" name="communityZone" value={formData.communityZone}
                    onChange={handleChange} className="mt-1 block w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" />
                </div>
              )}

              {/* Timings */}
              <div>
                <label htmlFor="timings" className="block text-sm font-medium text-gray-700">Timings *</label>
                <select id="timings" name="timings" value={formData.timings} onChange={handleChange} required
                  className="mt-1 block w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select a time slot</option>
                  <option value="8:00am - 9:00am">8:00am - 9:00am</option>
                  <option value="9:00am - 10:00am">9:00am - 10:00am</option>
                  <option value="10:00am - 11:00am">10:00am - 11:00am</option>
                  <option value="11:00am - 12:00noon">11:00am - 12:00noon</option>
                  <option value="12:00noon - 1:00pm">12:00noon - 1:00pm</option>
                  <option value="1:00pm - 2:00pm">1:00pm - 2:00pm</option>
                  <option value="2:00pm - 3:00pm">2:00pm - 3:00pm</option>
                  <option value="3:00pm - 4:00pm">3:00pm - 4:00pm</option>
                  <option value="4:00pm - 5:00pm">4:00pm - 5:00pm</option>
                  <option value="5:00pm - 6:00pm">5:00pm - 6:00pm</option>
                  <option value="6:00pm - 7:00pm">6:00pm - 7:00pm</option>
                  <option value="7:00pm - 8:00pm">7:00pm - 8:00pm</option>
                  <option value="8:00pm - 9:00pm">8:00pm - 9:00pm</option>
                </select>
              </div>

              {/* Date */}

              <div className="flex gap-4">
                {/* Start Date */}
                <div className={formData.startDate ? "w-1/2" : "w-full"}>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Start Date (01/10/2025 - 31/12/2025) *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    min="2025-10-01"
                    max="2025-12-31"
                    className="mt-1 block w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* End Date */}
                {formData.startDate && (
                  <div className="w-1/2">
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                      End Date (optional)
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      min={formData.startDate}
                      max="2025-12-31"
                      className="mt-1 block w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>
              <div>
                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {loading ? 'Submitting...' : 'Submit Registration'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
