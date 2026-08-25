import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { 
  UserPlus, 
  User, 
  CreditCard, 
  Phone, 
  MapPin, 
  Briefcase, 
  Mail, 
  Lock, 
  Camera, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function RegisterAgent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    regNumber: 'KRN001',
    fullName: '',
    fatherName: '',
    cnic: '',
    passportNumber: '',
    phone: '',
    whatsapp: '',
    dob: '',
    address: '',
    carwanName: '',
    officeAddress: '',
    email: '',
    username: '',
    password: '',
  });

  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [imageSizeKb, setImageSizeKb] = useState<number | null>(null);

  // Auto-generate serial Reg Number (KRN001, KRN002, ...)
  useEffect(() => {
    fetchLatestRegNumber();
  }, []);

  const fetchLatestRegNumber = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('reg_number')
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0 && data[0].reg_number) {
        const lastReg = data[0].reg_number;
        const numPart = parseInt(lastReg.replace('KRN', ''), 10);
        if (!isNaN(numPart)) {
          const nextNum = (numPart + 1).toString().padStart(3, '0');
          setFormData((prev) => ({ ...prev, regNumber: `KRN${nextNum}` }));
          return;
        }
      }
      setFormData((prev) => ({ ...prev, regNumber: 'KRN001' }));
    } catch (err) {
      setFormData((prev) => ({ ...prev, regNumber: 'KRN001' }));
    }
  };

  // Image Compressor to ~50KB using HTML Canvas
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = document.createElement('img');
      img.src = readerEvent.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Compress quality iteratively until under 50KB
        let quality = 0.7;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        while (dataUrl.length * 0.75 > 50 * 1024 && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        const calculatedSizeKb = Math.round((dataUrl.length * 0.75) / 1024);
        setPhotoBase64(dataUrl);
        setImageSizeKb(calculatedSizeKb);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Insert into agents table
      const { error: agentError } = await supabase.from('agents').insert([
        {
          reg_number: formData.regNumber,
          full_name: formData.fullName,
          father_name: formData.fatherName,
          cnic: formData.cnic,
          passport_number: formData.passportNumber,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          dob: formData.dob || null,
          address: formData.address,
          carwan_name: formData.carwanName,
          office_address: formData.officeAddress,
          email: formData.email,
          username: formData.username.trim(),
          photo_base64: photoBase64,
        },
      ]);

      if (agentError) throw agentError;

      // 2. Insert into users table for login authentication
      const { error: userError } = await supabase.from('users').insert([
        {
          username: formData.username.trim(),
          password: formData.password.trim(),
          role: 'agent',
          name: formData.fullName,
        },
      ]);

      if (userError) throw userError;

      setSuccessMsg(`Agent registered successfully with ID: ${formData.regNumber}`);
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Agent Registration - Karwan-e-Rahian-e-Noor</title>
      </Head>

      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        
        {/* Top Breadcrumb & Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-[#0f2d59] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <span className="px-4 py-1.5 bg-[#0f2d59] text-amber-400 font-mono font-bold text-xs rounded-full border border-blue-900 shadow-sm">
            REG ID: {formData.regNumber}
          </span>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          
          <div className="bg-[#0f2d59] p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
                <UserPlus className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight uppercase">Agent Registration Form</h1>
                <p className="text-xs text-blue-200">Register new affiliated agency or sub-agent credentials</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Photo & Identity Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-slate-200 border-2 border-dashed border-slate-400 flex items-center justify-center flex-shrink-0">
                {photoBase64 ? (
                  <Image src={photoBase64} alt="Agent Preview" fill className="object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-400" />
                )}
              </div>
              <div className="flex-grow space-y-2 text-center sm:text-left">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Agent Profile Picture (Auto-Compressed ≤ 50KB)
                </label>
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#0f2d59] text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-[#1b437e] transition">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Choose Photo</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {imageSizeKb !== null && (
                  <p className="text-[11px] font-semibold text-emerald-600">
                    Compressed Size: {imageSizeKb} KB (Optimized)
                  </p>
                )}
              </div>
            </div>

            {/* Section 1: Personal Particulars */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-[#0f2d59]" />
                <span>Personal Information</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Muhammad Raza"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0f2d59] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Father Name</label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    placeholder="Father Name"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0f2d59] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">CNIC Number *</label>
                  <input
                    type="text"
                    required
                    name="cnic"
                    value={formData.cnic}
                    onChange={handleChange}
                    placeholder="38201-XXXXXXX-X"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0f2d59] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Passport Number</label>
                  <input
                    type="text"
                    name="passportNumber"
                    value={formData.passportNumber}
                    onChange={handleChange}
                    placeholder="e.g. AB1234567"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0f2d59] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0f2d59] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0300-1234567"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0f2d59] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="0300-1234567"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0f2d59] outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Full home address"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0f2d59] outline-none"
                  />
                </div>

              </div>
            </div>

            {/* Section 2: Business & Karwan Particulars */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#0f2d59]" />
                <span>Karwan & Agency Details</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Karwan / Agency Name *</label>
                  <input
                    type="text"
                    required
                    name="carwanName"
                    value={formData.carwanName}
                    onChange={handleChange}
                    placeholder="e.g. Al-Hadi Travel"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0f2d59] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Office Location / Address</label>
                  <input
                    type="text"
                    name="officeAddress"
                    value={formData.officeAddress}
                    onChange={handleChange}
                    placeholder="e.g. Karor Lal Esan, Main Bazar"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0f2d59] outline-none"
                  />
                </div>

              </div>
            </div>

            {/* Section 3: Portal Login Credentials */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#0f2d59]" />
                <span>Portal Login Credentials</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="agent@domain.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0f2d59] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username (For Login) *</label>
                  <input
                    type="text"
                    required
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="e.g. agent_karor"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0f2d59] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter login password"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#0f2d59] outline-none"
                  />
                </div>

              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-[#0f2d59] hover:bg-[#1b437e] text-amber-400 font-bold text-xs tracking-wider uppercase rounded-xl shadow-md transition disabled:opacity-50"
              >
                {loading ? 'Saving Registration...' : 'Register Agent Now'}
              </button>
            </div>

          </form>

        </div>

      </div>
    </>
  );
}