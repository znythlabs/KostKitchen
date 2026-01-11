import React, { useState } from 'react';
import { useApp } from '../AppContext';

export const HRPayroll = () => {
    const [activeTab, setActiveTab] = useState<'attendance' | 'payroll' | 'employees' | 'stations'>('attendance');

    const TabButton = ({ id, label, icon }: { id: 'attendance' | 'payroll' | 'employees' | 'stations', label: string, icon: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === id
                ? 'bg-white text-[#303030] shadow-sm'
                : 'text-gray-500 hover:text-[#303030] hover:bg-white/50'
                }`}
        >
            <iconify-icon icon={icon} width="16"></iconify-icon>
            <span>{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col h-full min-w-0">
            {/* Header */}
            <header className="flex justify-between items-center mb-6 px-2 shrink-0">
                <div>
                    <h2 className="text-2xl font-semibold text-[#303030] dark:text-white tracking-tight">HR & Payroll</h2>
                    <p className="text-sm text-gray-500 font-light mt-0.5">Automated attendance and payment processing</p>
                </div>

                {/* Context Actions */}
                <div className="flex items-center gap-3">
                    <div className="relative hidden md:block">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 flex items-center">
                            <iconify-icon icon="lucide:search" width="16"></iconify-icon>
                        </div>
                        <input type="text" placeholder="Search employee..." className="w-64 pl-9 py-2 rounded-xl bg-white border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#303030]/10 transition-all dark:bg-[#2A2A2A] dark:border-white/10 dark:text-white" />
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <div className="bg-white/60 dark:bg-[#202020]/60 backdrop-blur-md rounded-2xl p-1.5 flex gap-1 w-fit mb-6 mx-2 md:mx-0 overflow-x-auto shrink-0 border border-white/40 dark:border-white/5">
                <TabButton id="attendance" label="Time & Attendance" icon="lucide:clock" />
                <TabButton id="payroll" label="Payroll Processing" icon="lucide:banknote" />
                <TabButton id="employees" label="Employee Mgmt" icon="lucide:id-card" />
                <TabButton id="stations" label="NFC Stations" icon="lucide:radio" />
            </div>

            {/* CONTENT CONTAINERS */}
            <div className="flex-1 relative overflow-hidden rounded-3xl">

                {/* TAB 1: TIME & ATTENDANCE */}
                {activeTab === 'attendance' && (
                    <div className="absolute inset-0 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-6 px-1 animate-in fade-in duration-300">

                        {/* Live NFC Feed Widget */}
                        <div className="bg-white/60 dark:bg-[#202020]/60 backdrop-blur-md rounded-[2rem] p-5 relative overflow-hidden group border border-white/40 dark:border-white/5 shadow-sm">
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#FCD34D] opacity-10 rounded-full blur-2xl"></div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                    <h3 className="text-sm font-medium text-[#303030] dark:text-white">Live NFC Feed</h3>
                                </div>
                                <span className="text-xs text-gray-400 bg-white/50 dark:bg-white/5 px-2 py-1 rounded-lg">Server Time: 10:42 AM</span>
                            </div>

                            {/* Feed Item */}
                            <div className="flex items-center gap-4 bg-white/40 dark:bg-white/5 p-3 rounded-xl border border-white/40 dark:border-white/5 backdrop-blur-sm">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                    <iconify-icon icon="lucide:rss" width="20"></iconify-icon>
                                </div>
                                <div>
                                    <p className="text-sm text-[#303030] dark:text-white">
                                        <span className="font-semibold">Chef Ramsey</span> clocked <span className="text-green-600 dark:text-green-400 font-medium">IN</span> via Kitchen Station
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5 font-mono">NFC ID: #8821 • Just now</p>
                                </div>
                            </div>
                        </div>

                        {/* Timesheet Grid */}
                        <div className="bg-white/60 dark:bg-[#202020]/60 backdrop-blur-md rounded-[2rem] flex-1 flex flex-col overflow-hidden border border-white/40 dark:border-white/5 shadow-sm">
                            <div className="p-5 flex justify-between items-center border-b border-gray-200/50 dark:border-white/5">
                                <h3 className="font-medium text-[#303030] dark:text-white">Daily Timesheets</h3>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 text-xs font-medium bg-white/50 dark:bg-white/5 rounded-lg hover:bg-white dark:hover:bg-white/10 border border-gray-200/50 dark:border-white/5 text-gray-600 dark:text-gray-300 transition-colors">Export CSV</button>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-white/5 rounded-lg border border-gray-200/50 dark:border-white/5 text-xs">
                                        <span className="text-gray-500">Filter:</span>
                                        <select className="bg-transparent border-none outline-none font-medium text-[#303030] dark:text-white p-0 text-xs">
                                            <option>All Staff</option>
                                            <option>Kitchen</option>
                                            <option>Front of House</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-auto flex-1">
                                <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 bg-white/80 dark:bg-[#202020]/90 backdrop-blur-md z-10 text-xs text-gray-500 uppercase tracking-wider">
                                        <tr>
                                            <th className="p-4 font-medium border-b border-gray-100 dark:border-white/5">Employee</th>
                                            <th className="p-4 font-medium border-b border-gray-100 dark:border-white/5">Date</th>
                                            <th className="p-4 font-medium border-b border-gray-100 dark:border-white/5">Check In</th>
                                            <th className="p-4 font-medium border-b border-gray-100 dark:border-white/5">Check Out</th>
                                            <th className="p-4 font-medium border-b border-gray-100 dark:border-white/5">Break</th>
                                            <th className="p-4 font-medium border-b border-gray-100 dark:border-white/5">Total</th>
                                            <th className="p-4 font-medium border-b border-gray-100 dark:border-white/5">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm text-[#303030] dark:text-white divide-y divide-gray-100/50 dark:divide-white/5">
                                        <tr className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors group">
                                            <td className="p-4 flex items-center gap-3">
                                                <img src="https://i.pravatar.cc/150?u=1" className="w-8 h-8 rounded-full" alt="User" />
                                                <span className="font-medium">Sarah Miller</span>
                                            </td>
                                            <td className="p-4 text-gray-500">Oct 24, 2023</td>
                                            <td className="p-4">08:55 AM</td>
                                            <td className="p-4 text-gray-400">--:--</td>
                                            <td className="p-4">30m</td>
                                            <td className="p-4 font-mono font-medium">Running</td>
                                            <td className="p-4"><span className="px-2 py-1 rounded-full bg-green-100/50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs border border-green-200/50 dark:border-green-900/30">On Time</span></td>
                                        </tr>
                                        <tr className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors group">
                                            <td className="p-4 flex items-center gap-3">
                                                <img src="https://i.pravatar.cc/150?u=4" className="w-8 h-8 rounded-full" alt="User" />
                                                <span className="font-medium">Marcus Chen</span>
                                            </td>
                                            <td className="p-4 text-gray-500">Oct 24, 2023</td>
                                            <td className="p-4">09:15 AM</td>
                                            <td className="p-4 text-gray-400">--:--</td>
                                            <td className="p-4">-</td>
                                            <td className="p-4 font-mono font-medium">Running</td>
                                            <td className="p-4"><span className="px-2 py-1 rounded-full bg-red-100/50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs border border-red-200/50 dark:border-red-900/30">Late (15m)</span></td>
                                        </tr>
                                        <tr className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors group">
                                            <td className="p-4 flex items-center gap-3">
                                                <img src="https://i.pravatar.cc/150?u=8" className="w-8 h-8 rounded-full" alt="User" />
                                                <span className="font-medium">Elena Rossi</span>
                                            </td>
                                            <td className="p-4 text-gray-500">Oct 23, 2023</td>
                                            <td className="p-4">04:00 PM</td>
                                            <td className="p-4">11:30 PM</td>
                                            <td className="p-4">45m</td>
                                            <td className="p-4 font-mono font-medium">6h 45m</td>
                                            <td className="p-4"><span className="px-2 py-1 rounded-full bg-gray-100/50 dark:bg-white/10 text-gray-600 dark:text-gray-400 text-xs border border-gray-200/50 dark:border-white/10">Completed</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 2: PAYROLL PROCESSING */}
                {activeTab === 'payroll' && (
                    <div className="absolute inset-0 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-6 px-1 animate-in fade-in duration-300">

                        {/* Auto Calculation Dashboard */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                            {/* Hours */}
                            <div className="bg-white/60 dark:bg-[#202020]/60 backdrop-blur-md rounded-[2rem] p-5 border border-white/40 dark:border-white/5 shadow-sm">
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Total Hours</p>
                                <h3 className="text-2xl font-semibold tracking-tight text-[#303030] dark:text-white">1,240 <span className="text-sm text-gray-400 font-normal">hrs</span></h3>
                                <div className="mt-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 w-fit px-1.5 py-0.5 rounded border border-green-100 dark:border-green-900/30">Derived from NFC</div>
                            </div>

                            <div className="hidden lg:flex justify-center text-gray-400">
                                <iconify-icon icon="lucide:x" width="24"></iconify-icon>
                            </div>

                            {/* Rate */}
                            <div className="bg-white/60 dark:bg-[#202020]/60 backdrop-blur-md rounded-[2rem] p-5 border border-white/40 dark:border-white/5 shadow-sm">
                                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Avg. Hourly Rate</p>
                                <h3 className="text-2xl font-semibold tracking-tight text-[#303030] dark:text-white">$24<span className="text-lg text-gray-400">.50</span></h3>
                                <div className="mt-2 text-xs text-gray-500 bg-gray-50 dark:bg-white/10 w-fit px-1.5 py-0.5 rounded border border-gray-100 dark:border-white/10">Weighted Avg</div>
                            </div>

                            {/* Equals Net */}
                            <div className="lg:col-span-1 flex flex-col justify-center h-full">
                                <div className="bg-white/60 dark:bg-[#202020]/60 backdrop-blur-md rounded-[2rem] p-6 bg-gradient-to-br from-white/80 to-white/40 dark:from-white/10 dark:to-transparent border-l-4 border-l-[#FCD34D] border border-white/40 dark:border-white/5 shadow-sm">
                                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">Est. Net Payroll</p>
                                    <h3 className="text-3xl font-semibold tracking-tight text-[#303030] dark:text-white">$30,380.00</h3>
                                    <p className="text-xs text-gray-400 mt-1">Includes overtime adjustments</p>
                                </div>
                            </div>
                        </div>

                        {/* Payroll Run List */}
                        <div className="bg-white/60 dark:bg-[#202020]/60 backdrop-blur-md rounded-[2rem] flex-1 flex flex-col overflow-hidden border border-white/40 dark:border-white/5 shadow-sm">
                            <div className="p-5 flex justify-between items-center border-b border-gray-200/50 dark:border-white/5">
                                <div>
                                    <h3 className="font-medium text-[#303030] dark:text-white">Current Payroll Run</h3>
                                    <p className="text-xs text-gray-500">Period: Oct 1 - Oct 15</p>
                                </div>
                                <button className="bg-[#FCD34D] rounded-full px-4 py-2 text-sm font-semibold flex items-center gap-2 shadow-lg shadow-yellow-200/50 text-[#303030] hover:-translate-y-0.5 transition-all">
                                    <iconify-icon icon="lucide:check-circle-2" width="16"></iconify-icon>
                                    Process Batch Payment
                                </button>
                            </div>

                            <div className="overflow-auto flex-1">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 dark:bg-white/5 text-xs text-gray-500 uppercase">
                                        <tr>
                                            <th className="p-4 font-medium">Employee</th>
                                            <th className="p-4 font-medium">Reg Hours</th>
                                            <th className="p-4 font-medium">Overtime</th>
                                            <th className="p-4 font-medium">Gross</th>
                                            <th className="p-4 font-medium">Deductions</th>
                                            <th className="p-4 font-medium text-right">Net Pay</th>
                                            <th className="p-4 font-medium text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm divide-y divide-gray-100/50 dark:divide-white/5 text-[#303030] dark:text-white">
                                        <tr className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-medium">Sarah Miller</td>
                                            <td className="p-4">80.0</td>
                                            <td className="p-4 text-gray-400">-</td>
                                            <td className="p-4">$2,400.00</td>
                                            <td className="p-4 text-red-400">-$450.00</td>
                                            <td className="p-4 text-right font-semibold">$1,950.00</td>
                                            <td className="p-4 text-center"><button className="text-gray-400 hover:text-[#303030] dark:hover:text-white"><iconify-icon icon="lucide:file-text" width="16"></iconify-icon></button></td>
                                        </tr>
                                        <tr className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-medium">Marcus Chen</td>
                                            <td className="p-4">80.0</td>
                                            <td className="p-4 text-[#303030] dark:text-white">5.5</td>
                                            <td className="p-4">$2,850.00</td>
                                            <td className="p-4 text-red-400">-$520.00</td>
                                            <td className="p-4 text-right font-semibold">$2,330.00</td>
                                            <td className="p-4 text-center"><button className="text-gray-400 hover:text-[#303030] dark:hover:text-white"><iconify-icon icon="lucide:file-text" width="16"></iconify-icon></button></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: EMPLOYEE MANAGEMENT */}
                {activeTab === 'employees' && (
                    <div className="absolute inset-0 flex flex-col md:flex-row gap-6 pb-6 px-1 animate-in fade-in duration-300">

                        {/* List View */}
                        <div className="w-full md:w-1/3 bg-white/60 dark:bg-[#202020]/60 backdrop-blur-md rounded-[2rem] flex flex-col overflow-hidden border border-white/40 dark:border-white/5 shadow-sm">
                            <div className="p-4 border-b border-gray-100 dark:border-white/5">
                                <input type="text" placeholder="Search staff..." className="w-full px-4 py-2 rounded-xl bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-white/10 text-sm outline-none focus:ring-2 focus:ring-[#303030]/10 dark:text-white transition-all" />
                            </div>
                            <div className="overflow-y-auto flex-1 p-2 space-y-2">
                                {/* Item Active */}
                                <div className="p-3 rounded-xl bg-white dark:bg-[#303030] shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-3 cursor-pointer">
                                    <img src="https://i.pravatar.cc/150?u=1" className="w-10 h-10 rounded-full object-cover" alt="User" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-[#303030] dark:text-white">Sarah Miller</h4>
                                        <p className="text-xs text-gray-500">Sous Chef</p>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                </div>
                                {/* Item */}
                                <div className="p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 border border-transparent hover:border-white/50 dark:hover:border-white/10 flex items-center gap-3 cursor-pointer transition-colors">
                                    <img src="https://i.pravatar.cc/150?u=4" className="w-10 h-10 rounded-full object-cover" alt="User" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-[#303030] dark:text-white">Marcus Chen</h4>
                                        <p className="text-xs text-gray-500">Line Cook</p>
                                    </div>
                                </div>
                                {/* Item */}
                                <div className="p-3 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 border border-transparent hover:border-white/50 dark:hover:border-white/10 flex items-center gap-3 cursor-pointer transition-colors">
                                    <img src="https://i.pravatar.cc/150?u=12" className="w-10 h-10 rounded-full object-cover" alt="User" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-[#303030] dark:text-white">Alex Doe</h4>
                                        <p className="text-xs text-gray-500">Waiter</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detail View */}
                        <div className="flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar">

                            {/* Digital ID Card Section */}
                            <div className="bg-white/60 dark:bg-[#202020]/60 backdrop-blur-md rounded-[2rem] p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start relative overflow-hidden border border-white/40 dark:border-white/5 shadow-sm">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <iconify-icon icon="lucide:nfc" width="128"></iconify-icon>
                                </div>

                                {/* Visual ID Card */}
                                <div className="w-64 h-40 rounded-2xl bg-gradient-to-br from-[#303030] to-[#1a1a1a] shadow-2xl p-4 flex flex-col justify-between text-white relative group shrink-0 transform transition-transform hover:scale-105 duration-500">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                            <span className="text-[10px] uppercase tracking-widest opacity-70">Active Access</span>
                                        </div>
                                        <iconify-icon icon="lucide:wifi" width="20" className="opacity-50 transform rotate-90"></iconify-icon>
                                    </div>
                                    <div className="flex gap-3 items-end">
                                        <img src="https://i.pravatar.cc/150?u=1" className="w-12 h-12 rounded-lg border-2 border-white/20" alt="Card User" />
                                        <div>
                                            <p className="text-sm font-medium">Sarah Miller</p>
                                            <p className="text-[10px] opacity-60">ID: 8821-990</p>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                                </div>

                                <div className="flex-1 w-full space-y-4 pt-2">
                                    <div className="flex justify-between">
                                        <h3 className="text-lg font-semibold text-[#303030] dark:text-white">NFC Configuration</h3>
                                        <button className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline">Unlink Card</button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Assigned Tag ID</label>
                                            <input type="text" value="e4:2a:5f:99" readOnly className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-white/10 text-sm font-mono text-[#303030] dark:text-white outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Access Level</label>
                                            <select className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-white/10 text-sm text-[#303030] dark:text-white outline-none">
                                                <option>Level 2 - Kitchen & Staff</option>
                                                <option>Level 1 - General</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Rate Configuration */}
                            <div className="bg-white/60 dark:bg-[#202020]/60 backdrop-blur-md rounded-[2rem] p-6 border border-white/40 dark:border-white/5 shadow-sm">
                                <h3 className="text-lg font-semibold text-[#303030] dark:text-white mb-4">Compensation & Rates</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Base Hourly Rate</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                                <input type="number" defaultValue="30.00" className="w-full pl-7 pr-4 py-3 rounded-xl bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-white/10 text-sm text-[#303030] dark:text-white outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Overtime Multiplier</label>
                                            <input type="number" defaultValue="1.5" step="0.1" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-white/10 text-sm text-[#303030] dark:text-white outline-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Pay Frequency</label>
                                            <select className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-white/10 text-sm text-[#303030] dark:text-white outline-none">
                                                <option>Bi-Weekly</option>
                                                <option>Weekly</option>
                                                <option>Monthly</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center justify-between pt-6">
                                            <span className="text-sm font-medium text-[#303030] dark:text-white">Auto-Deduct Break Time</span>
                                            {/* Simple Toggle for React */}
                                            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                                <input type="checkbox" name="toggle" id="toggle-break" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-300 transition-all duration-300 ease-in-out checked:right-0 checked:border-[#FCD34D]" />
                                                <label htmlFor="toggle-break" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button className="bg-[#303030] dark:bg-white text-white dark:text-[#303030] px-5 py-2 rounded-xl text-sm font-medium shadow-lg hover:bg-black dark:hover:bg-gray-200 transition-colors">Save Changes</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 4: NFC STATION SETTINGS */}
                {activeTab === 'stations' && (
                    <div className="absolute inset-0 overflow-y-auto no-scrollbar pb-6 px-1 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/* Station Card 1 */}
                            <div className="bg-white/60 dark:bg-[#202020]/60 backdrop-blur-md rounded-[2rem] p-6 flex flex-col gap-4 relative overflow-hidden border border-white/40 dark:border-white/5 shadow-sm">
                                <div className="flex justify-between items-start z-10">
                                    <div className="p-3 bg-white dark:bg-[#303030] rounded-xl shadow-sm">
                                        <iconify-icon icon="lucide:tablet" width="24" className="text-[#303030] dark:text-white"></iconify-icon>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        Online
                                    </span>
                                </div>
                                <div className="z-10">
                                    <h3 className="text-lg font-semibold text-[#303030] dark:text-white">Front Desk iPad</h3>
                                    <p className="text-sm text-gray-500">Device ID: FD-01</p>
                                </div>
                                <div className="z-10 pt-2 border-t border-gray-200/50 dark:border-white/5 flex justify-between items-center text-xs text-gray-500">
                                    <span>Last Sync: 1 min ago</span>
                                    <span>v2.4.0</span>
                                </div>
                                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-green-400/20 rounded-full blur-xl"></div>
                            </div>

                            {/* Station Card 2 */}
                            <div className="bg-white/60 dark:bg-[#202020]/60 backdrop-blur-md rounded-[2rem] p-6 flex flex-col gap-4 relative overflow-hidden border border-white/40 dark:border-white/5 shadow-sm">
                                <div className="flex justify-between items-start z-10">
                                    <div className="p-3 bg-white dark:bg-[#303030] rounded-xl shadow-sm">
                                        <iconify-icon icon="lucide:router" width="24" className="text-[#303030] dark:text-white"></iconify-icon>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        Online
                                    </span>
                                </div>
                                <div className="z-10">
                                    <h3 className="text-lg font-semibold text-[#303030] dark:text-white">Kitchen Wall Reader</h3>
                                    <p className="text-sm text-gray-500">Device ID: KT-04</p>
                                </div>
                                <div className="z-10 pt-2 border-t border-gray-200/50 dark:border-white/5 flex justify-between items-center text-xs text-gray-500">
                                    <span>Last Sync: Just now</span>
                                    <span>v2.4.1</span>
                                </div>
                                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-green-400/20 rounded-full blur-xl"></div>
                            </div>

                            {/* Station Card 3 (Offline) */}
                            <div className="bg-white/60 dark:bg-[#202020]/60 backdrop-blur-md rounded-[2rem] p-6 flex flex-col gap-4 relative overflow-hidden grayscale opacity-80 border border-white/40 dark:border-white/5 shadow-sm">
                                <div className="flex justify-between items-start z-10">
                                    <div className="p-3 bg-white dark:bg-[#303030] rounded-xl shadow-sm">
                                        <iconify-icon icon="lucide:tablet" width="24" className="text-[#303030] dark:text-white"></iconify-icon>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                                        Offline
                                    </span>
                                </div>
                                <div className="z-10">
                                    <h3 className="text-lg font-semibold text-[#303030] dark:text-white">Staff Room Backup</h3>
                                    <p className="text-sm text-gray-500">Device ID: SR-02</p>
                                </div>
                                <div className="z-10 pt-2 border-t border-gray-200/50 dark:border-white/5 flex justify-between items-center text-xs text-gray-500">
                                    <span>Last Sync: 2 days ago</span>
                                    <span>v2.1.0</span>
                                </div>
                            </div>

                            {/* Add New */}
                            <div className="bg-white/30 dark:bg-white/5 backdrop-blur-md rounded-[2rem] p-6 flex flex-col items-center justify-center gap-2 border-dashed border-2 border-gray-300/50 dark:border-white/20 hover:bg-white/50 dark:hover:bg-white/10 cursor-pointer min-h-[180px] transition-colors">
                                <div className="w-12 h-12 rounded-full bg-white/60 dark:bg-white/10 flex items-center justify-center text-gray-400">
                                    <iconify-icon icon="lucide:plus" width="24"></iconify-icon>
                                </div>
                                <span className="text-sm font-medium text-gray-500">Add New Reader</span>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
