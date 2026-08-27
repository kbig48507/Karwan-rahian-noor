import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { createWorker } from 'tesseract.js';
import { 
  UserPlus, 
  User, 
  Camera, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function RegisterZair() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    regNumber: 'Z0001',
    fullName: '',
    fatherName: '',
    phone: '',
    whatsapp: '',
    cnic: '',
    passportNumber: '',
    passportIssueDate: '',
    passportExpiryDate: '',
    dob: '',
    address: '',
    email: '',
    username: '',
    password: '',
  });

  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [imageSizeKb, setImageSizeKb] = useState<number | null>(null);

  useEffect(() => {
    fetchLatestRegNumber();
  }, []);

  const fetchLatestRegNumber = async () => {
    try {
      const { data } = await supabase
        .from('zaireen')
        .select('reg_number')
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0 && data[0].reg_number) {
        const lastReg = data[0].reg_number;
        const numPart = parseInt(lastReg.replace('Z', ''), 10);
        if (!isNaN(numPart)) {
          const nextNum = (numPart + 1).toString().padStart(4, '0');
          setFormData((prev) => ({ ...prev, regNumber: `Z${nextNum}` }));
          return;
        }
      }
      setFormData((prev) => ({ ...prev, regNumber: 'Z0001' }));
    } catch {
      setFormData((prev) => ({ ...prev, regNumber: 'Z0001' }));
    }
  };

  // Local OCR Passport Scanner using Tesseract.js (No API Key needed, 100% stable)
  const handlePassportScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setScanStatus('Initializing OCR...');
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const reader = new FileReader();
      reader.onload = async (readerEvent) => {
        const fullBase64 = readerEvent.target?.result as string;

        const img = document.createElement('img');
        img.src = fullBase64;
        img.onload = async () => {
          // 1. Crop Pilgrim Photo accurately
          const cropCanvas = document.createElement('canvas');
          const cropCtx = cropCanvas.getContext('2d');
          cropCanvas.width = 280;
          cropCanvas.height = 340;

          cropCtx?.drawImage(
            img, 
            img.width * 0.05, img.height * 0.23, img.width * 0.23, img.height * 0.40, 
            0, 0, cropCanvas.width, cropCanvas.height
          );

          const faceDataUrl = cropCanvas.toDataURL('image/jpeg', 0.85);
          setPhotoBase64(faceDataUrl);
          setImageSizeKb(Math.round((faceDataUrl.length * 0.75) / 1024));

          setScanStatus('Reading passport text...');

          // 2. Run Tesseract OCR locally in browser
          const worker = await createWorker('eng');
          const ret = await worker.recognize(fullBase64);
          await worker.terminate();

          const text = ret.data.text;
          console.log('OCR Result:', text);

          // 3. Smart Regex Extractors for Pakistani Passport
          // Passport Number (e.g., 2 letters followed by numbers like AB1234567 or LS1018043)
          const passportMatch = text.match(/[A-Z]{2}[0-9]{7}/);
          
          // CNIC Pattern (e.g., 32202-2530804-5 or similar numbers)
          const cnicMatch = text.match(/[0-9]{5}-[0-9]{7}-[0-9]/);

          // Dates Pattern (YYYY-MM-DD or DD/MM/YYYY)
          const dates = text.match(/\b(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])\b/g) || [];

          setFormData((prev) => ({
            ...prev,
            passportNumber: passportMatch ? passportMatch[0] : prev.passportNumber,
            cnic: cnicMatch ? cnicMatch[0] : prev.cnic,
            passportIssueDate: dates[0] || prev.passportIssueDate,
            passportExpiryDate: dates[1] || prev.passportExpiryDate,
            dob: dates[2] || prev.dob,
          }));

          setSuccessMsg('Passport scanned successfully via local OCR!');
          setScanning(false);
          setScanStatus('');
        };
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg('Failed to read passport text. Please fill manually or try another image.');
      setScanning(false);
      setScanStatus('');
    }
  };

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error: zairError } = await supabase.from('zaireen').insert([
        {
          reg_number: formData.regNumber,
          full_name: formData.fullName,
          father_name: formData.fatherName,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          cnic: formData.cnic,
          passport_number: formData.passportNumber,
          passport_issue_date: formData.passportIssueDate || null,
          passport_expiry_date: formData.passportExpiryDate || null,
          dob: formData.dob || null,
          address: formData.address,
          email: formData.email,
          username: formData.username.trim(),
          photo_base64: photoBase64,
        },
      ]);

      if (zairError) throw zairError;

      const { error: userError } = await supabase.from('users').insert([
        {
          username: formData.username.trim(),
          password: formData.password.trim(),
          role: 'zair',
          name: formData.fullName,
        },
      ]);

      if (userError) throw userError;

      setSuccessMsg(`Zair registered successfully with ID: ${formData.regNumber}`);
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register zair. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Zair Registration - Karwan-e-Rahian-e-Noor</title>
      </Head>

      <div className="w-full space-y-4 pb-10">
        
        {/* Top Action Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-[#0b2447] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>

          <span className="px-3.5 py-1 bg-emerald-700 text-white font-mono font-bold text-xs rounded-full shadow-sm">
            REG ID: {formData.regNumber}
          </span>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80">
          
          <div className="text-center pb-3 border-b border-slate-100 mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="text-xs sm:text-base font-black text-slate-800 tracking-wider uppercase flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <span>ZAIR / PILGRIM REGISTRATION</span>
              </h2>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                Local OCR Passport Scanner (Fast & No API Key Required)
              </p>
            </div>

            {/* OCR Scan Button */}
            <label className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow flex items-center gap-2 transition">
              {scanning ? <Loader2 className="w-4 h-4 animate-spin text-amber-300" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
              <span>{scanning ? scanStatus : 'Scan Passport (OCR)'}</span>
              <input type="file" accept="image/*" onChange={handlePassportScan} disabled={scanning} className="hidden" />
            </label>
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
            
            {/* Cropped Face / Photo Upload */}
            <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center flex-shrink-0">
                {photoBase64 ? (
                  <Image src={photoBase64} alt="Cropped Face Preview" fill className="object-cover" />
                ) : (
                  <User className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0b2447] text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-[#163a6f] transition">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upload Profile Photo</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {imageSizeKb !== null && (
                  <span className="block text-[10px] font-semibold text-emerald-600 mt-1">
                    Size: {imageSizeKb} KB (Optimized)
                  </span>
                )}
              </div>
            </div>

            {/* Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Mureed Abbas"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Father Name</label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  placeholder="Mehmood"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0300-1234567"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="0300-1234567"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">CNIC Number *</label>
                <input
                  type="text"
                  required
                  name="cnic"
                  value={formData.cnic}
                  onChange={handleChange}
                  placeholder="32202-2530804-5"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Passport Number *</label>
                <input
                  type="text"
                  required
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleChange}
                  placeholder="LS1018043"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-purple-700 focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Passport Issue Date</label>
                <input
                  type="date"
                  name="passportIssueDate"
                  value={formData.passportIssueDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Passport Expiry Date</label>
                <input
                  type="date"
                  name="passportExpiryDate"
                  value={formData.passportExpiryDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="zair@domain.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Residential Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Layyah, Pakistan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Username (For Login) *</label>
                <input
                  type="text"
                  required
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Login username"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Password *</label>
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Login password"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-[#0b2447] outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || scanning}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Register Zair'}
              </button>
            </div>

          </form>

        </div>

      </div>
    </>
  );
}