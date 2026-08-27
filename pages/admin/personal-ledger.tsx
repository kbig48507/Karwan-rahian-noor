import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  BookOpen, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Trash2,
  Edit3,
  Search,
  PlusCircle,
  Wallet
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LedgerItem {
  id: number;
  entry_type: 'payable' | 'receivable';
  entry_date: string;
  person_name: string;
  address: string;
  total_amount: number;
  paid_received_amount: number;
  remaining_balance: number;
  notes?: string;
}

export default function PersonalLedger() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'payable' | 'receivable'>('payable');
  const [ledgers, setLedgers] = useState<LedgerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    entryDate: new Date().toISOString().split('T')[0],
    personName: '',
    address: '',
    totalAmount: '',
    paidReceivedAmount: '',
    notes: '',
  });

  useEffect(() => {
    fetchLedgers();
  }, []);

  const fetchLedgers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('personal_ledgers')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setLedgers(data || []);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateRemaining = () => {
    const total = parseFloat(formData.totalAmount) || 0;
    const paidReceived = parseFloat(formData.paidReceivedAmount) || 0;
    return total - paidReceived;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const total = parseFloat(formData.totalAmount) || 0;
    const paidReceived = parseFloat(formData.paidReceivedAmount) || 0;
    const remaining = total - paidReceived;

    try {
      if (editingId) {
        // Update Record
        const { error } = await supabase
          .from('personal_ledgers')
          .update({
            entry_type: activeTab,
            entry_date: formData.entryDate,
            person_name: formData.personName.trim(),
            address: formData.address.trim(),
            total_amount: total,
            paid_received_amount: paidReceived,
            remaining_balance: remaining,
            notes: formData.notes.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
        setSuccessMsg('Ledger record updated successfully!');
      } else {
        // Insert New Record
        const { error } = await supabase.from('personal_ledgers').insert([
          {
            entry_type: activeTab,
            entry_date: formData.entryDate,
            person_name: formData.personName.trim(),
            address: formData.address.trim(),
            total_amount: total,
            paid_received_amount: paidReceived,
            remaining_balance: remaining,
            notes: formData.notes.trim(),
          },
        ]);

        if (error) throw error;
        setSuccessMsg('New ledger record added successfully!');
      }

      resetForm();
      fetchLedgers();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save ledger record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: LedgerItem) => {
    setActiveTab(item.entry_type);
    setEditingId(item.id);
    setFormData({
      entryDate: item.entry_date,
      personName: item.person_name,
      address: item.address || '',
      totalAmount: item.total_amount.toString(),
      paidReceivedAmount: item.paid_received_amount.toString(),
      notes: item.notes || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      const { error } = await supabase.from('personal_ledgers').delete().eq('id', id);
      if (error) throw error;
      setLedgers(ledgers.filter((item) => item.id !== id));
      if (editingId === id) resetForm();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      entryDate: new Date().toISOString().split('T')[0],
      personName: '',
      address: '',
      totalAmount: '',
      paidReceivedAmount: '',
      notes: '',
    });
  };

  // Filter list according to active tab and search
  const currentList = ledgers.filter(
    (item) =>
      item.entry_type === activeTab &&
      (item.person_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.address?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Financial Stats
  const grandTotal = currentList.reduce((acc, curr) => acc + Number(curr.total_amount), 0);
  const totalPaidReceived = currentList.reduce((acc, curr) => acc + Number(curr.paid_received_amount), 0);
  const totalRemaining = currentList.reduce((acc, curr) => acc + Number(curr.remaining_balance), 0);

  return (
    <>
      <Head>
        <title>Personal Ledger - Karwan-e-Rahian-e-Noor</title>
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

          <span className="px-3.5 py-1 bg-[#0b2447] text-amber-400 font-bold text-xs rounded-full shadow-sm">
            Total Records: {currentList.length}
          </span>
        </div>

        {/* Section Switcher Tabs */}
        <div className="bg-slate-200/90 p-1.5 rounded-2xl flex items-center gap-2 shadow-inner">
          <button
            onClick={() => {
              setActiveTab('payable');
              resetForm();
            }}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'payable'
                ? 'bg-rose-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Payables (Money to Give)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('receivable');
              resetForm();
            }}
            className={`flex-1 py-2.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'receivable'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Receivables (Money to Receive)</span>
          </button>
        </div>

        {/* Overall Balance Summary Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 text-center shadow-sm">
            <span className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Total Amount</span>
            <span className="text-xs sm:text-base font-black text-slate-800">
              Rs. {grandTotal.toLocaleString()}
            </span>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 text-center shadow-sm">
            <span className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase">
              {activeTab === 'payable' ? 'Total Paid' : 'Total Received'}
            </span>
            <span className="text-xs sm:text-base font-black text-emerald-600">
              Rs. {totalPaidReceived.toLocaleString()}
            </span>
          </div>

          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 text-center shadow-sm">
            <span className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase">Total Remaining</span>
            <span className="text-xs sm:text-base font-black text-rose-600">
              Rs. {totalRemaining.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Main Entry / Edit Form */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200/80">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0b2447]" />
              <span>
                {editingId
                  ? 'Edit Record / Update Payments'
                  : activeTab === 'payable'
                  ? 'Add New Payable Entry'
                  : 'Add New Receivable Entry'}
              </span>
            </h3>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-[11px] font-bold text-rose-600 hover:underline"
              >
                Cancel Edit (New Entry)
              </button>
            )}
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              
              {/* Date */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Date *</label>
                <input
                  type="date"
                  required
                  name="entryDate"
                  value={formData.entryDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>

              {/* Person Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Person / Agency Name *</label>
                <input
                  type="text"
                  required
                  name="personName"
                  value={formData.personName}
                  onChange={handleChange}
                  placeholder="e.g. Muhammad Ali"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Address / Contact</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. City / 03001234567"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>

              {/* Total Amount */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Total Amount (PKR) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>

              {/* Paid / Received Amount */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  {activeTab === 'payable' ? 'Paid Amount (PKR) *' : 'Received Amount (PKR) *'}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  name="paidReceivedAmount"
                  value={formData.paidReceivedAmount}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-700 focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>

              {/* Calculated Remaining Balance (Read-Only Preview) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Remaining Balance (Auto)</label>
                <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-black text-rose-600">
                  Rs. {calculateRemaining().toLocaleString()}
                </div>
              </div>

              {/* Notes */}
              <div className="sm:col-span-2 md:col-span-3">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Remarks / Notes (Optional)</label>
                <input
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="e.g. Visa or Ticket payment description"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>

            </div>

            {/* Actions */}
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-2.5 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition flex items-center gap-1.5 disabled:opacity-50 ${
                  activeTab === 'payable' ? 'bg-rose-700 hover:bg-rose-800' : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                {editingId ? <Edit3 className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                <span>{submitting ? 'Saving...' : editingId ? 'Update Record' : 'Save Record'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Ledger Records Table */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-4">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider">
              {activeTab === 'payable' ? 'Payables Directory' : 'Receivables Directory'}
            </h3>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or address..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-xs text-slate-400 text-center py-6">Loading ledger records...</p>
          ) : currentList.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No ledger records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5">Date</th>
                    <th>Name</th>
                    <th>Address / Contact</th>
                    <th>Total Amount</th>
                    <th>{activeTab === 'payable' ? 'Paid Amount' : 'Received Amount'}</th>
                    <th>Remaining Due</th>
                    <th>Remarks</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {currentList.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 transition cursor-pointer"
                      onClick={() => handleEdit(item)}
                      title="Click to edit and update payments"
                    >
                      <td className="py-3 text-slate-500 whitespace-nowrap">{item.entry_date}</td>
                      <td className="font-bold text-[#0b2447]">{item.person_name}</td>
                      <td className="text-slate-500 max-w-[150px] truncate">{item.address || '—'}</td>
                      <td className="font-bold text-slate-800">Rs. {Number(item.total_amount).toLocaleString()}</td>
                      <td className="font-bold text-emerald-600">Rs. {Number(item.paid_received_amount).toLocaleString()}</td>
                      <td className="font-black text-rose-600">Rs. {Number(item.remaining_balance).toLocaleString()}</td>
                      <td className="text-slate-500 text-[11px] max-w-[150px] truncate">{item.notes || '—'}</td>
                      <td className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Record"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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