import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  className?: string;
  placeholder?: string;
  align?: 'left' | 'right' | 'center';
}

export const CustomSelect = ({ value, onChange, options, className = '', placeholder = 'Select', align = 'left' }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: undefined as number | undefined, bottom: undefined as number | undefined, left: 0, width: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = (e: Event) => {
      // Only close if scrolling the window/document, not the dropdown itself
      // e.target is typically Document for window scrolls
      if (isOpen && (e.target === document || e.target === window)) {
        setIsOpen(false);
      }
    };

    const handleResize = () => {
      if (isOpen) setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Remove capture phase to allow internal scrolling, but we need capture to detect window scroll if it doesn't bubble?
      // Actually 'scroll' on window fires at window. 
      // Using capture=true is fine as long as we filter by target.
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const toggleOpen = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const minWidth = Math.max(rect.width, 120);
      const estimatedHeight = 240; // Max height

      let top: number | undefined = rect.bottom + 4;
      let bottom: number | undefined = undefined;
      let left = rect.left;

      // Horizontal Collision Detection
      if (left + minWidth > viewportWidth - 10) {
        left = rect.right - minWidth;
        if (left < 10) left = viewportWidth - minWidth - 10;
      }

      // Vertical Collision Detection
      if (top + estimatedHeight > viewportHeight - 10) {
        // Flip upwards
        if (rect.top - estimatedHeight > 10) {
          top = undefined;
          bottom = viewportHeight - rect.top + 4; // 4px gap
        }
      }

      setCoords({
        top,
        bottom,
        left,
        width: rect.width
      });
    }
    setIsOpen(!isOpen);
  };

  // Ensure current value is in options for display
  const displayValue = value || placeholder;
  const uniqueOptions = Array.from(new Set([...options]));
  if (value && !uniqueOptions.includes(value)) {
    uniqueOptions.unshift(value);
  }

  return (
    <>
      <div
        ref={triggerRef}
        onClick={toggleOpen}
        className={`cursor-pointer select-none ${className}`}
      >
        <div className={`flex items-center justify-between w-full h-full ${!value ? 'text-gray-400' : ''}`}>
          <span className="truncate flex-1 text-inherit">{displayValue}</span>
          <iconify-icon icon="lucide:chevron-down" width="16" class={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></iconify-icon>
        </div>
      </div>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[9999] bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-[#38383A] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col"
          style={{
            top: coords.top !== undefined ? coords.top : 'auto',
            bottom: coords.bottom !== undefined ? coords.bottom : 'auto',
            left: coords.left,
            minWidth: Math.max(coords.width, 120), // Minimum width for readability
            maxHeight: '240px'
          }}
        >
          <div className="overflow-y-auto p-1 custom-scrollbar">
            {uniqueOptions.map((opt) => (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-sm rounded-lg cursor-pointer transition-colors flex items-center justify-between ${value === opt
                  ? 'bg-[#FCD34D]/10 text-[#FCD34D] font-bold'
                  : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
              >
                <span>{opt}</span>
                {value === opt && <iconify-icon icon="lucide:check" width="14"></iconify-icon>}
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
