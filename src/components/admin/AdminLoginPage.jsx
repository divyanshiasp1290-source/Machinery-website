import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage({ onLoginSuccess, onNavigateStore }) {
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await adminLogin(email, password);
      if (onLoginSuccess) {
        onLoginSuccess(res.admin);
      }
    } catch (err) {
      setError(err.message || 'Administrative login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-left relative overflow-hidden">
      {/* Background Subtle Gradient Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-900 border border-surface-800 text-brand-500 shadow-xl mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
            SOFT <span className="text-brand-500 font-extrabold">3D</span> Management Console
          </h2>
          <p className="mt-1 text-xs text-surface-400 font-medium">
            SOFT 3D Spółka z o.o. • Administration Portal
          </p>
        </div>

        <div className="bg-surface-900/90 border border-surface-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-md">
          {error && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-200 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-surface-300 mb-1">Administrative Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-surface-500 absolute left-3 top-3" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@soft3d.pl"
                  className="w-full pl-9 pr-3 py-2.5 bg-surface-950 border border-surface-800 rounded-xl text-white placeholder:text-surface-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-surface-300 mb-1">Passphrase</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-surface-500 absolute left-3 top-3" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-surface-950 border border-surface-800 rounded-xl text-white placeholder:text-surface-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 cursor-pointer p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Access Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-surface-800/80 flex items-center justify-between text-[11px] text-surface-400">
            <span>Customer account?</span>
            <button
              type="button"
              onClick={onNavigateStore}
              className="font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
