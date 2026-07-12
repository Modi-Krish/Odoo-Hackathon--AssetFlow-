'use client';

import React, { useState, useEffect } from 'react';
import { Booking } from '../../types/booking';
import { Asset } from '../../types/allocation';
import { createBooking, getBookings, cancelBooking } from '../../services/booking';
import { BookingTable } from '../../components/operations/BookingTable';

// Mock list of assets for resource booking selector
const MOCK_ASSETS: Asset[] = [
  { id: '1', name: 'Conference Room A', status: 'Available' },
  { id: '2', name: 'Conference Room B', status: 'Available' },
  { id: '3', name: 'Projector-01', status: 'Available' },
  { id: '4', name: 'Testing Lab', status: 'Available' }
];

export default function BookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [assets] = useState<Asset[]>(MOCK_ASSETS);

  // Form State
  const [assetId, setAssetId] = useState<string>('');
  const [bookedBy, setBookedBy] = useState<string>('Current User'); // Simulated default or text input
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  // UI State
  const [loading, setLoading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch all bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getBookings();
      setBookings(data);
    } catch (err) {
      console.warn('API error fetching bookings, using mock local storage', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Frontend validation: End Time must be after Start Time
  useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      if (end <= start) {
        setValidationError('End date/time must be after start date/time.');
      } else {
        setValidationError(null);
      }
    } else {
      setValidationError(null);
    }
  }, [startTime, endTime]);

  // Handle Form Submission
  const handleBookResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validationError) return;

    if (!assetId || !bookedBy || !startTime || !endTime) {
      setToast({ type: 'error', message: 'All fields are required.' });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        assetId,
        bookedBy,
        startTime,
        endTime
      };

      const newBooking = await createBooking(payload);
      setBookings((prev: Booking[]) => [newBooking, ...prev]);
      setToast({ type: 'success', message: 'Resource booked successfully!' });

      // Reset form
      setAssetId('');
      setStartTime('');
      setEndTime('');
    } catch (err: any) {
      console.warn('API error, handling local checks or overlap simulation', err);

      // Handle backend overlap display rule
      // If error payload has overlap indications (e.g. status code 409 or message containing booked/overlap)
      const isOverlap = err.response?.data?.message?.toLowerCase().includes('already booked') || 
                        err.response?.status === 409 ||
                        simulateOverlapCheck(assetId, startTime, endTime);

      if (isOverlap) {
        setToast({ type: 'error', message: 'Time slot already booked' });
      } else {
        // Fallback write if API isn't running
        const fallbackBooking: Booking = {
          id: Math.random().toString(36).substring(2, 9),
          assetId,
          bookedBy,
          startTime,
          endTime,
          status: 'Confirmed'
        };
        setBookings((prev: Booking[]) => [fallbackBooking, ...prev]);
        setToast({ type: 'success', message: 'Booked successfully (mock fallback).' });
        
        // Reset form
        setAssetId('');
        setStartTime('');
        setEndTime('');
      }
    } finally {
      setLoading(false);
    }
  };

  // Simulated overlap check for offline fallback mode
  const simulateOverlapCheck = (selectedAsset: string, startStr: string, endStr: string): boolean => {
    const newStart = new Date(startStr).getTime();
    const newEnd = new Date(endStr).getTime();

    return bookings.some((b: Booking) => {
      if (b.assetId !== selectedAsset || b.status.toLowerCase() === 'cancelled') return false;
      const existingStart = new Date(b.startTime).getTime();
      const existingEnd = new Date(b.endTime).getTime();
      // Overlap formula: (StartA < EndB) and (EndA > StartB)
      return newStart < existingEnd && newEnd > existingStart;
    });
  };

  // Handle Cancel Booking
  const handleCancel = async (id: string) => {
    try {
      setLoading(true);
      await cancelBooking(id);
      setBookings((prev: Booking[]) =>
        prev.map((b: Booking) => (b.id === id ? { ...b, status: 'Cancelled' } : b))
      );
      setToast({ type: 'success', message: 'Booking cancelled successfully.' });
    } catch (err) {
      console.warn('API error canceling, using mock fallback', err);
      setBookings((prev: Booking[]) =>
        prev.map((b: Booking) => (b.id === id ? { ...b, status: 'Cancelled' } : b))
      );
      setToast({ type: 'success', message: 'Booking cancelled (mock fallback).' });
    } finally {
      setLoading(false);
    }
  };

  // Dismiss Toast notification after 4s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Resource Booking Module
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Book meeting rooms, hardware devices, and labs for your team schedules.
          </p>
        </header>

        {/* Overlap & Toast Notifications */}
        {toast && (
          <div
            className={`mb-6 rounded-lg p-4 text-sm font-medium border transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
            }`}
          >
            {toast.message}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Booking Form Panel */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Book Resource
              </h2>

              <form onSubmit={handleBookResource} className="space-y-5">
                {/* Resource Asset Selection */}
                <div>
                  <label htmlFor="asset-select" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Asset / Resource
                  </label>
                  <select
                    id="asset-select"
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                    required
                  >
                    <option value="">Select Resource...</option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Booked By Input */}
                <div>
                  <label htmlFor="booked-by" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Booked By
                  </label>
                  <input
                    id="booked-by"
                    type="text"
                    value={bookedBy}
                    onChange={(e) => setBookedBy(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                    required
                  />
                </div>

                {/* Start DateTime */}
                <div>
                  <label htmlFor="start-time" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Start Time
                  </label>
                  <input
                    id="start-time"
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                    required
                  />
                </div>

                {/* End DateTime */}
                <div>
                  <label htmlFor="end-time" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    End Time
                  </label>
                  <input
                    id="end-time"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
                    required
                  />
                </div>

                {/* Validation Error Text */}
                {validationError && (
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1">
                    {validationError}
                  </p>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || !!validationError}
                  className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Book Resource
                </button>
              </form>
            </div>
          </div>

          {/* Upcoming Bookings Table Panel */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Upcoming Bookings
            </h2>
            <BookingTable
              bookings={bookings}
              assets={assets}
              onCancel={handleCancel}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
