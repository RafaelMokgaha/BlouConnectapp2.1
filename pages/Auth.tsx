import React, { useState } from 'react';
import { VILLAGES } from '../constants';
import { useApp } from '../contexts/AppContext';
import { Camera, ChevronRight } from 'lucide-react';

export const AuthScreen = () => {
  const { login } = useApp();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Phone, 2: OTP, 3: Profile
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  
  // Profile Form
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [village, setVillage] = useState(VILLAGES[0]);
  const [avatarPreview, setAvatarPreview] = useState<string>('https://picsum.photos/200/200');

  const handleSendOtp = () => {
    if (phone.length > 9) setStep(2);
  };

  const handleVerifyOtp = () => {
    if (otp.length === 4) setStep(3);
  };

  const handleFinish = () => {
    if (!fullName || !dob) return;
    
    login({
      id: Math.random().toString(36).substr(2, 9),
      fullName,
      phoneNumber: phone,
      village,
      dob,
      avatar: avatarPreview,
      isOnline: true,
      followers: 0,
      following: 0
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if(ev.target?.result) setAvatarPreview(ev.target.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-blou-600 dark:bg-gray-900 px-6 max-w-md mx-auto relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blou-500 rounded-full opacity-30 blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blou-400 rounded-full opacity-30 blur-3xl"></div>

      <div className="w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 z-10 animate-slide-up">
        {/* LOGO */}
        <div className="flex justify-center mb-6">
             <img src="https://static.wixstatic.com/media/a827d0_d405a6c5e1dc4ce3b4b7c86430986c12~mv2.png" className="w-20 h-20 object-contain" alt="Logo" />
        </div>

        <h1 className="text-2xl font-bold text-center mb-2 dark:text-white">
          {step === 1 ? 'Welcome' : step === 2 ? 'Verification' : 'Profile'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-8">
          {step === 1 ? 'Enter your mobile number to begin' : step === 2 ? 'Enter the code sent to your phone' : 'Tell us a bit about yourself'}
        </p>

        {step === 1 && (
          <div className="space-y-4">
            <div className="relative">
               <span className="absolute left-3 top-3 text-gray-500">+27</span>
               <input 
                 type="tel" 
                 className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blou-500 dark:text-white"
                 placeholder="Phone Number"
                 value={phone}
                 onChange={(e) => setPhone(e.target.value)}
               />
            </div>
            <button 
              onClick={handleSendOtp}
              disabled={phone.length < 10}
              className="w-full bg-blou-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blou-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              Continue <ChevronRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <input 
              type="text" 
              className="w-full text-center tracking-[1em] text-2xl py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blou-500 dark:text-white"
              maxLength={4}
              placeholder="0000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button 
              onClick={handleVerifyOtp}
              disabled={otp.length < 4}
              className="w-full bg-blou-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blou-600/30 disabled:opacity-50"
            >
              Verify
            </button>
            <button onClick={() => setStep(1)} className="w-full text-sm text-gray-500 mt-2">Change Number</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 overflow-y-auto max-h-[60vh] no-scrollbar">
            {/* Avatar Upload */}
            <div className="flex justify-center">
              <div className="relative">
                <img src={avatarPreview} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-blou-100 dark:border-gray-600" />
                <label className="absolute bottom-0 right-0 bg-blou-600 p-2 rounded-full cursor-pointer text-white shadow-md">
                  <Camera size={16} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            </div>

            <input 
              type="text" 
              placeholder="Full Name"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 dark:text-white"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <div>
              <label className="text-xs text-gray-500 ml-1">Date of Birth</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 dark:text-white"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            <div>
               <label className="text-xs text-gray-500 ml-1">Village / Area</label>
               <select 
                 value={village} 
                 onChange={(e) => setVillage(e.target.value)}
                 className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 dark:text-white"
               >
                 {VILLAGES.map(v => (
                   <option key={v} value={v}>{v}</option>
                 ))}
               </select>
            </div>

            <button 
              onClick={handleFinish}
              className="w-full bg-blou-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blou-600/30"
            >
              Complete Setup
            </button>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-6 text-white/50 text-xs">BlouConnect v1.0</div>
    </div>
  );
};