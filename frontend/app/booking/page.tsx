'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Button, Input, Select, Badge, showToast } from '@/components/UI';
import { Calendar, Clock, Plus, Trash2, ShieldAlert, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function BookingPage() {
  const { 
    assets, 
    bookings, 
    currentUser, 
    users, 
    bookResource, 
    cancelBooking 
  } = useApp();

  const searchParams = useSearchParams();
  const [selectedAssetId, setSelectedAssetId] = useState('');
  
  // Form states
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Auto trigger form if action=new query is passed
  useEffect(() => {
    const bookableAssets = assets.filter(a => a.bookable);
    if (bookableAssets.length > 0 && !selectedAssetId) {
      setSelectedAssetId(bookableAssets[0].id);
    }
  }, [assets, selectedAssetId]);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId) return showToast('Please select a resource', 'error');
    if (!startTime) return showToast('Start time is required', 'error');
    if (!endTime) return showToast('End time is required', 'error');

    const res = bookResource(selectedAssetId, startTime, endTime);
    if (res.success) {
      showToast(res.message, 'success');
      setStartTime('');
      setEndTime('');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleCancel = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      const res = cancelBooking(bookingId);
      if (res.success) {
        showToast('Booking cancelled successfully', 'info');
      }
    }
  };

  // Find bookable assets
  const bookableAssets = assets.filter(a => a.bookable);
  const resourceOptions = bookableAssets.map(a => ({ value: a.id, label: `${a.name} (${a.location})` }));

  // Filter bookings for the selected asset
  const resourceBookings = bookings
    .filter(b => b.asset_id === selectedAssetId)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // Filter all upcoming bookings for current employee
  const myBookings = bookings
    .filter(b => b.booked_by === currentUser?.id)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Calendar className="text-indigo-400" size={22} />
          <span>Shared Resource Scheduling</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Reserve shared equipment, company vehicles, and conference spaces with automated overlap check gates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Reservation Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Plus size={16} className="text-indigo-400" />
              <span>Book a Time Slot</span>
            </h3>

            {bookableAssets.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No bookable resources registered in the catalog yet.</p>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <Select
                  label="Select Shared Resource"
                  options={resourceOptions}
                  value={selectedAssetId}
                  onChange={e => setSelectedAssetId(e.target.value)}
                  required
                />

                <Input
                  label="Start Date & Time"
                  type="datetime-local"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  required
                />

                <Input
                  label="End Date & Time"
                  type="datetime-local"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  required
                />

                <Button type="submit" variant="gradient" className="w-full mt-2">
                  Confirm Reservation
                </Button>
              </form>
            )}
          </Card>

          {/* Quick Help card */}
          <Card className="bg-slate-950/40 border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 mb-2">Scheduling Guideline</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              If Room B2 is reserved from <strong>9:00 - 10:00 AM</strong>, trying to book it for 
              <strong>9:30 - 10:30 AM</strong> will automatically trigger the overlap engine and reject the reservation. 
              Bookings starting at exactly <strong>10:00 AM</strong> are allowed.
            </p>
          </Card>
        </div>

        {/* Schedule Timeline and User Reservations list */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected Resource Timeline calendar */}
          <Card>
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Clock size={16} className="text-indigo-400" />
              <span>Roster Schedule for: {bookableAssets.find(a => a.id === selectedAssetId)?.name || 'Select Resource'}</span>
            </h3>

            <div className="space-y-3">
              {resourceBookings.length === 0 ? (
                <p className="text-slate-500 text-xs italic py-8 text-center font-semibold border border-dashed border-slate-800 rounded-xl">
                  No reservations registered for this resource. All slots available!
                </p>
              ) : (
                resourceBookings.map(b => {
                  const bookUser = users.find(u => u.id === b.booked_by);
                  return (
                    <div 
                      key={b.id} 
                      className={`
                        p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold
                        ${b.status === 'Cancelled' 
                          ? 'border-slate-800/40 bg-slate-950/20 text-slate-500' 
                          : 'border-slate-800 bg-slate-950 text-slate-200'}
                      `}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Reserved By:</span>
                          <span className="text-slate-300 font-bold">{bookUser ? bookUser.name : 'Unknown Employee'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 font-medium mt-1">
                          <span>{new Date(b.start_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                          <ArrowRight size={12} className="text-slate-600" />
                          <span>{new Date(b.end_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                        </div>
                      </div>
                      <Badge content={b.status} />
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* User's own reservations */}
          <Card>
            <h3 className="text-sm font-bold text-slate-200 mb-4">My Reservations</h3>
            <div className="space-y-3">
              {myBookings.length === 0 ? (
                <p className="text-slate-500 text-xs italic py-4 text-center font-semibold">You have no active reservations.</p>
              ) : (
                myBookings.map(b => {
                  const ast = assets.find(a => a.id === b.asset_id);
                  const isUpcoming = b.status === 'Upcoming';

                  return (
                    <div key={b.id} className="p-3.5 rounded-xl border border-slate-850 bg-slate-900/50 text-xs flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-200">{ast?.name} ({ast?.location})</p>
                        <p className="text-slate-400 font-medium">
                          {new Date(b.start_time).toLocaleString()} - {new Date(b.end_time).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge content={b.status} />
                        {isUpcoming && (
                          <button
                            onClick={() => handleCancel(b.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 transition-all"
                            title="Cancel Booking"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
