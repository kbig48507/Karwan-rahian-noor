import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  Plane, 
  Plus, 
  Building, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Trash2,
  Navigation,
  Banknote
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TicketItem {
  id: number;
  booking_date: string;
  agent_name: string;
  route_from_to: string;
  airline_name: string;
  total_tickets: number;
  per_ticket_price: number;
  total_amount: number;
  status: string;
}

export default function TicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [agentsList, setAgentsList] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    bookingDate: new Date().toISOString().split('T')[0],
    agentName: '',
    routeFromTo: 'Lahore to Najaf',
    airlineName: 'Iraqi Airways',
    totalTickets: '1',
    perTicketPrice: '',
    status: 'Processing',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ticketRes, agtRes] = await Promise.all([
        supabase.from('tickets').select('*').order('created_at', { ascending: false }),
        supabase.from('agents').select('id, full_name, carwan_name')
      ]);

      setTickets(ticketRes.data || []);
      setAgentsList(agtRes.data || []);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const count = parseInt(formData.totalTickets) || 0;
    const price = parseFloat(formData.perTicketPrice) || 0;
    const totalAmount = count * price;

    try {
      const { error } = await supabase.from('tickets').insert([{
        booking_date: formData.bookingDate,
        agent_name: formData.agentName,
        route_from_to: formData.routeFromTo.trim(),
        airline_name: formData.airlineName.trim(),
        total_tickets: count,
        per_ticket_price: price,
        total_amount: totalAmount,
        status: formData.status
      }]);

      if (error) throw error;

      setSuccessMsg('Ticket batch booked successfully!');
      setFormData({
        bookingDate: new Date().toISOString().split('T')[0],
        agentName: '',
        routeFromTo: 'Lahore to Najaf',
        airlineName: 'Iraqi Airways',
        totalTickets: '1',
        perTicketPrice: '',
        status: 'Processing',
      });
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save ticket record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this ticket record?')) return;
    try {
      const { error } = await supabase.from('tickets').delete().eq('id', id);
      if (error) throw error;
      setTickets(tickets.filter(t => t.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Grand totals
  const totalTicketCount = tickets.reduce((acc, curr) => acc + Number(curr.total_tickets), 0);
  const grandTotalAmount = tickets.reduce((acc, curr) => acc + Number(curr.total_amount), 0);

  return (
    <>
      <Head>
        <title>Ticket Management - Karwan-e-Rahian-e-Noor</title>
      </Head>

      <div className="w-full space-y-4 pb-12">
        
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-[#0b2447] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-sky-100 text-sky-900 font-bold text-xs rounded-full">
              Total Tickets: {totalTicketCount}
            </span>
            <span className="px-3.5 py-1 bg-[#0b2447] text-amber-400 font-bold text-xs rounded-full shadow-sm">
              Total Amount: Rs. {grandTotalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 1. Add Ticket Form Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80">
          <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
            <Plane className="w-4 h-4 text-sky-600" />
            <span>Book New Flight Tickets</span>
          </h3>

          {errorMsg && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3">
            
            {/* Date */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Booking Date *</label>
              <input
                type="date"
                required
                name="bookingDate"
                value={formData.bookingDate}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
              />
            </div>

            {/* Agent / Head Office */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Agent Name / Head Office *</label>
              <select
                required
                name="agentName"
                value={formData.agentName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
              >
                <option value="">Select Agent / Head Office</option>
                <option value="Direct Head Office">Direct Head Office</option>
                {agentsList.map((agt) => (
                  <option key={agt.id} value={`${agt.full_name} (${agt.carwan_name})`}>
                    {agt.full_name} - {agt.carwan_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Route From - To */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Route (From - To) *</label>
              <input
                type="text"
                required
                name="routeFromTo"
                value={formData.routeFromTo}
                onChange={handleChange}
                placeholder="e.g. Lahore to Najaf"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
              />
            </div>

            {/* Airline Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Airline Name *</label>
              <input
                type="text"
                required
                name="airlineName"
                value={formData.airlineName}
                onChange={handleChange}
                placeholder="e.g. Iraqi Airways / PIA"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
              />
            </div>

            {/* Total Tickets */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Total Tickets *</label>
              <input
                type="number"
                required
                min="1"
                name="totalTickets"
                value={formData.totalTickets}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-[#0b2447] outline-none"
              />
            </div>

            {/* Per Ticket Price */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Per Ticket Price (PKR) *</label>
              <input
                type="number"
                required
                min="0"
                name="perTicketPrice"
                value={formData.perTicketPrice}
                onChange={handleChange}
                placeholder="e.g. 145000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-[#0b2447] outline-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
              >
                <option value="Processing">Processing (انڈر پروسس)</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Issued">Issued</option>
              </select>
            </div>

            {/* Calculated Total Amount Preview */}
            <div className="flex flex-col justify-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Amount</span>
              <span className="text-sm font-black text-[#0b2447] py-2">
                Rs. {((parseInt(formData.totalTickets) || 0) * (parseFloat(formData.perTicketPrice) || 0)).toLocaleString()}
              </span>
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-2 md:col-span-4 flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#0b2447] hover:bg-[#163a6f] text-amber-400 font-bold text-xs uppercase tracking-wider rounded-xl shadow transition disabled:opacity-50"
              >
                {submitting ? 'Saving Ticket...' : '+ Save Ticket Record'}
              </button>
            </div>

          </form>
        </div>

        {/* 2. Tickets Records List */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80">
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider">
              Booked Flight Tickets & Agent Batches
            </h3>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400 text-center py-6">Loading tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No ticket records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                    <th className="py-2">Date</th>
                    <th>Agent / Head Office</th>
                    <th>Route (From - To)</th>
                    <th>Airline</th>
                    <th>Tickets</th>
                    <th>Per Ticket</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 text-slate-600">{t.booking_date}</td>
                      <td className="font-bold text-[#0b2447]">{t.agent_name}</td>
                      <td>
                        <span className="px-2 py-0.5 bg-sky-100 text-sky-900 rounded text-[10px] font-bold">
                          {t.route_from_to}
                        </span>
                      </td>
                      <td className="text-slate-600">{t.airline_name}</td>
                      <td className="font-bold text-slate-800">{t.total_tickets} Tickets</td>
                      <td className="text-slate-600">Rs. {Number(t.per_ticket_price).toLocaleString()}</td>
                      <td className="font-bold text-emerald-700">Rs. {Number(t.total_amount).toLocaleString()}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'Processing' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </>
  );
}