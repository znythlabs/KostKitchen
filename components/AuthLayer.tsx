import React, { useState } from 'react';
import { useApp } from '../AppContext';

export const AuthLayer = () => {
  const { login } = useApp();
  const [email, setEmail] = useState("admin@costkitchen.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (email.trim().length > 0 && password.trim().length > 0) {
      login();
    } else {
      alert("Please enter email and password.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center p-6 transition">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 fade-enter relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-green-500 to-orange-500"></div>
        <div className="flex justify-center mb-8 mt-8">
          <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-lg transform -rotate-3">
            <iconify-icon icon="lucide:chef-hat" width="28"></iconify-icon>
          </div>
        </div>
        <div className="text-center mb-8 px-8">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">Admin Portal</h1>
          <p className="text-sm text-gray-500 mt-2">Enter credentials to access dashboard</p>
        </div>
        <div className="px-8 pb-8 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide ml-1">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              className="ios-input w-full mt-2 px-4 py-3 text-sm font-medium border border-gray-100 hover:border-gray-200 bg-gray-50 text-gray-900 focus:bg-white transition-all" 
              placeholder="name@company.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide ml-1">Password</label>
            <div className="relative mt-2">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="ios-input w-full px-4 py-3 text-sm font-medium border border-gray-100 hover:border-gray-200 bg-gray-50 text-gray-900 focus:bg-white pr-10 transition-all" 
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <iconify-icon icon={showPassword ? "lucide:eye-off" : "lucide:eye"} width="18"></iconify-icon>
              </button>
            </div>
          </div>
          <button 
            type="button" 
            onClick={handleLogin}
            className="w-full bg-gray-900 text-white font-medium py-3.5 rounded-xl shadow-lg shadow-gray-200 active-scale hover:bg-black transition-all mt-4 text-sm flex items-center justify-center gap-2"
          >
            <span>Secure Sign In</span>
            <iconify-icon icon="lucide:arrow-right" width="16"></iconify-icon>
          </button>
        </div>
      </div>
    </div>
  );
};