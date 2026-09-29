import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchProducts, fetchReviews, loginUser, registerUser, updateUserProfile } from '../services/api';
import { fallbackProducts, fallbackReviews } from '../data/fallbackData';
import { sendWelcomeEmail } from '../services/emailService';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Navigation & View State
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState(10000);
  const [sortBy, setSortBy] = useState('featured');

  // Modals & Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Cart & Wishlist
  const [cart, setCart] = useState(() => {
    try { const s = localStorage.getItem('dressfeat_cart'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [wishlist, setWishlist] = useState(() => {
    try { const s = localStorage.getItem('dressfeat_wishlist'); return s ? JSON.parse(s) : []; } catch { return []; }
  });

  // Auth
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem('dressfeat_user'); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('dressfeat_token') || '');

  // Promo
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Toasts
  const [toasts, setToasts] = useState([]);
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // Data loading
  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, revRes] = await Promise.all([fetchProducts(), fetchReviews()]);
      setProducts(prodRes && prodRes.success && Array.isArray(prodRes.products) && prodRes.products.length > 0 ? prodRes.products : fallbackProducts);
      setReviews(revRes && revRes.success && Array.isArray(revRes.reviews) && revRes.reviews.length > 0 ? revRes.reviews : fallbackReviews);
    } catch {
      setProducts(fallbackProducts);
      setReviews(fallbackReviews);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { localStorage.setItem('dressfeat_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('dressfeat_wishlist', JSON.stringify(wishlist)); }, [wishlist]);

  // Cart
  const addToCart = (product, size = null, color = null, qty = 1) => {
    const chosenSize = size || (product.sizes && product.sizes[0]) || 'M';
    const chosenColor = color || (product.colors && product.colors[0]?.name) || 'Standard';
    const cartItemId = `${product.id || product._id}-${chosenSize}-${chosenColor}`;
    setCart(prev => {
      const existing = prev.find(i => i.cartItemId === cartItemId);
      if (existing) return prev.map(i => i.cartItemId === cartItemId ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...product, productId: product.id || product._id, cartItemId, selectedSize: chosenSize, selectedColor: chosenColor, qty }];
    });
    addToast(`Added "${product.name}" (${chosenSize}) to your bag.`, 'success');
  };
  const removeFromCart = (cartItemId) => { setCart(prev => prev.filter(i => i.cartItemId !== cartItemId)); addToast('Item removed.', 'info'); };
  const updateCartQty = (cartItemId, delta) => setCart(prev => prev.map(i => i.cartItemId === cartItemId ? ({ ...i, qty: i.qty + delta }) : i).filter(i => i.qty > 0));
  const clearCart = () => setCart([]);

  // Wishlist
  const toggleWishlist = (product) => {
    const id = product.id || product._id;
    const exists = wishlist.some(i => (i.id || i._id) === id);
    if (exists) { setWishlist(prev => prev.filter(i => (i.id || i._id) !== id)); addToast(`Removed from wishlist.`, 'info'); }
    else { setWishlist(prev => [...prev, product]); addToast(`Saved "${product.name}" to wishlist.`, 'success'); }
  };
  const isInWishlist = (productId) => wishlist.some(i => (i.id || i._id) === productId);

  // Coupons
  const applyCoupon = (code) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'FEAT2026' || clean === 'DRESSFEAT15') { setDiscountPercent(15); setPromoCode(clean); addToast('15% discount applied!', 'success'); return true; }
    if (clean === 'VIP20') { setDiscountPercent(20); setPromoCode(clean); addToast('20% VIP discount applied!', 'success'); return true; }
    addToast('Invalid coupon. Try FEAT2026.', 'error'); return false;
  };
  const removeCoupon = () => { setDiscountPercent(0); setPromoCode(''); };

  // Calculations
  const cartSubtotal = cart.reduce((a, i) => a + i.price * i.qty, 0);
  const discountAmount = Math.round(cartSubtotal * (discountPercent / 100));
  const freeShippingThreshold = 6000;
  const shippingFee = cartSubtotal >= freeShippingThreshold || cartSubtotal === 0 ? 0 : 350;
  const cartTotal = cartSubtotal - discountAmount + shippingFee;
  const cartCount = cart.reduce((a, i) => a + i.qty, 0);

  // ─── Client-side user DB (GitHub Pages fallback) ──────────────────────────
  const getLocalUsers = () => {
    try {
      const raw = localStorage.getItem('dressfeat_users_db');
      if (raw) { const p = JSON.parse(raw); if (Array.isArray(p) && p.length > 0) return p; }
    } catch {}
    const defaults = [
      { id: 'usr_admin', name: 'Dressfeat Atelier Admin', email: 'admin@dressfeat.com', password: 'DressFeat@Admin2026', role: 'admin', phone: '+94 11 234 5678', address: 'Atelier Flagship, Colombo', avatar: null, createdAt: new Date().toISOString() },
      { id: 'usr_demo',  name: 'Sophia Laurent', email: 'sophia@example.com', password: 'password123', role: 'customer', phone: '+33 1 42 68 55 00', address: '45 Avenue Montaigne, Paris', avatar: null, createdAt: new Date().toISOString() }
    ];
    localStorage.setItem('dressfeat_users_db', JSON.stringify(defaults));
    return defaults;
  };
  const saveLocalUsers = (users) => localStorage.setItem('dressfeat_users_db', JSON.stringify(users));

  // ─── Login ────────────────────────────────────────────────────────────────
  const handleLogin = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    try {
      const data = await loginUser(cleanEmail, password);
      if (data && data.success) {
        const u = { ...data.user, avatar: data.user.avatar || null };
        setUser(u); setToken(data.token);
        localStorage.setItem('dressfeat_user', JSON.stringify(u));
        localStorage.setItem('dressfeat_token', data.token);
        setIsAuthOpen(false); addToast(`Welcome back, ${u.name}!`, 'success'); return { success: true };
      }
      if (data && data.status && data.status !== 404 && data.message) { addToast(data.message, 'error'); return { success: false }; }
    } catch {}
    const users = getLocalUsers();
    const matched = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
    if (matched) {
      const safeUser = { id: matched.id, name: matched.name, email: matched.email, role: matched.role, phone: matched.phone || '', address: matched.address || '', avatar: matched.avatar || null };
      const tok = 'token_' + Date.now();
      setUser(safeUser); setToken(tok);
      localStorage.setItem('dressfeat_user', JSON.stringify(safeUser));
      localStorage.setItem('dressfeat_token', tok);
      setIsAuthOpen(false); addToast(`Welcome back, ${matched.name}!`, 'success'); return { success: true };
    }
    addToast('Invalid email or password.', 'error'); return { success: false };
  };

  // ─── Register ─────────────────────────────────────────────────────────────
  const handleRegister = async (name, email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();
    try {
      const data = await registerUser(cleanName, cleanEmail, password);
      if (data && data.success) {
        const u = { ...data.user, avatar: null };
        setUser(u); setToken(data.token);
        localStorage.setItem('dressfeat_user', JSON.stringify(u));
        localStorage.setItem('dressfeat_token', data.token);
        setIsAuthOpen(false);
        addToast(`Account created! Welcome, ${u.name}.`, 'success');
        sendWelcomeEmail(u).catch(() => {});
        return { success: true };
      }
      if (data && data.status && data.status !== 404 && data.message) { addToast(data.message, 'error'); return { success: false }; }
    } catch {}
    const users = getLocalUsers();
    if (users.find(u => u.email.toLowerCase() === cleanEmail)) { addToast('Email already registered. Please sign in.', 'error'); return { success: false }; }
    const newUser = { id: 'usr_' + Date.now(), name: cleanName, email: cleanEmail, password, role: 'customer', phone: '', address: '', avatar: null, createdAt: new Date().toISOString() };
    users.push(newUser); saveLocalUsers(users);
    const safeUser = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, phone: '', address: '', avatar: null };
    const tok = 'token_' + Date.now();
    setUser(safeUser); setToken(tok);
    localStorage.setItem('dressfeat_user', JSON.stringify(safeUser));
    localStorage.setItem('dressfeat_token', tok);
    setIsAuthOpen(false);
    addToast(`Welcome to DRESSFEAT, ${safeUser.name}!`, 'success');
    sendWelcomeEmail(safeUser).catch(() => {});
    return { success: true };
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    setUser(null); setToken('');
    localStorage.removeItem('dressfeat_user');
    localStorage.removeItem('dressfeat_token');
    setIsAdminOpen(false); setIsProfileOpen(false);
    addToast('You have been logged out.', 'info');
  };

  // ─── Update Profile (avatar aware) ───────────────────────────────────────
  const updateProfile = async (formData) => {
    try {
      const res = await updateUserProfile(formData, token);
      if (res && res.success) {
        const updatedUser = { ...res.user, avatar: formData.avatar !== undefined ? formData.avatar : (user ? user.avatar : null) };
        setUser(updatedUser);
        if (res.token) { setToken(res.token); localStorage.setItem('dressfeat_token', res.token); }
        localStorage.setItem('dressfeat_user', JSON.stringify(updatedUser));
        addToast(res.message || 'Profile updated!', 'success');
        return { success: true };
      }
      if (res && res.status && res.status !== 404 && res.message) { addToast(res.message, 'error'); return { success: false, message: res.message }; }
    } catch {}

    if (!user) { addToast('You must be signed in.', 'error'); return { success: false }; }
    const users = getLocalUsers();
    const idx = users.findIndex(u => u.id === user.id || u.email.toLowerCase() === (user.email || '').toLowerCase());
    if (idx === -1) { addToast('User record not found.', 'error'); return { success: false }; }
    const rec = { ...users[idx] };

    // Password change
    if (formData.newPassword) {
      if (!formData.currentPassword) return { success: false, message: 'Current password required' };
      if (rec.password !== formData.currentPassword) { addToast('Current password is incorrect.', 'error'); return { success: false, message: 'Current password incorrect' }; }
      if (formData.newPassword.length < 6) return { success: false, message: 'Password too short' };
      rec.password = formData.newPassword;
    }

    // Email uniqueness
    if (formData.email && formData.email.toLowerCase() !== rec.email.toLowerCase()) {
      if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase() && u.id !== rec.id)) { addToast('Email already in use.', 'error'); return { success: false, message: 'Email in use' }; }
      rec.email = formData.email.toLowerCase();
    }

    if (formData.name) rec.name = formData.name;
    if (formData.phone !== undefined) rec.phone = formData.phone;
    if (formData.address !== undefined) rec.address = formData.address;
    if (formData.avatar !== undefined) rec.avatar = formData.avatar;

    users[idx] = rec;
    saveLocalUsers(users);
    const safeUser = { id: rec.id, name: rec.name, email: rec.email, role: rec.role, phone: rec.phone || '', address: rec.address || '', avatar: rec.avatar || null };
    setUser(safeUser);
    localStorage.setItem('dressfeat_user', JSON.stringify(safeUser));
    addToast('Profile updated successfully!', 'success');
    return { success: true };
  };

  return (
    <ShopContext.Provider value={{
      products, setProducts, reviews, loading, loadData,
      activeTab, setActiveTab, selectedCategory, setSelectedCategory,
      searchQuery, setSearchQuery, priceRange, setPriceRange, sortBy, setSortBy,
      isCartOpen, setIsCartOpen, isWishlistOpen, setIsWishlistOpen,
      isAuthOpen, setIsAuthOpen, isSearchOpen, setIsSearchOpen,
      isCheckoutOpen, setIsCheckoutOpen, isAdminOpen, setIsAdminOpen,
      isShopOpen, setIsShopOpen, isProfileOpen, setIsProfileOpen,
      isContactOpen, setIsContactOpen, isPolicyOpen, setIsPolicyOpen,
      isFaqOpen, setIsFaqOpen, selectedProduct, setSelectedProduct,
      cart, cartCount, addToCart, removeFromCart, updateCartQty, clearCart,
      wishlist, toggleWishlist, isInWishlist,
      promoCode, discountPercent, discountAmount, cartSubtotal,
      freeShippingThreshold, shippingFee, cartTotal,
      applyCoupon, removeCoupon,
      user, token, handleLogin, handleRegister, handleLogout, updateProfile,
      toasts, addToast, removeToast
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within ShopProvider');
  return context;
};
