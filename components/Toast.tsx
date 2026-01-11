import React from 'react';
import { useApp } from '../AppContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Toast = () => {
    const { toast } = useApp();

    return (
        <AnimatePresence>
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="fixed bottom-6 right-6 z-[60] pointer-events-none"
                >
                    <div className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl backdrop-blur-lg border font-medium ${toast.type === 'success'
                            ? 'bg-emerald-500 text-white border-emerald-400/20'
                            : toast.type === 'error'
                                ? 'bg-red-500 text-white border-red-400/20'
                                : 'bg-[#303030] text-white border-white/10'
                        }`}>
                        <div className="flex items-center justify-center bg-white/20 w-8 h-8 rounded-full">
                            <iconify-icon icon={
                                toast.type === 'success' ? 'lucide:check' :
                                    toast.type === 'error' ? 'lucide:alert-triangle' :
                                        'lucide:info'
                            } width="16"></iconify-icon>
                        </div>
                        <span className="text-sm">{toast.message}</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
