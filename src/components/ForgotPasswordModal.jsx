import React, { useState } from 'react';
import { X, Mail, Lock, KeyRound, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';

export default function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }) {
  if (!isOpen) return null;

  const [step, setStep] = useState(1); // 1: request token, 2: submit new password
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.customerAuth.forgotPassword(email);
      setSuccess('Reset token generated.');
      if (res.resetToken) {
        setToken(res.resetToken);
      }
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to process request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.customerAuth.resetPassword({ token, newPassword });
      setSuccess('Your password has been reset successfully. You can now sign in.');
      setTimeout(() => {
        onClose();
        if (onBackToLogin) onBackToLogin();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-surface-200 overflow-hidden text-left animate-scale-up">
        
        {/* Header */}
        <div className="bg-surface-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-brand-500" />
            <h3 className="font-display text-base font-bold">Reset Password</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 text-xs">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestToken} className="space-y-4">
              <p className="text-surface-600 leading-relaxed">
                Enter your registered corporate or personal email address. We will generate a secure verification token to reset your password.
              </p>

              <div>
                <label className="block font-bold text-surface-800 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-surface-400 absolute left-3 top-3" />
                  <input
                    required
                    type="email"
                    placeholder="e.g. name@company.co.uk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-surface-300 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="flex items-center gap-1 text-surface-600 hover:text-surface-900 font-bold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-surface-900 hover:bg-brand-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Send Instructions'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block font-bold text-surface-800 mb-1">Verification Token</label>
                <input
                  required
                  type="text"
                  placeholder="Paste or enter the token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-3 py-2.5 border border-surface-300 rounded-xl font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-surface-800 mb-1">New Password (min. 6 characters)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-surface-400 absolute left-3 top-3" />
                  <input
                    required
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-surface-300 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? 'Updating Password...' : 'Save New Password & Sign In'}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
