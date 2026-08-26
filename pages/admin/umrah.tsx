import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  Moon, 
  Plus, 
  Users, 
  UserCheck, 
  Building, 
  Calendar, 
  Wallet, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Trash2,
  Receipt,
  UserPlus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface UmrahMember {
  id: number;
  group_id: number;
  zair_name: string;
  passport_number: string;
  package_name: string;
  total_price: number;
  paid_amount: number;
}

interface UmrahGroup {
  id: number;
  group_name: string;
  agent_name: string;
  departure_date: string;
  return_date: string;
  status: string;
}

export default function UmrahPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'groups' | 'agents'>('groups');
  const [groups, setGroups] = useState<UmrahGroup[]>([]);
  const [members, setMembers] = useState<UmrahMember[]>([]);
  const [registeredZaireen, setRegisteredZaireen] = useState<any[]>([]);
  const [packagesList, setPackagesList] = useState<any[]>([]);
  const [agentsList, setAgentsList] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // New Group Form State
  const [newGroup, setNewGroup] = useState({
    groupName: '',
    agentName: '',
    departureDate: '',
    returnDate: ''
  });

  // Add Member to Group State
  const [newMember, setNewMember] = useState({
    groupId: '',
    zairId: '',
    packageName: '',
    totalPrice: '',
    paidAmount: '0'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [grpRes, memRes, zairRes, pkgRes, agtRes] = await Promise.all([
        supabase.from('umrah_groups').select('*').order('created_at', { ascending: false }),
        supabase.from('umrah_members').select('*'),
        supabase.from('zaireen').select('id, full_name, passport_number'),
        supabase.from('packages').select('id, package_name, price'),
        supabase.from('agents').select('id, full_name, carwan_name')
      ]);

      setGroups(grpRes.data || []);
      setMembers(memRes.data || []);
      setRegisteredZaireen(zairRes.data || []);
      setPackagesList(pkgRes.data || []);
      setAgentsList(agtRes.data || []);
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase.from('umrah_groups').insert([{
        group_name: newGroup.groupName.trim(),
        agent_name: newGroup.agentName.trim(),
        departure_date: newGroup.departureDate || null,
        return_date: newGroup.returnDate || null,
        status: 'Active'
      }]);

      if (error) throw error;
      setSuccessMsg('Umrah Group Created Successfully!');
      setNewGroup({ groupName: '', agentName: '', departureDate: '', returnDate: '' });
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create Umrah Group.');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const selectedZair = registeredZaireen.find(z => z.id.toString() === newMember.zairId);
    if (!selectedZair) return;

    try {
      const { error } = await supabase.from('umrah_members').insert([{
        group_id: Number(newMember.groupId),
        zair_name: selectedZair.full_name,
        passport_number: selectedZair.passport_number || '',
        package_name: newMember.packageName,
        total_price: Number(newMember.totalPrice),
        paid_amount: Number(newMember.paidAmount)
      }]);

      if (error) throw error;
      setSuccessMsg('Zair Added to Group Successfully!');
      setNewMember({ groupId: '', zairId: '', packageName: '', totalPrice: '', paidAmount: '0' });
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add Zair.');
    }
  };

  const handlePackageSelect = (pkgName: string) => {
    const pkg = packagesList.find(p => p.package_name === pkgName);
    setNewMember({
      ...newMember,
      packageName: pkgName,
      totalPrice: pkg ? pkg.price.toString() : ''
    });
  };

  const handleDeleteMember = async (id: number) => {
    if (!confirm('Remove this Zair from the group?')) return;
    try {
      await supabase.from('umrah_members').delete().eq('id', id);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <>
      <Head>
        <title>Umrah Management - Karwan-e-Rahian-e-Noor</title>
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
            Total Groups: {groups.length}
          </span>
        </div>

        {/* Section Switcher Tabs */}
        <div className="bg-slate-200/90 p-1.5 rounded-2xl flex items-center gap-1 shadow-inner">
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'groups'
                ? 'bg-[#0b2447] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Group Section</span>
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'agents'
                ? 'bg-[#0b2447] text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Agent Summary Section</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {activeTab === 'groups' ? (
          <div className="space-y-4">
            
            {/* 1. Create Group Card */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80">
              <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
                <Moon className="w-4 h-4 text-[#0b2447]" />
                <span>Create New Umrah Group</span>
              </h3>

              <form onSubmit={handleCreateGroup} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Group Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramadan Group 1"
                    value={newGroup.groupName}
                    onChange={(e) => setNewGroup({ ...newGroup, groupName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Agent / Karwan Name *</label>
                  <select
                    required
                    value={newGroup.agentName}
                    onChange={(e) => setNewGroup({ ...newGroup, agentName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                  >
                    <option value="">Select Agent / Karwan</option>
                    <option value="Direct Head Office">Direct Head Office</option>
                    {agentsList.map((agt) => (
                      <option key={agt.id} value={`${agt.full_name} (${agt.carwan_name})`}>
                        {agt.full_name} - {agt.carwan_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Departure Date</label>
                  <input
                    type="date"
                    value={newGroup.departureDate}
                    onChange={(e) => setNewGroup({ ...newGroup, departureDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#0b2447] hover:bg-[#163a6f] text-amber-400 font-bold text-xs uppercase tracking-wider rounded-xl shadow transition"
                  >
                    + Create Group
                  </button>
                </div>
              </form>
            </div>

            {/* 2. Add Zair to Group Form */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80">
              <h3 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <span>Assign Registered Zair to Group & Package</span>
              </h3>

              <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Select Group *</label>
                  <select
                    required
                    value={newMember.groupId}
                    onChange={(e) => setNewMember({ ...newMember, groupId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                  >
                    <option value="">Choose Group</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.group_name} ({g.agent_name})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Registered Zair *</label>
                  <select
                    required
                    value={newMember.zairId}
                    onChange={(e) => setNewMember({ ...newMember, zairId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                  >
                    <option value="">Select Pilgrim</option>
                    {registeredZaireen.map((z) => (
                      <option key={z.id} value={z.id}>{z.full_name} ({z.passport_number || 'No Pass'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Assigned Package *</label>
                  <select
                    required
                    value={newMember.packageName}
                    onChange={(e) => handlePackageSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                  >
                    <option value="">Select Package</option>
                    {packagesList.map((p) => (
                      <option key={p.id} value={p.package_name}>{p.package_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Package Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Total Price"
                    value={newMember.totalPrice}
                    onChange={(e) => setNewMember({ ...newMember, totalPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-[#0b2447] outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition"
                  >
                    + Add to Group
                  </button>
                </div>
              </form>
            </div>

            {/* 3. Groups & Pilgrims Listing */}
            {groups.map((group) => {
              const groupMembers = members.filter(m => m.group_id === group.id);
              const totalCost = groupMembers.reduce((acc, curr) => acc + Number(curr.total_price), 0);
              const totalReceived = groupMembers.reduce((acc, curr) => acc + Number(curr.paid_amount), 0);
              const totalRemaining = totalCost - totalReceived;

              return (
                <div key={group.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-4">
                  
                  {/* Group Header Card */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-blue-100 text-[#0b2447] font-bold text-[10px] rounded-md">
                          {group.agent_name}
                        </span>
                        <h4 className="text-base font-black text-slate-800 uppercase tracking-tight">
                          {group.group_name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Departure: {group.departure_date || 'TBD'} | Return: {group.return_date || 'TBD'}
                      </p>
                    </div>

                    {/* Financial Summary Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase">Zaireen</span>
                        <span className="text-xs font-black text-slate-700">{groupMembers.length}</span>
                      </div>
                      <div className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl text-center">
                        <span className="block text-[9px] font-bold text-blue-600 uppercase">Total Bill</span>
                        <span className="text-xs font-black text-[#0b2447]">Rs. {totalCost.toLocaleString()}</span>
                      </div>
                      <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                        <span className="block text-[9px] font-bold text-emerald-600 uppercase">Received</span>
                        <span className="text-xs font-black text-emerald-700">Rs. {totalReceived.toLocaleString()}</span>
                      </div>
                      <div className="px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl text-center">
                        <span className="block text-[9px] font-bold text-rose-600 uppercase">Remaining Balance</span>
                        <span className="text-xs font-black text-rose-700">Rs. {totalRemaining.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Group Members Table */}
                  {groupMembers.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-3">No pilgrims added to this group yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px]">
                            <th className="py-2">Pilgrim / Zair Name</th>
                            <th>Passport</th>
                            <th>Selected Package</th>
                            <th>Total Price</th>
                            <th>Paid (Accounts)</th>
                            <th>Remaining Due</th>
                            <th className="text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {groupMembers.map((m) => {
                            const balance = Number(m.total_price) - Number(m.paid_amount);
                            return (
                              <tr key={m.id} className="hover:bg-slate-50 transition">
                                <td className="py-2.5 font-bold text-slate-800">{m.zair_name}</td>
                                <td className="text-slate-500">{m.passport_number || 'N/A'}</td>
                                <td>
                                  <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 text-[10px]">
                                    {m.package_name}
                                  </span>
                                </td>
                                <td className="font-bold text-[#0b2447]">Rs. {Number(m.total_price).toLocaleString()}</td>
                                <td className="font-bold text-emerald-600">Rs. {Number(m.paid_amount).toLocaleString()}</td>
                                <td className="font-bold text-rose-600">Rs. {balance.toLocaleString()}</td>
                                <td className="text-right">
                                  <button
                                    onClick={() => handleDeleteMember(m.id)}
                                    className="text-rose-500 hover:text-rose-700 p-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              );
            })}

          </div>
        ) : (
          /* Agent Summary Section */
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200/80">
              <h3 className="text-xs sm:text-base font-black text-slate-800 uppercase tracking-wider pb-4 border-b border-slate-100 flex items-center gap-2">
                <Building className="w-4 h-4 text-[#0b2447]" />
                <span>Agent-Wise Group Billing & Ledger Overview</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {agentsList.map((agent) => {
                  const agentFullName = `${agent.full_name} (${agent.carwan_name})`;
                  const agentGroups = groups.filter(g => g.agent_name === agentFullName || g.agent_name.includes(agent.full_name));
                  const groupIds = agentGroups.map(g => g.id);
                  const agentMembers = members.filter(m => groupIds.includes(m.group_id));

                  const totalBill = agentMembers.reduce((acc, curr) => acc + Number(curr.total_price), 0);
                  const totalPaid = agentMembers.reduce((acc, curr) => acc + Number(curr.paid_amount), 0);
                  const remainingDue = totalBill - totalPaid;

                  return (
                    <div key={agent.id} className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{agent.full_name}</h4>
                          <p className="text-[11px] text-slate-400">{agent.carwan_name}</p>
                        </div>
                        <span className="px-2.5 py-1 bg-[#0b2447] text-white text-[10px] font-bold rounded-lg">
                          {agentGroups.length} Groups
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-200">
                        <div className="bg-white p-2 rounded-xl border border-slate-200">
                          <span className="block text-[9px] font-bold text-slate-400 uppercase">Total Zaireen</span>
                          <span className="text-xs font-black text-slate-700">{agentMembers.length}</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200">
                          <span className="block text-[9px] font-bold text-emerald-600 uppercase">Received</span>
                          <span className="text-xs font-black text-emerald-700">Rs. {totalPaid.toLocaleString()}</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-slate-200">
                          <span className="block text-[9px] font-bold text-rose-600 uppercase">Balance Due</span>
                          <span className="text-xs font-black text-rose-700">Rs. {remainingDue.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Associated Groups Badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {agentGroups.map(g => (
                          <span key={g.id} className="text-[10px] font-semibold px-2 py-0.5 bg-blue-100 text-[#0b2447] rounded-md">
                            {g.group_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}