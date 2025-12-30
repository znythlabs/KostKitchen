/**
 * Authentication Security Utilities
 * Password validation, session management, and input sanitization
 */

// ============================================
// PASSWORD VALIDATION
// ============================================

export interface PasswordValidation {
    valid: boolean;
    score: number; // 0-4 strength score
    errors: string[];
}

export const validatePassword = (password: string): PasswordValidation => {
    const errors: string[] = [];
    let score = 0;

    if (password.length >= 8) {
        score++;
    } else {
        errors.push("At least 8 characters required");
    }

    if (/[A-Z]/.test(password)) {
        score++;
    } else {
        errors.push("One uppercase letter required");
    }

    if (/[a-z]/.test(password)) {
        score++;
    } else {
        errors.push("One lowercase letter required");
    }

    if (/[0-9]/.test(password)) {
        score++;
    } else {
        errors.push("One number required");
    }

    // Bonus for special characters (not required but increases score)
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        score = Math.min(score + 1, 4);
    }

    return {
        valid: errors.length === 0,
        score: Math.min(score, 4),
        errors
    };
};

export const getPasswordStrengthLabel = (score: number): { label: string; color: string } => {
    switch (score) {
        case 0:
        case 1:
            return { label: "Weak", color: "#ff3b30" };
        case 2:
            return { label: "Fair", color: "#ff9500" };
        case 3:
            return { label: "Good", color: "#34c759" };
        case 4:
            return { label: "Strong", color: "#FCD34D" };
        default:
            return { label: "Weak", color: "#ff3b30" };
    }
};

// ============================================
// SESSION MANAGEMENT
// ============================================

const SESSION_ACTIVITY_KEY = 'ck_last_activity';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export const updateSessionActivity = (): void => {
    localStorage.setItem(SESSION_ACTIVITY_KEY, Date.now().toString());
};

export const isSessionActive = (): boolean => {
    const lastActivity = localStorage.getItem(SESSION_ACTIVITY_KEY);
    if (!lastActivity) return true; // First visit, consider active

    const elapsed = Date.now() - parseInt(lastActivity, 10);
    return elapsed < SESSION_TIMEOUT_MS;
};

export const clearSession = (): void => {
    localStorage.removeItem(SESSION_ACTIVITY_KEY);
};

// ============================================
// INPUT SANITIZATION
// ============================================

/**
 * Sanitize string input to prevent XSS
 * Removes < and > characters, trims whitespace
 */
export const sanitizeInput = (input: string): string => {
    if (typeof input !== 'string') return '';
    return input.trim().replace(/[<>]/g, '');
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// ============================================
// RATE LIMITING (Client-side)
// ============================================

const RATE_LIMIT_KEY = 'ck_login_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface RateLimitData {
    attempts: number;
    lockoutUntil: number | null;
}

export const checkRateLimit = (): { allowed: boolean; remainingAttempts: number; lockoutSeconds: number } => {
    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const data: RateLimitData = stored ? JSON.parse(stored) : { attempts: 0, lockoutUntil: null };

    // Check if currently locked out
    if (data.lockoutUntil && Date.now() < data.lockoutUntil) {
        const lockoutSeconds = Math.ceil((data.lockoutUntil - Date.now()) / 1000);
        return { allowed: false, remainingAttempts: 0, lockoutSeconds };
    }

    // Reset if lockout expired
    if (data.lockoutUntil && Date.now() >= data.lockoutUntil) {
        localStorage.removeItem(RATE_LIMIT_KEY);
        return { allowed: true, remainingAttempts: MAX_ATTEMPTS, lockoutSeconds: 0 };
    }

    return {
        allowed: data.attempts < MAX_ATTEMPTS,
        remainingAttempts: MAX_ATTEMPTS - data.attempts,
        lockoutSeconds: 0
    };
};

export const recordLoginAttempt = (success: boolean): void => {
    if (success) {
        // Clear on successful login
        localStorage.removeItem(RATE_LIMIT_KEY);
        return;
    }

    const stored = localStorage.getItem(RATE_LIMIT_KEY);
    const data: RateLimitData = stored ? JSON.parse(stored) : { attempts: 0, lockoutUntil: null };

    data.attempts++;

    if (data.attempts >= MAX_ATTEMPTS) {
        data.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
    }

    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
};

export const resetRateLimit = (): void => {
    localStorage.removeItem(RATE_LIMIT_KEY);
};
