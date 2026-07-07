import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Network, AlertCircle, ArrowRight } from 'lucide-react';

export default function Register({ onToggleAuth }) {
  const { register } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await register(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-violet-500/10 rounded-2xl flex items-center justify-center border border-violet-500/20 mb-3 text-violet-400">
            <Network className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold shimmer-text font-sans tracking-tight">Create Account</h1>
          <p className="text-slate-400 text-sm mt-1">Start mapping the world's knowledge</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2 text-red-200 text-sm mb-5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col">
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Email Address</label>
            <input type="email" required className="glass-input" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Password (Min 6 chars)</label>
            <input type="password" required className="glass-input" placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Confirm Password</label>
            <input type="password" required className="glass-input" placeholder="••••••••"
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2 h-11">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <><span>Sign Up</span><ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          Already have an account?{' '}
          <button onClick={onToggleAuth} className="text-violet-400 hover:text-violet-300 font-semibold focus:outline-none transition-colors">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
