import { useApp } from '../AppContext';
import { motion, AnimatePresence } from 'framer-motion';

export const LoadingToast = () => {
    const { isLoading } = useApp();

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                >
                    <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-900/95 dark:bg-white/95 text-white dark:text-gray-900 rounded-2xl shadow-2xl backdrop-blur-lg border border-white/10 dark:border-gray-200/20">
                        {/* Spinner */}
                        <div className="w-5 h-5 relative">
                            <div className="absolute inset-0 border-2 border-white/20 dark:border-gray-900/20 rounded-full"></div>
                            <div className="absolute inset-0 border-2 border-transparent border-t-[#007AFF] rounded-full animate-spin"></div>
                        </div>
                        <span className="text-sm font-semibold">Loading data...</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
