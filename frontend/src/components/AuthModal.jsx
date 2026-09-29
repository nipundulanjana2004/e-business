import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Lock, Mail, User as UserIcon, Eye, EyeOff } from 'lucide-react';

export const AuthModal = () => {
  const { isAuthOpen, setIsAuthOpen, handleLogin, handleRegister } = useShop();
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdError, setPwdError] = useState('');

  if (!isAuthOpen) return null;

  const switchMode = (m) => {
    setMode(m);
    setPwdError('');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPwdError('');
    if (mode === 'register') {
      if (formData.password.length < 6) { setPwdError('Password must be at least 6 characters.'); return; }
      if (formData.password !== formData.confirmPassword) { setPwdError('Passwords do not match.'); return; }
    }
    setLoading(true);
    if (mode === 'login') {
      await handleLogin(formData.email, formData.password);
    } else {
      await handleRegister(formData.name, formData.email, formData.password);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-md border border-neutral-200 shadow-2xl overflow-hidden my-8">

        <div className="p-6 border-b border-neutral-200 bg-[#0e0f12] text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-amber-400 block">DRESSFEAT Atelier</span>
            <h2 className="text-lg font-bold uppercase tracking-wide">
              {mode === 'login' ? 'Patron Sign In' : 'Create Vanguard Account'}
            </h2>
          </div>
          <button onClick={() => setIsAuthOpen(false)} className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 text-center text-xs font-bold uppercase tracking-wider border-b border-neutral-200">
          <button onClick={() => switchMode('login')} className={`py-3 border-b-2 ${mode === 'login' ? 'border-black text-black bg-white' : 'border-transparent text-neutral-400 bg-neutral-50'}`}>Sign In</button>
          <button onClick={() => switchMode('register')} className={`py-3 border-b-2 ${mode === 'register' ? 'border-black text-black bg-white' : 'border-transparent text-neutral-400 bg-neutral-50'}`}>Register</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Full Name</label>
              <div className="relative">
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Sophia Laurent" required
                  className="w-full px-3 py-2.5 bg-white border border-neutral-300 focus:outline-none focus:border-black" />
                <UserIcon className="w-4 h-4 text-neutral-400 absolute right-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Email Address</label>
            <div className="relative">
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="patron@example.com" required
                className="w-full px-3 py-2.5 bg-white border border-neutral-300 focus:outline-none focus:border-black" />
              <Mail className="w-4 h-4 text-neutral-400 absolute right-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Password</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min 6 characters" required
                className="w-full px-3 py-2.5 pr-10 bg-white border border-neutral-300 focus:outline-none focus:border-black" />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} value={formData.confirmPassword}
                  onChange={(e) => { setFormData({ ...formData, confirmPassword: e.target.value }); setPwdError(''); }}
                  placeholder="Re-enter your password" required
                  className={`w-full px-3 py-2.5 pr-10 bg-white border focus:outline-none ${pwdError ? 'border-red-500' : 'border-neutral-300 focus:border-black'}`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.confirmPassword && !pwdError && formData.password === formData.confirmPassword && (
                <p className="text-green-600 text-[10px] mt-1 font-medium">Passwords match</p>
              )}
            </div>
          )}

          {pwdError && (
            <div className="bg-red-50 border border-red-200 px-3 py-2 text-red-700 text-[11px] font-medium">{pwdError}</div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-black text-white font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors disabled:opacity-50 mt-2">
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Atelier' : 'Create Account'}
          </button>

          {mode === 'login' ? (
            <p className="text-center text-neutral-500 pt-1">
              New to DRESSFEAT?{' '}
              <button type="button" onClick={() => switchMode('register')} className="text-black font-bold hover:underline">
                Create an account &rarr;
              </button>
            </p>
          ) : (
            <p className="text-center text-neutral-500 pt-1">
              Already a patron?{' '}
              <button type="button" onClick={() => switchMode('login')} className="text-black font-bold hover:underline">
                Sign In &rarr;
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
