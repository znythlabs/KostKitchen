import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { supabase } from '../lib/supabase';
import {
  validatePassword,
  getPasswordStrengthLabel,
  checkRateLimit,
  recordLoginAttempt,
  isValidEmail,
  sanitizeInput
} from '../lib/auth-utils';

type AuthView = 'login' | 'signup' | 'forgot' | 'verify';

export const AuthLayer = () => {
  const { login } = useApp();
  const [view, setView] = useState<AuthView>('login');

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState<{ valid: boolean; score: number; errors: string[] }>({ valid: false, score: 0, errors: [] });

  // Rate limiting state
  const [rateLimited, setRateLimited] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Resend Timer State
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let interval: any;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  // Lockout countdown
  useEffect(() => {
    let interval: any;
    if (lockoutSeconds > 0) {
      interval = setInterval(() => {
        setLockoutSeconds((prev) => {
          if (prev <= 1) {
            setRateLimited(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  // Password validation on change (signup only)
  useEffect(() => {
    if (view === 'signup' && password) {
      setPasswordValidation(validatePassword(password));
    } else {
      setPasswordValidation({ valid: false, score: 0, errors: [] });
    }
  }, [password, view]);

  const clearMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const switchView = (v: AuthView) => {
    clearMessages();
    setView(v);
  };

  const handleAuth = async () => {
    clearMessages();

    // --- FORGOT PASSWORD ---
    if (view === 'forgot') {
      if (!email.trim()) { setErrorMsg("Please enter your email."); return; }
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      setLoading(false);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg("Password reset link sent to your email.");
      }
      return;
    }

    // --- VERIFY (Manual Check / Back to Login) ---
    if (view === 'verify') {
      switchView('login');
      return;
    }

    // --- LOGIN / SIGNUP ---
    const cleanEmail = sanitizeInput(email);

    if (cleanEmail.length === 0 || password.trim().length === 0) {
      setErrorMsg("Please enter email and password.");
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    // Check rate limit for login
    if (view === 'login') {
      const rateCheck = checkRateLimit();
      if (!rateCheck.allowed) {
        setRateLimited(true);
        setLockoutSeconds(rateCheck.lockoutSeconds);
        setErrorMsg(`Too many failed attempts. Try again in ${Math.ceil(rateCheck.lockoutSeconds / 60)} minutes.`);
        return;
      }
    }

    // Validate password strength for signup
    if (view === 'signup' && !passwordValidation.valid) {
      setErrorMsg("Password doesn't meet requirements.");
      return;
    }

    setLoading(true);

    if (view === 'signup') {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin }
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        setErrorMsg("This email is already registered. Try logging in.");
      } else {
        // Successful Signup -> Go to Verify
        setView('verify');
        setCooldown(60);
      }
    } else {
      // Login
      try {
        const { error } = await Promise.race([
          supabase.auth.signInWithPassword({ email: cleanEmail, password }),
          new Promise<{ error: any }>((_, reject) => setTimeout(() => reject(new Error('Login timed out. Please check connection.')), 15000))
        ]);

        if (error) {
          recordLoginAttempt(false); // Track failed attempt
          if (error.message.includes("Email not confirmed")) {
            setView('verify');
            setErrorMsg("Email not verified. Please check your inbox.");
            setCooldown(0); // Allow immediate resend if needed
          } else {
            setErrorMsg(error.message);
          }
        } else {
          recordLoginAttempt(true); // Clear rate limit on success
          login();
        }
      } catch (err: any) {
        setErrorMsg(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    clearMessages();
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: { emailRedirectTo: window.location.origin }
    });
    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg("Verification email resent!");
      setCooldown(60);
    }
  };

  // UI Helpers
  const getHeader = () => {
    switch (view) {
      case 'signup': return { title: 'Create Account', sub: 'Start your culinary journey' };
      case 'forgot': return { title: 'Reset Password', sub: 'We will send you a recovery link' };
      case 'verify': return { title: 'Verify Email', sub: `We sent a link to ${email}` };
      default: return { title: 'Admin Portal', sub: 'Enter credentials to access dashboard' };
    }
  };

  const { title, sub } = getHeader();

  return (
    <div className="fixed inset-0 z-50 bg-[#E3E5E6] dark:bg-[#09090B] flex items-center justify-center p-6 transition font-sans overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-[#FCD34D] rounded-full mix-blend-multiply dark:mix-blend-normal dark:opacity-5 filter blur-[228px] opacity-10 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-white dark:bg-[#1A1A1A] rounded-full mix-blend-overlay dark:mix-blend-normal filter blur-[100px] opacity-40 dark:opacity-20"></div>
      </div>

      <div className="w-full max-w-md bg-white/70 dark:bg-[#1A1A1A]/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-white/10 relative overflow-hidden transition-all duration-300">

        <div className="flex justify-center mb-6 mt-10">
          <div className="w-16 h-16 rounded-2xl bg-[#FCD34D] text-[#303030] flex items-center justify-center shadow-lg transform -rotate-3 transition-transform hover:rotate-0 border border-white/50 dark:border-white/10">
            <iconify-icon icon={view === 'forgot' ? "lucide:key-round" : view === 'verify' ? "lucide:mail-check" : "lucide:chef-hat"} width="32"></iconify-icon>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8 px-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#303030] dark:text-white transition-all">{title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 transition-all font-medium">{sub}</p>
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="mx-8 mb-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-bold animate-pulse">
            <iconify-icon icon="lucide:alert-circle" width="16"></iconify-icon>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mx-8 mb-4 p-3 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-xl flex items-center gap-2 text-green-600 dark:text-green-400 text-xs font-bold">
            <iconify-icon icon="lucide:check-circle" width="16"></iconify-icon>
            {successMsg}
          </div>
        )}

        <div className="px-8 pb-10 space-y-5">

          {/* Form Fields */}
          {view !== 'verify' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-[#FCD34D]/50 focus:border-[#FCD34D] transition-all outline-none text-[#303030] dark:text-white placeholder-gray-400 text-sm font-medium"
                  placeholder="name@company.com"
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {(view === 'login' || view === 'signup') && (
            <div>
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1 mb-1.5 block">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-[#FCD34D]/50 focus:border-[#FCD34D] transition-all outline-none text-[#303030] dark:text-white placeholder-gray-400 text-sm font-medium pr-10"
                  placeholder="••••••••"
                  disabled={loading || rateLimited}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 transition-colors"
                >
                  <iconify-icon icon={showPassword ? "lucide:eye-off" : "lucide:eye"} width="18"></iconify-icon>
                </button>
              </div>

              {/* Password Strength Indicator (Signup only) */}
              {view === 'signup' && password && (
                <div className="mt-2.5">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${passwordValidation.score >= level
                          ? level <= 1 ? 'bg-red-500'
                            : level <= 2 ? 'bg-orange-500'
                              : level <= 3 ? 'bg-green-500'
                                : 'bg-[#FCD34D]'
                          : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className="text-xs font-bold"
                      style={{ color: getPasswordStrengthLabel(passwordValidation.score).color }}
                    >
                      {getPasswordStrengthLabel(passwordValidation.score).label}
                    </span>
                    {passwordValidation.errors.length > 0 && (
                      <span className="text-xs text-gray-400">
                        {passwordValidation.errors[0]}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          {view !== 'verify' ? (
            <button
              type="button"
              onClick={handleAuth}
              disabled={loading}
              className={`w-full text-[#303030] bg-[#FCD34D] font-bold py-4 rounded-xl shadow-lg shadow-orange-500/10 active:scale-95 hover:bg-[#fbbf24] transition-all mt-6 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span>
                {loading ? 'Processing...' :
                  view === 'login' ? 'Secure Sign In' :
                    view === 'signup' ? 'Create Account' :
                      'Send Reset Link'}
              </span>
              {!loading && <iconify-icon icon="lucide:arrow-right" width="18"></iconify-icon>}
            </button>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || loading}
                className="w-full relative overflow-hidden bg-white text-gray-900 border border-gray-200 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {/* Progress Bar Background */}
                {cooldown > 0 && (
                  <div
                    className="absolute top-0 left-0 h-full bg-gray-100 transition-all duration-1000 ease-linear"
                    style={{ width: `${(cooldown / 60) * 100}%`, zIndex: 0 }}
                  ></div>
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? 'Sending...' : cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend Verification Email'}
                  {cooldown === 0 && !loading && <iconify-icon icon="lucide:refresh-cw" width="16"></iconify-icon>}
                </span>
              </button>

              <button
                type="button"
                onClick={() => switchView('login')}
                className="w-full bg-[#303030] text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 hover:bg-black transition-all text-sm"
              >
                Back to Login
              </button>

              <div className="mt-6 text-xs text-gray-500 bg-white/50 p-4 rounded-xl border border-gray-200/50 text-left">
                <p className="font-bold text-[#303030] mb-2 flex items-center gap-2">
                  <iconify-icon icon="lucide:info" width="14"></iconify-icon>
                  Troubleshooting Delivery
                </p>
                <ul className="list-disc pl-4 space-y-1.5 opacity-80">
                  <li>Check your <strong>Spam/Junk</strong> folder.</li>
                  <li><strong>Supabase Free Tier Limit:</strong> 3 emails per hour max.</li>
                  <li><strong>Localhost:</strong> Ensure <code>http://localhost:5173</code> is added to <em>Redirect URLs</em> in Supabase Dashboard.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Footer Links */}
          <div className="flex flex-col gap-3 text-center mt-6 pt-4 border-t border-gray-100">
            {view === 'login' && (
              <>
                <button onClick={() => switchView('signup')} className="text-xs text-gray-500 dark:text-gray-400 hover:text-[#303030] dark:hover:text-white transition-colors">
                  Don't have an account? <span className="font-bold underline">Sign Up</span>
                </button>
                <button onClick={() => switchView('forgot')} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                  Forgot Password?
                </button>
              </>
            )}

            {view === 'signup' && (
              <button onClick={() => switchView('login')} className="text-xs text-gray-500 dark:text-gray-400 hover:text-[#303030] dark:hover:text-white transition-colors">
                Already have an account? <span className="font-bold underline">Sign In</span>
              </button>
            )}

            {view === 'forgot' && (
              <button onClick={() => switchView('login')} className="text-xs text-gray-500 dark:text-gray-400 hover:text-[#303030] dark:hover:text-white transition-colors">
                Remember your password? <span className="font-bold underline">Sign In</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};