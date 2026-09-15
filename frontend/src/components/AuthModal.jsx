import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { X, Lock, Mail, User as UserIcon } from 'lucide-react';

export const AuthModal = () => {
  const { isAuthOpen, setIsAuthOpen, handleLogin, handleRegister } = useShop();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  if (!isAuthOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 bg-[#0e0f12] text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-amber-400 block">
              DRESSFEAT Atelier
            </span>
            <h2 className="text-lg font-bold uppercase tracking-wide">
              {mode === 'login' ? 'Patron Sign In' : 'Create Vanguard Account'}
            </h2>
          </div>
          <button
            onClick={() => setIsAuthOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 text-center text-xs font-bold uppercase tracking-wider border-b border-neutral-200">
          <button
            onClick={() => setMode('login')}
            className={`py-3 border-b-2 ${mode === 'login' ? 'border-black text-black bg-white' : 'border-transparent text-neutral-400 bg-neutral-50'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`py-3 border-b-2 ${mode === 'register' ? 'border-black text-black bg-white' : 'border-transparent text-neutral-400 bg-neutral-50'}`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Sophia Laurent"
                  required
                  className="w-full px-3 py-2.5 bg-white border border-neutral-300 focus:outline-none focus:border-black"
                />
                <UserIcon className="w-4 h-4 text-neutral-400 absolute right-3 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="patron@example.com"
                required
                className="w-full px-3 py-2.5 bg-white border border-neutral-300 focus:outline-none focus:border-black"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute right-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 bg-white border border-neutral-300 focus:outline-none focus:border-black"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute right-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-black text-white font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to Atelier' : 'Create Account'}
          </button>
        </form>

      </div>
    </div>
  );
};
