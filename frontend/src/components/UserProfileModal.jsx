import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  X, User, Mail, Lock, Phone, MapPin, Shield, CheckCircle2, 
  AlertCircle, Eye, EyeOff, KeyRound, LogOut, ArrowRight 
} from 'lucide-react';

export const UserProfileModal = () => {
  const { 
    isProfileOpen, 
    setIsProfileOpen, 
    user, 
    updateProfile, 
    handleLogout, 
    setIsAdminOpen,
    addToast 
  } = useShop();

  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'security'

  // Personal details state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status & loading
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
    setFeedback({ type: '', message: '' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }, [user, isProfileOpen]);

  if (!isProfileOpen || !user) return null;

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!name.trim() || !email.trim()) {
      setFeedback({ type: 'error', message: 'Name and email are required.' });
      return;
    }

    setLoadingDetails(true);
    const res = await updateProfile({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim()
    });
    setLoadingDetails(false);

    if (res.success) {
      setFeedback({ type: 'success', message: 'Personal details updated successfully.' });
    } else {
      setFeedback({ type: 'error', message: res.message || 'Failed to update details.' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!currentPassword) {
      setFeedback({ type: 'error', message: 'Please provide your current password.' });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setLoadingPassword(true);
    const res = await updateProfile({
      currentPassword,
      newPassword
    });
    setLoadingPassword(false);

    if (res.success) {
      setFeedback({ type: 'success', message: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setFeedback({ type: 'error', message: res.message || 'Failed to change password.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-2xl border border-neutral-200 shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-6 bg-[#0e0f12] text-white flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white font-bold text-lg">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-amber-400">
                  {user.role === 'admin' ? 'Atelier Administrator' : 'Vanguard Patron'}
                </span>
                {user.role === 'admin' && (
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider rounded">
                    Admin Privileges
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
                {user.name}
              </h2>
              <p className="text-xs text-neutral-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => setIsProfileOpen(false)}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 text-xs font-bold uppercase tracking-wider border-b border-neutral-200 bg-neutral-50">
          <button
            onClick={() => { setActiveTab('details'); setFeedback({ type: '', message: '' }); }}
            className={`py-3.5 px-4 text-center border-b-2 flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'details'
                ? 'border-black text-black bg-white shadow-sm'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile Details</span>
          </button>
          <button
            onClick={() => { setActiveTab('security'); setFeedback({ type: '', message: '' }); }}
            className={`py-3.5 px-4 text-center border-b-2 flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'security'
                ? 'border-black text-black bg-white shadow-sm'
                : 'border-transparent text-neutral-500 hover:text-black'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback.message && (
          <div className={`mx-6 mt-4 p-3.5 text-xs flex items-center space-x-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
        )}

        {/* Tab 1: Personal Details */}
        {activeTab === 'details' && (
          <form onSubmit={handleUpdateDetails} className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Sophia Laurent"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 focus:bg-white focus:outline-none focus:border-black transition-colors"
                  />
                  <User className="w-4 h-4 text-neutral-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="sophia@example.com"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 focus:bg-white focus:outline-none focus:border-black transition-colors"
                  />
                  <Mail className="w-4 h-4 text-neutral-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Contact Phone (Optional)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 focus:bg-white focus:outline-none focus:border-black transition-colors"
                  />
                  <Phone className="w-4 h-4 text-neutral-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Account Role
                </label>
                <div className="px-3.5 py-2.5 bg-neutral-100 border border-neutral-200 text-neutral-600 flex items-center justify-between font-semibold">
                  <span className="capitalize">{user.role}</span>
                  {user.role === 'admin' && (
                    <span className="text-[10px] text-amber-600 font-bold uppercase">Administrator</span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[11px] mb-1.5">
                Shipping / Delivery Address (Optional)
              </label>
              <div className="relative">
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address, Apartment, City, Postal Code"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 focus:bg-white focus:outline-none focus:border-black transition-colors resize-none"
                />
                <MapPin className="w-4 h-4 text-neutral-400 absolute right-3.5 top-3" />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
              <span className="text-[11px] text-neutral-400">
                Changes will take effect immediately across your session.
              </span>
              <button
                type="submit"
                disabled={loadingDetails}
                className="px-6 py-3 bg-black text-white font-bold uppercase tracking-[0.15em] hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {loadingDetails ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Change Password */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword} className="p-6 space-y-4 text-xs">
            <div className="bg-neutral-50 border border-neutral-200 p-4 mb-2">
              <h4 className="font-bold text-neutral-900 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-neutral-600" />
                <span>Security Guidelines</span>
              </h4>
              <p className="text-[11px] text-neutral-600 mt-1">
                Enter your current password to authenticate, then choose a secure new password of at least 6 characters.
              </p>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[11px] mb-1.5">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 focus:outline-none focus:border-black"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3.5 top-2.5 text-neutral-400 hover:text-black p-0.5"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[11px] mb-1.5">
                  New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Min. 6 characters"
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 focus:outline-none focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-2.5 text-neutral-400 hover:text-black p-0.5"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat new password"
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 focus:outline-none focus:border-black"
                  />
                  <Lock className="w-4 h-4 text-neutral-400 absolute right-3.5 top-3" />
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
              <span className="text-[11px] text-neutral-400">
                Ensure your new password is unique and memorable.
              </span>
              <button
                type="submit"
                disabled={loadingPassword}
                className="px-6 py-3 bg-black text-white font-bold uppercase tracking-[0.15em] hover:bg-neutral-800 transition-colors disabled:opacity-50"
              >
                {loadingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-neutral-100 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            {user.role === 'admin' && (
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  setIsAdminOpen(true);
                }}
                className="px-3.5 py-2 bg-neutral-900 hover:bg-black text-white font-bold uppercase tracking-wider flex items-center space-x-1.5 text-[11px] transition-colors"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Open Admin Atelier Panel</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            )}
          </div>

          <button
            onClick={() => {
              setIsProfileOpen(false);
              handleLogout();
            }}
            className="text-red-600 hover:text-red-800 font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5 px-3 py-2 border border-red-200 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};
