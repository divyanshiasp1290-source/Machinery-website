import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  CheckCircle2, 
  AlertCircle,
  AlertTriangle,
  Clock,
  Info,
  RefreshCw,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CustomerAuthModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  onOpenForgotPassword,
  guestCart = [],
  guestWishlist = []
}) {
  const { customer, customerLogin, customerRegister } = useAuth();
  if (!isOpen || customer) return null;

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null); // { type: 'rate_limit' | 'existing_user', message: string }
  const [confirmationNotice, setConfirmationNotice] = useState(null); // { email: string }
  const [cooldown, setCooldown] = useState(0);
  const [successMsg, setSuccessMsg] = useState(null);

  // Active countdown timer when rate limited
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Login Form
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Register Form
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const clearAlerts = () => {
    setError(null);
    setErrorDetails(null);
    setConfirmationNotice(null);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    clearAlerts();
    setLoading(true);

    try {
      const res = await customerLogin(loginData.email, loginData.password, guestCart, guestWishlist);
      setSuccessMsg('Signed in successfully! Welcome back.');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
        if (onSuccess) onSuccess(res.user, false);
      }, 700);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    // Prevent duplicate calls if already submitting or if in rate-limit cooldown
    if (loading || cooldown > 0) return;
    clearAlerts();
    setLoading(true);

    try {
      const res = await customerRegister(registerData);
      
      // If Supabase has email confirmation enabled and session is not yet active
      if (res?.confirmationRequired) {
        setConfirmationNotice({ email: registerData.email });
        setLoading(false);
        return;
      }

      setSuccessMsg('Account created successfully! Welcome to SOFT 3D.');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
        if (onSuccess) onSuccess(res.user, true);
      }, 800);
    } catch (err) {
      const code = err.code || '';
      const msg = String(err.message || 'Failed to create account.');

      if (code === 'RATE_LIMIT_EXCEEDED' || msg.toLowerCase().includes('rate limit')) {
        setCooldown(60); // 60-second cooldown protection
        setErrorDetails({
          type: 'rate_limit',
          message: 'Supabase email limit reached. For security, Supabase limits how many verification emails can be sent per hour. Please wait before retrying, or sign in if you already created this account.'
        });
      } else if (code === 'USER_ALREADY_EXISTS' || msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('already registered')) {
        setErrorDetails({
          type: 'existing_user',
          message: 'An account with this email address already exists.'
        });
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-surface-200 overflow-hidden text-left animate-scale-up my-auto">
        
        {/* Header with Switcher */}
        <div className="bg-surface-900 px-5 py-3.5 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="font-display text-base font-black tracking-tight text-white">
                SOFT <span className="text-brand-500">3D</span>
              </span>
              <span className="text-[10px] uppercase font-bold text-surface-400 ml-1">Customer Portal</span>
            </div>
            <p className="text-[11px] text-surface-300">
              {mode === 'login' ? 'Access your orders, saved equipment and quotations' : 'Create an industrial manufacturing account'}
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 border-b border-surface-200 bg-surface-50 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => { setMode('login'); clearAlerts(); }}
            className={`py-2 text-center transition-colors border-b-2 cursor-pointer ${
              mode === 'login' 
                ? 'border-brand-500 text-brand-600 bg-white' 
                : 'border-transparent text-surface-500 hover:text-surface-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); clearAlerts(); }}
            className={`py-2 text-center transition-colors border-b-2 cursor-pointer ${
              mode === 'register' 
                ? 'border-brand-500 text-brand-600 bg-white' 
                : 'border-transparent text-surface-500 hover:text-surface-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5">
          {/* Rate Limit Exceeded Alert */}
          {errorDetails?.type === 'rate_limit' && (
            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900 text-xs">Email Rate Limit Exceeded</h4>
                  <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                    {errorDetails.message}
                  </p>
                  {cooldown > 0 && (
                    <div className="mt-1.5 inline-flex items-center gap-1.5 font-bold text-amber-800 text-[11px] bg-amber-100/70 px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3 text-amber-700 animate-pulse" />
                      <span>Cooldown active: Please wait {cooldown}s before retrying</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setLoginData(prev => ({ ...prev, email: registerData.email }));
                    clearAlerts();
                    setMode('login');
                  }}
                  className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                >
                  Sign In with this email
                </button>
              </div>
            </div>
          )}

          {/* Account Already Exists Alert */}
          {errorDetails?.type === 'existing_user' && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-2">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-blue-900 text-xs">Account Already Exists</h4>
                  <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                    An account with <strong className="font-bold text-blue-900">{registerData.email}</strong> is already registered. Please sign in with your password.
                  </p>
                </div>
              </div>
              <div className="pt-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setLoginData(prev => ({ ...prev, email: registerData.email }));
                    clearAlerts();
                    setMode('login');
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                >
                  Switch to Sign In
                </button>
              </div>
            </div>
          )}

          {/* Confirmation Email Required Notice */}
          {confirmationNotice && (
            <div className="mb-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-900 text-xs">Account Created! Verification Email Sent</h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                    An activation link has been sent to <strong className="font-bold text-emerald-900">{confirmationNotice.email}</strong>. Please check your inbox (and spam folder) to verify your account.
                  </p>
                </div>
              </div>
              <div className="pt-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setLoginData(prev => ({ ...prev, email: confirmationNotice.email }));
                    clearAlerts();
                    setMode('login');
                  }}
                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                >
                  Proceed to Sign In
                </button>
              </div>
            </div>
          )}

          {/* Standard Generic Error Alert */}
          {error && (
            <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-surface-800 text-[11px] mb-1">Corporate or Personal Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-surface-400 absolute left-3 top-2.5" />
                  <input
                    required
                    type="email"
                    placeholder="e.g. name@company.co.uk"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-surface-300 rounded-xl text-surface-900 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-bold text-surface-800 text-[11px]">Password</label>
                  {onOpenForgotPassword && (
                    <button
                      type="button"
                      onClick={onOpenForgotPassword}
                      className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-surface-400 absolute left-3 top-2.5" />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full pl-9 pr-10 py-2 border border-surface-300 rounded-xl text-surface-900 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-surface-400 hover:text-surface-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-surface-900 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-1">
                <span className="text-surface-500 text-[11px]">Don't have an account yet? </span>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-brand-600 font-bold hover:underline text-[11px] cursor-pointer"
                >
                  Create one here
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-surface-800 text-[11px] mb-0.5">First Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="John"
                    value={registerData.firstName}
                    onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-surface-300 rounded-lg text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-surface-800 text-[11px] mb-0.5">Last Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="Doe"
                    value={registerData.lastName}
                    onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-surface-300 rounded-lg text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-surface-800 text-[11px] mb-0.5">Email Address *</label>
                  <input
                    required
                    type="email"
                    placeholder="name@company.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-surface-300 rounded-lg text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-surface-800 text-[11px] mb-0.5">Password (min. 6) *</label>
                  <div className="relative">
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="w-full pl-2.5 pr-8 py-1.5 border border-surface-300 rounded-lg text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1.5 text-surface-400 hover:text-surface-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cooldown > 0}
                className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-1.5"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    <span>Please Wait ({cooldown}s)</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-0.5">
                <span className="text-surface-500 text-[11px]">Already registered? </span>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-brand-600 font-bold hover:underline text-[11px] cursor-pointer"
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
