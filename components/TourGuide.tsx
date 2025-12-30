import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../AppContext';
import { TOUR_STEPS } from '../constants';

export const TourGuide = () => {
    const { isTourActive, currentStepIndex, nextStep, prevStep, endTour, setView, setBuilder, resetBuilder, selectFirstRecipe, selectedRecipeId, loadRecipeToBuilder, getTourElement } = useApp();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isFirstHighlight, setIsFirstHighlight] = useState(true);
    const prevStepRef = useRef(currentStepIndex);

    const step = TOUR_STEPS[currentStepIndex];

    // Effect: Handle View Switching & Actions & Element Finding
    useEffect(() => {
        if (!isTourActive || !step) return;

        // Track if step changed
        const stepChanged = prevStepRef.current !== currentStepIndex;
        prevStepRef.current = currentStepIndex;

        // Only run view/action changes when step actually changes
        if (stepChanged) {
            setIsSearching(true);

            // 1. Switch View
            if (step.view) {
                setView(step.view);
            }

            // 2. Execute Action
            if (step.action === 'resetBuilder') {
                resetBuilder();
            } else if (step.action === 'openBuilder') {
                if (selectedRecipeId) {
                    loadRecipeToBuilder(selectedRecipeId);
                } else {
                    setBuilder(prev => ({ ...prev, showBuilder: true }));
                }
            } else if (step.action === 'selectFirstRecipe') {
                resetBuilder();
                selectFirstRecipe();
            }
        }

        // 3. Find Element with multiple strategies
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
                // Try multiple strategies to find the element
                let el: HTMLElement | null = null;

                // Strategy 1: Context registry (if available)
                if (getTourElement) {
                    el = getTourElement(step.targetId);
                }

                // Strategy 2: Direct getElementById
                if (!el) {
                    el = document.getElementById(step.targetId);
                }

                // Strategy 3: querySelector with ID selector
                if (!el) {
                    el = document.querySelector(`#${step.targetId}`) as HTMLElement;
                }

                // Strategy 4: querySelector with data attribute
                if (!el) {
                    el = document.querySelector(`[data-tour-id="${step.targetId}"]`) as HTMLElement;
                }

                console.log(`TourGuide: Searching for "${step.targetId}"`, el ? 'FOUND' : 'NOT FOUND', 'attempt:', attempts);

                if (el) {
                    const rect = el.getBoundingClientRect();
                    console.log(`TourGuide: Found "${step.targetId}"`, { width: rect.width, height: rect.height, top: rect.top });

                    // Check if element is visible and has dimensions
                    if (rect.width > 0 && rect.height > 0) {
                        clearInterval(intervalId);

                        // 1. Only scroll if element is not fully visible
                        const isMobileView = window.innerWidth < 640;
                        const viewportHeight = window.innerHeight;
                        const popoverHeight = isMobileView ? viewportHeight * 0.4 + 40 : 0; // 40vh + 20px margin
                        const isVisible = rect.top >= 60 && rect.bottom <= (viewportHeight - popoverHeight - 20);

                        if (!isVisible) {
                            el.scrollIntoView({ behavior: 'smooth', block: isMobileView ? 'start' : 'center' });
                        }

                        // 2. Start stability check (poll position until it stops moving)
                        let stableCount = 0;
                        let lastRect = rect;
                        let stabilityAttempts = 0;

                        console.log(`TourGuide: Starting stability check for "${step.targetId}"`);

                        const checkStability = setInterval(() => {
                            const currentRect = el.getBoundingClientRect();
                            const diffTop = Math.abs(currentRect.top - lastRect.top);
                            const diffLeft = Math.abs(currentRect.left - lastRect.left);

                            if (diffTop < 2 && diffLeft < 2) {
                                stableCount++;
                            } else {
                                stableCount = 0;
                                console.log(`TourGuide: Element moving... diffTop: ${diffTop}`);
                            }

                            lastRect = currentRect;
                            stabilityAttempts++;

                            if (stableCount >= 1 || stabilityAttempts > 10) {
                                clearInterval(checkStability);
                                console.log(`TourGuide: Position stable. Setting target.`);
                                setTargetRect(currentRect);
                                setTimeout(() => setIsFirstHighlight(false), 500);
                                setIsSearching(false);
                            }
                        }, 30);

                        return;
                    }
                }
                attempts++;
                // Give up after 5 seconds
                if (attempts > 100) {
                    clearInterval(intervalId);
                    setIsSearching(false);
                    // Keep old targetRect instead of clearing - better UX
                    console.warn(`TourGuide: Could not find element with id "${step.targetId}"`);
                }
            }, 50);
        };

        // Delay for actions - openBuilder needs more time for builder UI to render
        let delay = 0;
        if (step.action === 'openBuilder') {
            delay = 100;
        } else if (step.action) {
            delay = 100;
        }
        timeoutId = setTimeout(findElement, delay);

        return () => {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTourActive, currentStepIndex, step, setView, resetBuilder, setBuilder, selectFirstRecipe, selectedRecipeId, loadRecipeToBuilder]);

    if (!isTourActive || !step) return null;

    // Calculate Popover Position - RESPONSIVE
    const isCenter = step.position === 'center';
    const popoverStyle: React.CSSProperties = {};
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isMobile = screenWidth < 640;
    const popoverWidth = isMobile ? screenWidth - 32 : Math.min(400, screenWidth - 40);
    const popoverHeight = 280;
    const safeMargin = 16;

    if (isMobile) {
        popoverStyle.position = 'fixed';
        popoverStyle.bottom = 20;
        popoverStyle.left = safeMargin;
        popoverStyle.right = safeMargin;
        popoverStyle.width = 'auto';
        popoverStyle.maxHeight = '40vh';
    } else if (isCenter || !targetRect || (targetRect.width === 0 && targetRect.height === 0)) {
        popoverStyle.position = 'fixed';
        popoverStyle.top = Math.max(safeMargin, (screenHeight - popoverHeight) / 2);
        popoverStyle.left = Math.max(safeMargin, (screenWidth - popoverWidth) / 2);
        popoverStyle.width = popoverWidth;
    } else {
        const gap = 16;
        const clampLeft = (left: number) => Math.max(safeMargin, Math.min(screenWidth - popoverWidth - safeMargin, left));
        const clampTop = (top: number) => Math.max(safeMargin, Math.min(screenHeight - popoverHeight - safeMargin, top));
        popoverStyle.width = popoverWidth;

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
            {/* Unified Overlay - SVG Mask */}
            <div className="absolute inset-0 pointer-events-auto">
                <svg className="w-full h-full text-black/60 dark:text-black/80 fill-current">
                    <defs>
                        <mask id="tour-mask">
                            <rect x="0" y="0" width="100%" height="100%" fill="white" />
                            {!isCenter && targetRect && targetRect.width > 0 && (
                                <motion.rect
                                    initial={isFirstHighlight ? {
                                        x: targetRect.left - 8,
                                        y: targetRect.top - 8,
                                        width: targetRect.width + 16,
                                        height: targetRect.height + 16,
                                        opacity: 0
                                    } : false}
                                    animate={{
                                        x: targetRect.left - 8,
                                        y: targetRect.top - 8,
                                        width: targetRect.width + 16,
                                        height: targetRect.height + 16,
                                        opacity: 1
                                    }}
                                    transition={{
                                        duration: isFirstHighlight ? 0.3 : 0.35,
                                        delay: isFirstHighlight ? 0.3 : 0,
                                        ease: [0.4, 0, 0.2, 1]
                                    }}
                                    rx="12"
                                    fill="black"
                                />
                            )}
                        </mask>
                    </defs>
                    <rect x="0" y="0" width="100%" height="100%" mask="url(#tour-mask)" />
                </svg>

                {/* Highlight Ring */}
                {!isCenter && targetRect && targetRect.width > 0 && (
                    <motion.div
                        className="absolute border-2 border-[#FCD34D] rounded-xl shadow-[0_0_20px_rgba(252,211,77,0.5)] pointer-events-none"
                        initial={isFirstHighlight ? {
                            left: targetRect.left - 8,
                            top: targetRect.top - 8,
                            width: targetRect.width + 16,
                            height: targetRect.height + 16,
                            opacity: 0
                        } : false}
                        animate={{
                            left: targetRect.left - 8,
                            top: targetRect.top - 8,
                            width: targetRect.width + 16,
                            height: targetRect.height + 16,
                            opacity: 1
                        }}
                        transition={{
                            duration: isFirstHighlight ? 0.3 : 0.35,
                            delay: isFirstHighlight ? 0.3 : 0,
                            ease: [0.4, 0, 0.2, 1]
                        }}
                    />
                )}
            </div>

            {/* Popover Card */}
            <motion.div
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="absolute pointer-events-auto bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden flex flex-col max-w-[calc(100vw-32px)]"
                style={popoverStyle}
            >
                <div className="h-1.5 sm:h-2 bg-gradient-to-r from-[#FCD34D] to-orange-400 w-full" />
                <div className="p-4 sm:p-5 pb-5 sm:pb-6">
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                        <div className="w-10 h-10 rounded-full bg-[#FCD34D]/10 dark:bg-[#FCD34D]/20 flex items-center justify-center text-[#FCD34D]">
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

                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">{step.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4 sm:mb-6">
                        {step.content}
                    </p>

                    <div className="flex justify-between items-center">
                        <div className="flex gap-1">
                            {TOUR_STEPS.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentStepIndex ? 'bg-[#FCD34D]' : 'bg-gray-200 dark:bg-gray-700'}`}
                                />
                            ))}
                        </div>

                        <div className="flex gap-2 sm:gap-3">
                            {currentStepIndex > 0 && (
                                <button
                                    onClick={prevStep}
                                    className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                onClick={nextStep}
                                className="px-4 sm:px-5 py-2 sm:py-2.5 bg-[#FCD34D] hover:opacity-90 text-[#303030] text-xs sm:text-sm font-bold rounded-xl shadow-sm active:scale-95 transition-all"
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
