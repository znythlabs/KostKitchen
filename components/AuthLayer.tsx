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
        // Optional: Auto-switch back after delay? User might want to see the message.
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
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
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
    }
    setLoading(false);
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

  const getAccentColor = () => {
    switch (view) {
      case 'signup': return 'from-orange-500 via-red-500 to-pink-500';
      case 'forgot': return 'from-purple-500 via-indigo-500 to-blue-500';
      case 'verify': return 'from-green-400 via-emerald-500 to-teal-500';
      default: return 'from-blue-500 via-green-500 to-orange-500'; // Login
    }
  };

  const { title, sub } = getHeader();

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center p-6 transition">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 fade-enter relative overflow-hidden transition-all duration-300">

        {/* Dynamic Top Bar */}
        <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${getAccentColor()} transition-all duration-500`}></div>

        {/* Icon */}
        <div className="flex justify-center mb-6 mt-8">
          <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-lg transform -rotate-3 transition-transform hover:rotate-0">
            <iconify-icon icon={view === 'forgot' ? "lucide:key-round" : view === 'verify' ? "lucide:mail-check" : "lucide:chef-hat"} width="28"></iconify-icon>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6 px-8">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 transition-all">{title}</h1>
          <p className="text-sm text-gray-500 mt-2 transition-all">{sub}</p>
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="mx-8 mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-xs font-medium animate-pulse">
            <iconify-icon icon="lucide:alert-circle" width="16"></iconify-icon>
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mx-8 mb-4 p-3 bg-green-50 border border-green-100 rounded-xl flex items-center gap-2 text-green-600 text-xs font-medium">
            <iconify-icon icon="lucide:check-circle" width="16"></iconify-icon>
            {successMsg}
          </div>
        )}

        <div className="px-8 pb-8 space-y-4">

          {/* Form Fields */}
          {view !== 'verify' && (
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide ml-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="ios-input w-full mt-2 px-4 py-3 text-sm font-medium border border-gray-100 hover:border-gray-200 bg-gray-50 text-gray-900 focus:bg-white transition-all"
                placeholder="name@company.com"
                disabled={loading}
              />
            </div>
          )}

          {(view === 'login' || view === 'signup') && (
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide ml-1">Password</label>
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="ios-input w-full px-4 py-3 text-sm font-medium border border-gray-100 hover:border-gray-200 bg-gray-50 text-gray-900 focus:bg-white pr-10 transition-all"
                  placeholder="••••••••"
                  disabled={loading || rateLimited}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <iconify-icon icon={showPassword ? "lucide:eye-off" : "lucide:eye"} width="18"></iconify-icon>
                </button>
              </div>

              {/* Password Strength Indicator (Signup only) */}
              {view === 'signup' && password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${passwordValidation.score >= level
                          ? level <= 1 ? 'bg-red-500'
                            : level <= 2 ? 'bg-orange-500'
                              : level <= 3 ? 'bg-green-500'
                                : 'bg-blue-500'
                          : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span
                      className="text-xs font-medium"
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
              className={`w-full text-white font-medium py-3.5 rounded-xl shadow-lg active-scale hover:opacity-90 transition-all mt-4 text-sm flex items-center justify-center gap-2 disabled:opacity-50 ${view === 'signup' ? 'bg-orange-600 shadow-orange-200' : 'bg-gray-900 shadow-gray-200'}`}
            >
              <span>
                {loading ? 'Processing...' :
                  view === 'login' ? 'Secure Sign In' :
                    view === 'signup' ? 'Create Account' :
                      'Send Reset Link'}
              </span>
              {!loading && <iconify-icon icon="lucide:arrow-right" width="16"></iconify-icon>}
            </button>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || loading}
                className="w-full relative overflow-hidden bg-white text-gray-900 border border-gray-200 font-medium py-3.5 rounded-xl hover:bg-gray-50 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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
                className="w-full bg-gray-900 text-white font-medium py-3.5 rounded-xl shadow-lg shadow-gray-200 active-scale hover:bg-black transition-all text-sm"
              >
                Back to Login
              </button>

              <div className="mt-6 text-xs text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100 text-left">
                <p className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <iconify-icon icon="lucide:info" width="14"></iconify-icon>
                  Troubleshooting Delivery
                </p>
                <ul className="list-disc pl-4 space-y-1.5 opacity-80">
                  <li>Check your <strong>Spam/Junk</strong> folder.</li>
                  <li><strong>Supabase Free Tier Limit:</strong> 3 emails per hour max.</li>
                  <li><strong>Localhost:</strong> Ensure <code>http://localhost:5173</code> is added to <em>Redirect URLs</em> in Supabase Dashboard.</li>
                  <li>For development, you can disable <em>"Confirm Email"</em> in Supabase Auth settings to skip this.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Footer Links */}
          <div className="flex flex-col gap-3 text-center mt-6">
            {view === 'login' && (
              <>
                <button onClick={() => switchView('signup')} className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
                  Need an account? <span className="font-semibold underline">Sign Up</span>
                </button>
                <button onClick={() => switchView('forgot')} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  Forgot Password?
                </button>
              </>
            )}

            {view === 'signup' && (
              <button onClick={() => switchView('login')} className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
                Already have an account? <span className="font-semibold underline">Sign In</span>
              </button>
            )}

            {view === 'forgot' && (
              <button onClick={() => switchView('login')} className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
                Remember your password? <span className="font-semibold underline">Sign In</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};