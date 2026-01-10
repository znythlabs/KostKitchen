import { motion } from "framer-motion";
import React from "react";

interface Tab {
    id: string;
    label: string;
}

interface LiquidTabsProps {
    /** Array of tab objects with id and label */
    tabs: Tab[];
    /** Determine which tab is currently selected */
    activeId: string | null;
    /** Callback when a tab is clicked */
    onChange: (id: string | null) => void;
    /** Optional wrapper class for the container */
    className?: string;
    /** Unique ID for the animation group to avoid conflicts across multiple instances */
    layoutId?: string;
    /** Optional content to render at the end of the scroll container (e.g. Add (+) button) */
    rightAccessory?: React.ReactNode;
    /** Layout orientation */
    orientation?: "horizontal" | "vertical";
}

export function LiquidTabs({ tabs, activeId, onChange, className = "", layoutId = "active-tab-indicator", rightAccessory, orientation = "horizontal" }: LiquidTabsProps) {
    const isVertical = orientation === "vertical";

    return (
        <div className={`relative flex ${isVertical ? 'flex-col items-stretch' : 'flex-row items-center'} bg-[#F2F2F0] dark:bg-[#303030]/50 p-1 ${isVertical ? 'rounded-xl' : 'rounded-full'} border border-gray-200/50 dark:border-white/5 overflow-hidden ${className}`}>
            <div className={`flex-1 flex ${isVertical ? 'flex-col w-full overflow-y-auto no-scrollbar' : 'items-center overflow-x-auto no-scrollbar'} relative min-w-0`}>
                {tabs.map((tab) => {
                    const isActive = activeId === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id)}
                            className={`
                relative px-5 py-2 ${isVertical ? 'rounded-lg w-full text-left' : 'rounded-full whitespace-nowrap'} text-sm font-semibold transition-colors z-0 flex-shrink-0
                ${isActive
                                    ? "text-white dark:text-black"
                                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5"
                                }
              `}
                            style={{
                                WebkitTapHighlightColor: "transparent",
                            }}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId={layoutId}
                                    className={`absolute inset-0 bg-[#303030] dark:bg-white ${isVertical ? 'rounded-lg' : 'rounded-full'} -z-10 shadow-sm mix-blend-normal`}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            {tab.label}
                        </button>
                    );
                })}
            </div>
            {rightAccessory && (
                <div className={`flex-shrink-0 flex items-center ${isVertical ? 'pt-2 mt-1 border-t px-2 justify-center' : 'pl-2 pr-1 border-l ml-2'} border-gray-200 dark:border-white/10`}>
                    {rightAccessory}
                </div>
            )}
        </div>
    );
}
