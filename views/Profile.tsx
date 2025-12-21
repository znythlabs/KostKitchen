import React from 'react';
import { useApp } from '../AppContext';

export const Profile = () => {
  const { logout } = useApp();

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

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Updated");
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
            <p className="text-sm text-gray-500 dark:text-[#8E8E93]">admin@costkitchen.local</p>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-[#007AFF] rounded-full text-xs font-semibold">Super Admin</span>
          </div>
        </div>
        <div className="p-6 space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">Security</h3>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">New Password</label>
                <input type="password" className="ios-input w-full p-3 text-sm" placeholder="••••••••" />
              </div>
              <button type="submit" className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-semibold shadow-sm active-scale">Update Password</button>
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