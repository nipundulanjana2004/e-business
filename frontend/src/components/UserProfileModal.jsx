import React, { useState, useEffect, useRef } from 'react';
import { useShop } from '../context/ShopContext';
import {
  X, User, Mail, Phone, MapPin, Shield, CheckCircle2,
  AlertCircle, Eye, EyeOff, KeyRound, LogOut, ArrowRight, Camera
} from 'lucide-react';

export const UserProfileModal = () => {
  const { isProfileOpen, setIsProfileOpen, user, updateProfile, handleLogout, setIsAdminOpen, addToast } = useShop();
  const [activeTab, setActiveTab] = useState('details');
  const fileRef = useRef(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [pendingAvatar, setPendingAvatar] = useState(null);
  const [savingAvatar, setSavingAvatar] = useState(false);

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingPwd, setLoadingPwd] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setAvatarPreview(user.avatar || null);
      setPendingAvatar(null);
    }
    setFeedback({ type: '', message: '' });
    setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
  }, [user, isProfileOpen]);

  if (!isProfileOpen || !user) return null;

  const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleAvatarFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { addToast('Please select an image file.', 'error'); return; }
    if (file.size > 2 * 1024 * 1024) { addToast('Image must be smaller than 2 MB.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setAvatarPreview(ev.target.result); setPendingAvatar(ev.target.result); };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (!pendingAvatar) return;
    setSavingAvatar(true);
    const res = await updateProfile({ avatar: pendingAvatar });
    setSavingAvatar(false);
    if (res.success) { addToast('Profile photo updated!', 'success'); setPendingAvatar(null); }
    else addToast(res.message || 'Failed to save photo.', 'error');
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    if (!name.trim() || !email.trim()) { setFeedback({ type: 'error', message: 'Name and email are required.' }); return; }
    setLoadingDetails(true);
    const res = await updateProfile({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), address: address.trim() });
    setLoadingDetails(false);
    setFeedback(res.success ? { type: 'success', message: 'Profile updated successfully.' } : { type: 'error', message: res.message || 'Update failed.' });
  };

  const handleChangePwd = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });
    if (!currentPwd || !newPwd || !confirmPwd) { setFeedback({ type: 'error', message: 'All fields are required.' }); return; }
    if (newPwd.length < 6) { setFeedback({ type: 'error', message: 'New password must be at least 6 characters.' }); return; }
    if (newPwd !== confirmPwd) { setFeedback({ type: 'error', message: 'New passwords do not match.' }); return; }
    setLoadingPwd(true);
    const res = await updateProfile({ currentPassword: currentPwd, newPassword: newPwd });
    setLoadingPwd(false);
    if (res.success) { setCurrentPwd(''); setNewPwd(''); setConfirmPwd(''); setFeedback({ type: 'success', message: 'Password changed successfully.' }); }
    else setFeedback({ type: 'error', message: res.message || 'Password change failed.' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-lg border border-neutral-200 shadow-2xl overflow-hidden my-8">

        {/* Header with avatar */}
        <div className="p-6 border-b border-neutral-200 bg-[#0e0f12] text-white flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group flex-shrink-0">
              <div onClick={() => fileRef.current?.click()} className="w-14 h-14 rounded-full overflow-hidden cursor-pointer border-2 border-amber-400 hover:border-amber-300 transition-colors">
                {avatarPreview
                  ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-amber-400 flex items-center justify-center text-black font-bold text-lg">{initials}</div>}
              </div>
              <div onClick={() => fileRef.current?.click()} className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-amber-400 block">DRESSFEAT Atelier</span>
              <h2 className="text-base font-bold uppercase tracking-wide">{user.name}</h2>
              <p className="text-neutral-400 text-xs mt-0.5">{user.email}</p>
            </div>
          </div>
          <button onClick={() => setIsProfileOpen(false)} className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar save banner */}
        {pendingAvatar && (
          <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center justify-between gap-3">
            <span className="text-xs text-amber-800 font-medium">New photo selected — tap Save to apply.</span>
            <button onClick={handleSaveAvatar} disabled={savingAvatar} className="text-xs font-bold uppercase tracking-wider bg-amber-500 text-white px-3 py-1.5 hover:bg-amber-600 disabled:opacity-50">
              {savingAvatar ? 'Saving...' : 'Save Photo'}
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="grid grid-cols-2 text-center text-xs font-bold uppercase tracking-wider border-b border-neutral-200">
          <button onClick={() => { setActiveTab('details'); setFeedback({ type: '', message: '' }); }} className={`py-3 border-b-2 ${activeTab === 'details' ? 'border-black text-black bg-white' : 'border-transparent text-neutral-400 bg-neutral-50'}`}>
            <User className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />Profile Details
          </button>
          <button onClick={() => { setActiveTab('security'); setFeedback({ type: '', message: '' }); }} className={`py-3 border-b-2 ${activeTab === 'security' ? 'border-black text-black bg-white' : 'border-transparent text-neutral-400 bg-neutral-50'}`}>
            <KeyRound className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />Change Password
          </button>
        </div>

        {/* Feedback banner */}
        {feedback.message && (
          <div className={`px-5 py-2.5 flex items-center gap-2 text-xs font-medium border-b ${feedback.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {feedback.message}
          </div>
        )}

        {/* Profile Details */}
        {activeTab === 'details' && (
          <form onSubmit={handleUpdateDetails} className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: 'Full Name', val: name, set: setName, type: 'text', icon: <User className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-3" /> },
                { label: 'Email Address', val: email, set: setEmail, type: 'email', icon: <Mail className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-3" /> },
                { label: 'Phone Number', val: phone, set: setPhone, type: 'tel', icon: <Phone className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-3" />, placeholder: '+94 77 000 0000' },
                { label: 'Delivery Address', val: address, set: setAddress, type: 'text', icon: <MapPin className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-3" />, placeholder: '123 Main St, Colombo' },
              ].map(({ label, val, set, type, icon, placeholder }) => (
                <div key={label}>
                  <label className="block font-bold text-neutral-700 mb-1">{label}</label>
                  <div className="relative">
                    <input type={type} value={val} onChange={e => set(e.target.value)} placeholder={placeholder || ''}
                      required={label === 'Full Name' || label === 'Email Address'}
                      className="w-full px-3 py-2.5 pr-9 bg-white border border-neutral-300 focus:outline-none focus:border-black" />
                    {icon}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-neutral-400 text-[10px]">Phone and address are auto-filled at checkout.</p>
            <button type="submit" disabled={loadingDetails} className="w-full py-3.5 bg-black text-white font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 disabled:opacity-50">
              {loadingDetails ? 'Saving...' : 'Save Profile Details'}
            </button>
          </form>
        )}

        {/* Change Password */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangePwd} className="p-5 space-y-4 text-xs">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Current Password</label>
              <div className="relative">
                <input type={showCur ? 'text' : 'password'} value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="Your current password" required className="w-full px-3 py-2.5 pr-10 bg-white border border-neutral-300 focus:outline-none focus:border-black" />
                <button type="button" onClick={() => setShowCur(!showCur)} className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700">{showCur ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <div>
              <label className="block font-bold text-neutral-700 mb-1">New Password</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Min 6 characters" required className="w-full px-3 py-2.5 pr-10 bg-white border border-neutral-300 focus:outline-none focus:border-black" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700">{showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <input type={showNew ? 'text' : 'password'} value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="Re-enter new password" required className="w-full px-3 py-2.5 pr-10 bg-white border border-neutral-300 focus:outline-none focus:border-black" />
              </div>
            </div>
            <button type="submit" disabled={loadingPwd} className="w-full py-3.5 bg-black text-white font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 disabled:opacity-50">
              {loadingPwd ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="border-t border-neutral-200 px-5 py-3 bg-neutral-50 flex items-center justify-between gap-3">
          {user.role === 'admin' && (
            <button onClick={() => { setIsProfileOpen(false); setIsAdminOpen(true); }} className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 hover:text-black uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />Admin Panel<ArrowRight className="w-3 h-3" />
            </button>
          )}
          <div className="ml-auto">
            <button onClick={() => { handleLogout(); setIsProfileOpen(false); }} className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-wider">
              <LogOut className="w-3.5 h-3.5" />Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
