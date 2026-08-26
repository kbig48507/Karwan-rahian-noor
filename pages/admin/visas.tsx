import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  FileCheck2, 
  Plus, 
  Building, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Trash2,
  Globe,
  Banknote
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface VisaItem {
  id: number;
  process_date: string;
  agent_name: string;
  visa_country: string;
  visa_category: string;
  total_visas: number;
  per_visa_price: number;
  total_amount: number;
  status: string;
}

export default function VisasPage() {
  const router = useRouter();
  const [visas, setVisas] = useState<VisaItem[]>([]);
  const [agentsList, setAgentsList] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    processDate: new Date().toISOString().split('T')[0],
    agentName: '',
    visaCountry: 'Iraq',
    visaCategory: 'Group Ziyarat Visa',
    totalVisas: '1',
    perVisaPrice: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [visaRes, agtRes] = await Promise.all([
        supabase.from('visas').select('*').order('created_at', { ascending: false }),
        supabase.from('agents').select('id, full_name, carwan_name')
      ]);

      setVisas(visaRes.data || []);
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

    const count = parseInt(formData.totalVisas) || 0;
    const price = parseFloat(formData.perVisaPrice) || 0;
    const totalAmount = count * price;

    try {
      const { error } = await supabase.from('visas').insert([{
        process_date: formData.processDate,
        agent_name: formData.agentName,
        visa_country: formData.visaCountry,
        visa_category: formData.visaCategory,
        total_visas: count,
        per_visa_price: price,
        total_amount: totalAmount,
        status: 'Processing'
      }]);

      if (error) throw error;

      setSuccessMsg('Visa batch processed successfully!');
      setFormData({
        processDate: new Date().toISOString().split('T')[0],
        agentName: '',
        visaCountry: 'Iraq',
        visaCategory: 'Group Ziyarat Visa',
        totalVisas: '1',
        perVisaPrice: '',
      });
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save visa record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this visa record?')) return;
    try {
      const { error } = await supabase.from('visas').delete().eq('id', id);
      if (error) throw error;
      setVisas(visas.filter(v => v.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Grand totals
  const totalVisaCount = visas.reduce((acc, curr) => acc + Number(curr.total_visas), 0);
  const grandTotalAmount = visas.reduce((acc, curr) => acc + Number(curr.total_amount), 0);

  return (
    <>
      <Head>
        <title>Visa Management - Karwan-e-Rahian-e-Noor</title>
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
            <span className="px-3 py-1 bg-purple-100 text-purple-900 font-bold text-xs rounded-full">
              Total Visas: {totalVisaCount}
            </span>
            <span className="px-3.5 py-1 bg-[#0b2447] text-amber-400 font-bold text-xs rounded-full shadow-sm">
              Total Amount: Rs. {grandTotalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 1. Add Visa Form Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80">
          <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-purple-600" />
            <span>Process New Visa Batch</span>
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
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Process Date *</label>
              <input
                type="date"
                required
                name="processDate"
                value={formData.processDate}
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

            {/* Visa Country */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Visa Country *</label>
              <select
                name="visaCountry"
                value={formData.visaCountry}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
              >
                <option value="Iraq">Iraq (Ziyarat)</option>
                <option value="Iran">Iran (Ziyarat)</option>
                <option value="Syria">Syria (Ziyarat)</option>
                <option value="Saudi Arabia">Saudi Arabia (Umrah)</option>
              </select>
            </div>

            {/* Visa Category */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Visa Category *</label>
              <input
                type="text"
                required
                name="visaCategory"
                value={formData.visaCategory}
                onChange={handleChange}
                placeholder="e.g. Group Ziyarat Visa"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
              />
            </div>

            {/* Total Visas Count */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Total Visas Count *</label>
              <input
                type="number"
                required
                min="1"
                name="totalVisas"
                value={formData.totalVisas}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-[#0b2447] outline-none"
              />
            </div>

            {/* Per Visa Price */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Per Visa Price (PKR) *</label>
              <input
                type="number"
                required
                min="0"
                name="perVisaPrice"
                value={formData.perVisaPrice}
                onChange={handleChange}
                placeholder="e.g. 45000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-[#0b2447] outline-none"
              />
            </div>

            {/* Calculated Total Amount Preview */}
            <div className="flex flex-col justify-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Calculated Total Amount</span>
              <span className="text-sm font-black text-[#0b2447] py-2">
                Rs. {((parseInt(formData.totalVisas) || 0) * (parseFloat(formData.perVisaPrice) || 0)).toLocaleString()}
              </span>
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-[#0b2447] hover:bg-[#163a6f] text-amber-400 font-bold text-xs uppercase tracking-wider rounded-xl shadow transition disabled:opacity-50"
              >
                {submitting ? 'Saving...' : '+ Save Visa Record'}
              </button>
            </div>

          </form>
        </div>

        {/* 2. Visa Records List */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80">
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider">
              Processed Visa Batches & Agent Records
            </h3>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400 text-center py-6">Loading visa records...</p>
          ) : visas.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No visa records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                    <th className="py-2">Date</th>
                    <th>Agent / Head Office</th>
                    <th>Country</th>
                    <th>Category</th>
                    <th>Total Visas</th>
                    <th>Per Visa Price</th>
                    <th>Total Amount</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {visas.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 text-slate-600">{v.process_date}</td>
                      <td className="font-bold text-[#0b2447]">{v.agent_name}</td>
                      <td>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-900 rounded text-[10px] font-bold">
                          {v.visa_country}
                        </span>
                      </td>
                      <td className="text-slate-600">{v.visa_category}</td>
                      <td className="font-bold text-slate-800">{v.total_visas} Visas</td>
                      <td className="text-slate-600">Rs. {Number(v.per_visa_price).toLocaleString()}</td>
                      <td className="font-bold text-emerald-700">Rs. {Number(v.total_amount).toLocaleString()}</td>
                      <td className="text-right">
                        <button
                          onClick={() => handleDelete(v.id)}
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