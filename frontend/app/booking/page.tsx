'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button, Input, Select, showToast, Modal, Loader, ErrorMessage, Skeleton, EmptyState } from '@/components/UI';
import { Calendar, Plus, AlertTriangle, CalendarDays } from 'lucide-react';

export default function BookingPage() {
  const { 
    assets, 
    bookings, 
    currentUser, 
    bookResource 
  } = useApp();

  const [selectedAssetId, setSelectedAssetId] = useState('a-10'); // Default to Conference room B2
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Simulate loading and error boundary checks
  useEffect(() => {
    const loadBookingData = async () => {
      try {
        setLoading(true);
        // Simulate a minor API fetch delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        setLoading(false);
      } catch (err) {
        setError('Failed to load bookings database.');
        setLoading(false);
      }
    };
    loadBookingData();
  }, []);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) return showToast('Please select a resource', 'error');
    if (!startTime) return showToast('Start time is required', 'error');
    if (!endTime) return showToast('End time is required', 'error');

    // End Time > Start Time check
    if (new Date(endTime) <= new Date(startTime)) {
      return showToast('End time must be after start time', 'error');
    }

    const res = bookResource(selectedAssetId, startTime, endTime);
    if (res.success) {
      showToast(res.message, 'success');
      setStartTime('');
      setEndTime('');
      setIsModalOpen(false);
    } else {
      showToast(res.message, 'error');
    }
  };

  const bookableAssets = assets.filter(a => a.bookable);
  const resourceOptions = bookableAssets.map(a => ({ value: a.id, label: `${a.name} - Tue, 7 Jul` }));

  // Render Loader
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
            <Calendar className="text-indigo-600 animate-float" size={22} />
            <span>Resource booking</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 font-bold uppercase tracking-wider font-sans">Reserve shared conference halls, tools, and company vehicles</p>
        </div>
        <Card className="max-w-2xl bg-slate-900 border-none shadow-extruded p-6 space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
          <Loader message="Fetching resource availability slots..." />
        </Card>
      </div>
    );
  }

  // Render Error
  if (error) {
    return (
      <div className="space-y-6">
        <ErrorMessage message={error} onRetry={() => { setError(null); setLoading(true); }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 font-display">
          <Calendar className="text-indigo-600 animate-float" size={22} />
          <span>Resource booking</span>
        </h2>
        <p className="text-xs text-slate-300 mt-0.5 font-bold uppercase tracking-wider">Reserve shared conference halls, tools, and company vehicles</p>
      </div>

      {bookableAssets.length === 0 ? (
        <EmptyState
          title="No Bookable Resources Yet"
          description="There are currently no assets configured as bookable. Check back later or add new bookable assets."
          icon={<CalendarDays size={48} className="text-slate-650" />}
        />
      ) : (
        <Card className="max-w-2xl bg-slate-900 border-none shadow-extruded p-6">
          
          {/* Screen 6 Selector */}
          <div className="mb-8 w-full">
            <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider uppercase">Resource</label>
            <select
              className="w-full px-5 py-3 rounded-2xl bg-slate-900 text-slate-150 text-xs font-bold border-none shadow-inset focus:outline-none focus:shadow-inset-deep focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:ring-offset-slate-900"
              value={selectedAssetId}
              onChange={e => setSelectedAssetId(e.target.value)}
            >
              {resourceOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Screen 6 Timeline (9:00 to 1:00) */}
          <div className="space-y-6 pl-2 relative border-l border-slate-700/20 py-2">
            
            {/* Time Slot: 9:00 */}
            <div className="relative pl-6">
              {/* Clock marker dot */}
              <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-[0_0_8px_#6c63ff]" />
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-slate-300 w-10 font-extrabold">9:00</span>
                
                {/* Active Booking Card (Procurement Team) */}
                <div className="flex-1 p-3.5 bg-slate-900 border border-indigo-500/30 text-indigo-600 rounded-2xl flex items-center justify-between shadow-extruded-sm">
                  <span>Booked - Procurement Team</span>
                  <span className="text-[10px] font-extrabold uppercase">9 to 10</span>
                </div>
              </div>

              {/* Overlap Conflict Panel (Screen 6: requested 9:30 to 10:30) */}
              <div className="mt-3 ml-14 p-4.5 rounded-2xl bg-rose-500/10 border-2 border-dashed border-rose-600 text-rose-600 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs animate-pulse">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} />
                  <span className="font-extrabold">Requested 9:30 to 10:30 - conflict - slot is unavailable</span>
                </div>
                <div className="flex items-center gap-2 self-end md:self-auto">
                  {/* Visual user badge initials (uk) */}
                  <div className="w-6 h-6 rounded-full bg-rose-600/25 flex items-center justify-center text-[10px] font-black text-rose-600">
                    uk
                  </div>
                </div>
              </div>

            </div>

            {/* Time Slot: 10:00 */}
            <div className="relative pl-6">
              <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-700" />
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-slate-300 w-10 font-extrabold">10:00</span>
                <span className="text-slate-400 italic font-medium">Free time slot</span>
              </div>
            </div>

            {/* Time Slot: 11:00 */}
            <div className="relative pl-6">
              <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-700" />
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-slate-300 w-10 font-extrabold">11:00</span>
                <span className="text-slate-400 italic font-medium">Free time slot</span>
              </div>
            </div>

            {/* Time Slot: 12:00 */}
            <div className="relative pl-6">
              <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-700" />
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-slate-300 w-10 font-extrabold">12:00</span>
                <span className="text-slate-400 italic font-medium">Free time slot</span>
              </div>
            </div>

            {/* Time Slot: 1:00 */}
            <div className="relative pl-6">
              <div className="absolute left-[-21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-700" />
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-slate-300 w-10 font-extrabold">1:00</span>
                <span className="text-slate-400 italic font-medium">Free time slot</span>
              </div>
            </div>

          </div>

          {/* Screen 6 Action Button */}
          <div className="mt-8 border-t border-slate-700/20 pt-6">
            <Button onClick={() => setIsModalOpen(true)} variant="primary" className="flex items-center gap-2 px-8 py-3.5 uppercase tracking-wider font-extrabold text-xs">
              <Plus size={15} /> Book a slot
            </Button>
          </div>

        </Card>
      )}

      {/* Booking Slot Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Reserve Booking Slot">
        <form onSubmit={handleBookingSubmit} className="space-y-4">
          <Select
            label="Resource to reserve"
            options={bookableAssets.map(a => ({ value: a.id, label: a.name }))}
            value={selectedAssetId}
            onChange={e => setSelectedAssetId(e.target.value)}
            required
          />

          <Input
            label="Start Time"
            type="datetime-local"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            required
          />

          <Input
            label="End Time"
            type="datetime-local"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700/20">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              Book
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
