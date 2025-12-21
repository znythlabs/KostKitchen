import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { supabase } from '../lib/supabase';

export const Profile = () => {
  const { logout, user } = useApp();
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const r = new FileReader();
      r.onload = (x) => {
        // In a real app we'd save this to context/backend.
        // For visual parity, we'll just force update all avatars on screen.
        document.querySelectorAll("img[alt='Profile']").forEach((img: any) => img.src = x.target?.result);
      };
      r.readAsDataURL(f);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) return;
    if (newPassword.length < 6) {
        setStatusMsg({ type: 'error', text: 'Password must be at least 6 characters' });
        return;
    }

    setIsLoading(true);
    setStatusMsg(null);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setIsLoading(false);
    if (error) {
        setStatusMsg({ type: 'error', text: error.message });
    } else {
        setStatusMsg({ type: 'success', text: 'Password updated successfully. You may receive a confirmation email.' });
        setNewPassword("");
    }
  };

  return (
    <div className="view-section fade-enter space-y-6">
      <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-sm border border-gray-100 dark:border-[#38383A] overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 border-b border-gray-100 dark:border-[#38383A]">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 dark:border-[#2C2C2E]">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" className="w-full h-full object-cover" alt="Profile" />
            </div>
            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <iconify-icon icon="lucide:camera" class="text-white" width="24"></iconify-icon>
            </div>
            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleAvatarChange} />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Administrator</h2>
            <p className="text-sm text-gray-500 dark:text-[#8E8E93]">{user?.email || 'admin@costkitchen.local'}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-[#007AFF] rounded-full text-xs font-semibold">Super Admin</span>
          </div>
        </div>
        <div className="p-6 space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Security</h3>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5 block">New Password</label>
                <div className="relative">
                    <input 
                        type={showPassword ? "text" : "password"} 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 pr-12 text-gray-900 dark:text-white outline-none focus:border-[#007AFF] transition-all font-medium" 
                        placeholder="••••••••" 
                    />
                    <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 h-full px-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex items-center justify-center"
                    >
                        <iconify-icon icon={showPassword ? "lucide:eye-off" : "lucide:eye"} width="18"></iconify-icon>
                    </button>
                </div>
                {statusMsg && (
                    <div className={`mt-2 text-xs font-medium ${statusMsg.type === 'error' ? 'text-red-500' : 'text-green-500'} flex items-center gap-1.5`}>
                        <iconify-icon icon={statusMsg.type === 'error' ? "lucide:alert-circle" : "lucide:check-circle"} width="14"></iconify-icon>
                        {statusMsg.text}
                    </div>
                )}
              </div>
              <button 
                type="submit" 
                disabled={isLoading || !newPassword}
                className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-sm font-bold shadow-lg shadow-gray-200/50 dark:shadow-none hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading && <iconify-icon icon="lucide:loader-2" width="16" class="animate-spin"></iconify-icon>}
                Update Password
              </button>
            </form>
          </div>
          <div className="pt-4 border-t border-gray-100 dark:border-[#38383A]">
            <button onClick={logout} className="flex items-center gap-2 text-red-500 font-semibold text-sm hover:opacity-80">
              <iconify-icon icon="lucide:log-out" width="16"></iconify-icon> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};