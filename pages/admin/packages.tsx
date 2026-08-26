import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  Package, 
  Plus, 
  MapPin, 
  Utensils, 
  Building2, 
  Navigation, 
  Banknote, 
  Calendar,
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Trash2,
  Layers
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PackageItem {
  id: number;
  package_name: string;
  category: string;
  destinations: string;
  duration_days: number;
  meals_included: string;
  hotel_name: string;
  hotel_distance: string;
  price: number;
  currency: string;
  status: string;
}

export default function AdminPackages() {
  const router = useRouter();
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    packageName: '',
    category: 'Ziyarat',
    destinations: '',
    durationDays: 15,
    mealsIncluded: 'Full Board (3 Meals/Day)',
    hotelName: '',
    hotelDistance: '150 Meters from Haram',
    price: '',
    currency: 'PKR',
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
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

    try {
      const { error } = await supabase.from('packages').insert([
        {
          package_name: formData.packageName.trim(),
          category: formData.category,
          destinations: formData.destinations.trim(),
          duration_days: Number(formData.durationDays),
          meals_included: formData.mealsIncluded,
          hotel_name: formData.hotelName.trim(),
          hotel_distance: formData.hotelDistance.trim(),
          price: Number(formData.price),
          currency: formData.currency,
          status: 'Active',
        },
      ]);

      if (error) throw error;

      setSuccessMsg('Package created successfully!');
      setFormData({
        packageName: '',
        category: 'Ziyarat',
        destinations: '',
        durationDays: 15,
        mealsIncluded: 'Full Board (3 Meals/Day)',
        hotelName: '',
        hotelDistance: '150 Meters from Haram',
        price: '',
        currency: 'PKR',
      });
      fetchPackages();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create package. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    try {
      const { error } = await supabase.from('packages').delete().eq('id', id);
      if (error) throw error;
      setPackages(packages.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete package.');
    }
  };

  return (
    <>
      <Head>
        <title>Manage Packages - Karwan-e-Rahian-e-Noor</title>
      </Head>

      <div className="w-full space-y-4 pb-8">
        
        {/* Top Action Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-[#0b2447] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <span className="px-3.5 py-1 bg-[#0b2447] text-amber-400 font-bold text-xs rounded-full shadow-sm">
            Total Packages: {packages.length}
          </span>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200/80">
          
          <div className="text-center sm:text-left pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xs sm:text-base font-black text-slate-800 tracking-wider uppercase flex items-center gap-2">
                <Package className="w-4 h-4 text-[#0b2447]" />
                <span>Create New Travel Package</span>
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5">
                Define destination sites, hotels, meals, duration, and package cost
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              
              {/* Package Name */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Package Title *</label>
                <input
                  type="text"
                  required
                  name="packageName"
                  value={formData.packageName}
                  onChange={handleChange}
                  placeholder="e.g. 15 Days Arbaeen Special Caravan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                >
                  <option value="Ziyarat">Ziyarat (Iran/Iraq/Syria)</option>
                  <option value="Umrah">Umrah (Makkah/Madinah)</option>
                  <option value="Combined">Combined (Umrah + Ziyarat)</option>
                </select>
              </div>

              {/* Destinations */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Destinations / Holy Sites *</label>
                <input
                  type="text"
                  required
                  name="destinations"
                  value={formData.destinations}
                  onChange={handleChange}
                  placeholder="e.g. Najaf, Karbala, Kazmain, Samarra, Mashhad"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>

              {/* Duration Days */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Duration (Days) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  name="durationDays"
                  value={formData.durationDays}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>

              {/* Meals */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Food / Meals Included *</label>
                <select
                  name="mealsIncluded"
                  value={formData.mealsIncluded}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                >
                  <option value="Full Board (3 Meals/Day)">Full Board (3 Meals / Day)</option>
                  <option value="Breakfast & Dinner (2 Meals)">Breakfast & Dinner (2 Meals)</option>
                  <option value="Breakfast Only">Breakfast Only</option>
                  <option value="Self Catering (No Meals)">Self Catering (No Meals)</option>
                </select>
              </div>

              {/* Hotel Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Hotel Name *</label>
                <input
                  type="text"
                  required
                  name="hotelName"
                  value={formData.hotelName}
                  onChange={handleChange}
                  placeholder="e.g. Al-Baraka Hotel / 4-Star"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>

              {/* Hotel Distance */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Distance to Haram / Shrine *</label>
                <input
                  type="text"
                  required
                  name="hotelDistance"
                  value={formData.hotelDistance}
                  onChange={handleChange}
                  placeholder="e.g. 150 Meters / 3 Mins Walk"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>

              {/* Package Cost & Currency */}
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Total Package Price (PKR) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 350000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>

            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#0b2447] hover:bg-[#163a6f] text-amber-400 font-bold text-xs uppercase tracking-wider rounded-xl shadow transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{submitting ? 'Creating...' : 'Save Package'}</span>
              </button>
            </div>
          </form>

        </div>

        {/* Existing Packages List */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200/80">
          <div className="pb-3 border-b border-slate-100 mb-4">
            <h3 className="text-xs sm:text-base font-black text-slate-800 tracking-wider uppercase">
              Active Published Packages
            </h3>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium animate-pulse">
              Loading packages...
            </div>
          ) : packages.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No packages found. Create your first package above.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between transition group shadow-sm"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="px-2.5 py-0.5 bg-blue-100 text-[#0b2447] text-[10px] font-bold rounded-md">
                          {pkg.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 mt-1">
                          {pkg.package_name}
                        </h4>
                      </div>
                      <span className="text-sm font-black text-[#0b2447]">
                        Rs. {Number(pkg.price).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                        <span className="truncate">{pkg.destinations}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        <span>{pkg.duration_days} Days</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span className="truncate">{pkg.hotel_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                        <span className="truncate">{pkg.hotel_distance}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <Utensils className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span>{pkg.meals_included}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200/80 flex items-center justify-end">
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 transition"
                      title="Delete Package"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}