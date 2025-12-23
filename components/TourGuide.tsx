import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../AppContext';
import { TOUR_STEPS } from '../constants';

export const TourGuide = () => {
    const { isTourActive, currentStepIndex, nextStep, prevStep, endTour, setView, setBuilder, resetBuilder, selectFirstRecipe } = useApp();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const prevStepRef = useRef(currentStepIndex);

    const step = TOUR_STEPS[currentStepIndex];

    // Effect: Handle View Switching & Actions & Element Finding
    useEffect(() => {
        if (!isTourActive || !step) return;

        // Track if step changed
        const stepChanged = prevStepRef.current !== currentStepIndex;
        prevStepRef.current = currentStepIndex;

        // Mark as searching (but don't hide the popover)
        if (stepChanged) {
            setIsSearching(true);
        }

        // 1. Switch View
        if (step.view) {
            setView(step.view);
        }

        // 2. Execute Action
        if (step.action === 'resetBuilder') {
            resetBuilder();
        } else if (step.action === 'openBuilder') {
            setBuilder(prev => ({ ...prev, showBuilder: true }));
        } else if (step.action === 'selectFirstRecipe') {
            resetBuilder();
            selectFirstRecipe();
        }

        // 3. Find Element
        let intervalId: NodeJS.Timeout;
        let timeoutId: NodeJS.Timeout;

        const findElement = () => {
            // Center position doesn't need element
            if (step.targetId === 'root' || step.position === 'center') {
                const width = window.innerWidth;
                const height = window.innerHeight;
                setTargetRect({ left: width / 2, top: height / 2, width: 0, height: 0, right: width / 2, bottom: height / 2 } as DOMRect);
                setIsSearching(false);
                return;
            }

            let attempts = 0;
            intervalId = setInterval(() => {
                const el = document.getElementById(step.targetId);
                console.log(`TourGuide: Searching for "${step.targetId}"`, el);

                if (el) {
                    const rect = el.getBoundingClientRect();
                    console.log(`TourGuide: Found "${step.targetId}"`, { width: rect.width, height: rect.height, top: rect.top });

                    // Check if element is visible and has dimensions
                    if (rect.width > 0 && rect.height > 0) {
                        clearInterval(intervalId);

                        // 1. Scroll first (instant for speed)
                        el.scrollIntoView({ behavior: 'auto', block: 'center' });

                        // 2. Start stability check (poll position until it stops moving)
                        let stableCount = 0;
                        let lastRect = rect;
                        let stabilityAttempts = 0;

                        console.log(`TourGuide: Starting stability check for "${step.targetId}"`);

                        const checkStability = setInterval(() => {
                            const currentRect = el.getBoundingClientRect();
                            // Check movement
                            const diffTop = Math.abs(currentRect.top - lastRect.top);
                            const diffLeft = Math.abs(currentRect.left - lastRect.left);

                            if (diffTop < 2 && diffLeft < 2) {
                                stableCount++;
                            } else {
                                stableCount = 0; // Reset if moving
                                console.log(`TourGuide: Element moving... diffTop: ${diffTop}`);
                            }

                            lastRect = currentRect;
                            stabilityAttempts++;

                            // If stable for 2 consecutive checks (approx 100ms) OR timeout (1s)
                            if (stableCount >= 2 || stabilityAttempts > 10) {
                                clearInterval(checkStability);
                                console.log(`TourGuide: Position stable. Setting target.`);
                                setTargetRect(currentRect);
                                setIsSearching(false);
                            }
                        }, 50);

                        return; // Stop outer interval
                    }
                }
                attempts++;
                // Give up after 5 seconds
                if (attempts > 100) {
                    clearInterval(intervalId);
                    setIsSearching(false);
                    console.warn(`TourGuide: Could not find element with id "${step.targetId}"`);
                }
            }, 50);
        };

        // Minimal delay for actions
        let delay = 0;
        if (step.action === 'openBuilder') {
            delay = 300; // Short delay for builder
        } else if (step.action) {
            delay = 100;
        }
        timeoutId = setTimeout(findElement, delay);

        return () => {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
        };
    }, [isTourActive, currentStepIndex, step, setView, resetBuilder, setBuilder, selectFirstRecipe]);

    if (!isTourActive || !step) return null;

    // Calculate Popover Position
    const isCenter = step.position === 'center';
    const popoverStyle: React.CSSProperties = {};
    const popoverWidth = 420;
    const popoverHeight = 300;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const safeMargin = 20;

    // Use center position if no target yet, or if it's a center step
    if (isCenter || !targetRect) {
        popoverStyle.position = 'fixed';
        popoverStyle.top = Math.max(safeMargin, (screenHeight - popoverHeight) / 2);
        popoverStyle.left = Math.max(safeMargin, (screenWidth - popoverWidth) / 2);
    } else {
        const gap = 16;
        const clampLeft = (left: number) => Math.max(safeMargin, Math.min(screenWidth - popoverWidth - safeMargin, left));
        const clampTop = (top: number) => Math.max(safeMargin, Math.min(screenHeight - popoverHeight - safeMargin, top));

        if (step.position === 'top') {
            popoverStyle.top = clampTop(targetRect.top - popoverHeight - gap);
            popoverStyle.left = clampLeft(targetRect.left + (targetRect.width / 2) - (popoverWidth / 2));
        } else if (step.position === 'bottom') {
            popoverStyle.top = clampTop(targetRect.bottom + gap);
            popoverStyle.left = clampLeft(targetRect.left + (targetRect.width / 2) - (popoverWidth / 2));
        } else if (step.position === 'left') {
            popoverStyle.left = clampLeft(targetRect.left - popoverWidth - gap);
            popoverStyle.top = clampTop(targetRect.top + (targetRect.height / 2) - (popoverHeight / 2));
        } else if (step.position === 'right') {
            popoverStyle.left = clampLeft(targetRect.right + gap);
            popoverStyle.top = clampTop(targetRect.top + (targetRect.height / 2) - (popoverHeight / 2));
        }
    }

    return (
        <div className="fixed inset-0 z-[100] overflow-visible pointer-events-none">
            {/* Backdrop with Hole */}
            {!isCenter && targetRect && (
                <div className="absolute inset-0 pointer-events-auto">
                    <svg className="w-full h-full text-black/60 dark:text-black/80 fill-current">
                        <defs>
                            <mask id="tour-mask">
                                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                                <motion.rect
                                    animate={{
                                        x: targetRect.left - 8,
                                        y: targetRect.top - 8,
                                        width: targetRect.width + 16,
                                        height: targetRect.height + 16
                                    }}
                                    transition={{ type: "spring", stiffness: 800, damping: 50 }}
                                    rx="12"
                                    fill="black"
                                />
                            </mask>
                        </defs>
                        <rect x="0" y="0" width="100%" height="100%" mask="url(#tour-mask)" />
                    </svg>

                    {/* Highlight Ring */}
                    <motion.div
                        className="absolute border-2 border-[#007AFF] rounded-xl shadow-[0_0_20px_rgba(0,122,255,0.5)] pointer-events-none"
                        animate={{
                            left: targetRect.left - 8,
                            top: targetRect.top - 8,
                            width: targetRect.width + 16,
                            height: targetRect.height + 16
                        }}
                        transition={{ type: "spring", stiffness: 800, damping: 50 }}
                    />
                </div>
            )}

            {/* Center backdrop */}
            {isCenter && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" />
            )}

            {/* Popover Card - Always visible */}
            <motion.div
                key={currentStepIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="absolute pointer-events-auto w-[420px] bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden flex flex-col"
                style={popoverStyle}
            >
                <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 w-full" />
                <div className="p-5 pb-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                            {isSearching ? (
                                <iconify-icon icon="lucide:loader-2" width="20" class="animate-spin"></iconify-icon>
                            ) : (
                                <iconify-icon icon="lucide:lightbulb" width="20"></iconify-icon>
                            )}
                        </div>
                        <button onClick={endTour} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <iconify-icon icon="lucide:x" width="16"></iconify-icon>
                        </button>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                        {step.content}
                    </p>

                    <div className="flex justify-between items-center">
                        <div className="flex gap-1">
                            {TOUR_STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentStepIndex ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                                />
                            ))}
                        </div>

                        <div className="flex gap-3">
                            {currentStepIndex > 0 && (
                                <button
                                    onClick={prevStep}
                                    className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                onClick={nextStep}
                                className="px-5 py-2.5 bg-[#007AFF] hover:bg-blue-600 text-white text-sm font-bold rounded-xl shadow-sm active:scale-95 transition-all"
                            >
                                {currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
