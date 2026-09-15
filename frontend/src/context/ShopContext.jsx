import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchProducts, fetchReviews, loginUser, registerUser, updateUserProfile } from '../services/api';
import { fallbackProducts, fallbackReviews } from '../data/fallbackData';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Navigation & View State
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'women' | 'men' | 'shop'
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

  // Cart & Wishlist with localStorage persistence
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('dressfeat_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('dressfeat_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User Auth State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('dressfeat_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('dressfeat_token') || '');

  // Promo Code
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Initial Load with automatic static fallback for GitHub Pages
  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, revRes] = await Promise.all([
        fetchProducts(),
        fetchReviews()
      ]);
      if (prodRes && prodRes.success && Array.isArray(prodRes.products) && prodRes.products.length > 0) {
        setProducts(prodRes.products);
      } else {
        setProducts(fallbackProducts);
      }

      if (revRes && revRes.success && Array.isArray(revRes.reviews) && revRes.reviews.length > 0) {
        setReviews(revRes.reviews);
      } else {
        setReviews(fallbackReviews);
      }
    } catch (err) {
      console.warn('Backend unavailable, using static catalog:', err);
      setProducts(fallbackProducts);
      setReviews(fallbackReviews);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('dressfeat_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('dressfeat_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Cart Operations
  const addToCart = (product, size = null, color = null, qty = 1) => {
    const chosenSize = size || (product.sizes && product.sizes[0]) || 'M';
    const chosenColor = color || (product.colors && product.colors[0]?.name) || 'Standard';
    const cartItemId = `${product.id || product._id}-${chosenSize}-${chosenColor}`;

    setCart(prev => {
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, qty: item.qty + qty }
            : item
        );
      } else {
        return [
          ...prev,
          {
            ...product,
            productId: product.id || product._id,
            cartItemId,
            selectedSize: chosenSize,
            selectedColor: chosenColor,
            qty
          }
        ];
      }
    });

    addToast(`Added "${product.name}" (${chosenSize}) to your bag.`, 'success');
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    addToast('Item removed from shopping bag.', 'info');
  };

  const updateCartQty = (cartItemId, delta) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist Operations
  const toggleWishlist = (product) => {
    const prodId = product.id || product._id;
    const exists = wishlist.some(item => (item.id || item._id) === prodId);

    if (exists) {
      setWishlist(prev => prev.filter(item => (item.id || item._id) !== prodId));
      addToast(`Removed "${product.name}" from wishlist.`, 'info');
    } else {
      setWishlist(prev => [...prev, product]);
      addToast(`Saved "${product.name}" to wishlist.`, 'success');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => (item.id || item._id) === productId);
  };

  // Coupon Voucher
  const applyCoupon = (code) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'FEAT2026' || clean === 'DRESSFEAT15') {
      setDiscountPercent(15);
      setPromoCode(clean);
      addToast('Promo code FEAT2026 applied! 15% discount unlocked.', 'success');
      return true;
    } else if (clean === 'VIP20') {
      setDiscountPercent(20);
      setPromoCode(clean);
      addToast('VIP voucher applied! 20% discount unlocked.', 'success');
      return true;
    } else {
      addToast('Invalid coupon code. Try FEAT2026 for 15% off.', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setDiscountPercent(0);
    setPromoCode('');
  };

  // Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const discountAmount = Math.round(cartSubtotal * (discountPercent / 100));
  const freeShippingThreshold = 6000;
  const shippingFee = cartSubtotal >= freeShippingThreshold || cartSubtotal === 0 ? 0 : 350;
  const cartTotal = cartSubtotal - discountAmount + shippingFee;
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  // Local persistent user repository (ensures registration, login & password updates work on GitHub Pages)
  const getLocalUsers = () => {
    try {
      const raw = localStorage.getItem('dressfeat_users_db');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    const defaultUsers = [
      {
        id: 'usr_admin',
        name: 'Dressfeat Atelier Admin',
        email: 'admin@dressfeat.com',
        password: 'DressFeat@Admin2026',
        role: 'admin',
        phone: '+94 11 234 5678',
        address: 'Atelier Flagship, Colombo',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr_demo',
        name: 'Sophia Laurent',
        email: 'sophia@example.com',
        password: 'password123',
        role: 'customer',
        phone: '+33 1 42 68 55 00',
        address: '45 Avenue Montaigne, Paris',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('dressfeat_users_db', JSON.stringify(defaultUsers));
    return defaultUsers;
  };

  const saveLocalUsers = (users) => {
    localStorage.setItem('dressfeat_users_db', JSON.stringify(users));
  };

  // Authentication: supports both live Node backend and static GitHub Pages
  const handleLogin = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();

    // 1. Try remote API first if backend server is online
    try {
      const data = await loginUser(cleanEmail, password);
      if (data && data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('dressfeat_user', JSON.stringify(data.user));
        localStorage.setItem('dressfeat_token', data.token);
        setIsAuthOpen(false);
        addToast(`Welcome back, ${data.user.name}!`, 'success');
        return { success: true };
      }
      if (data && data.status && data.status !== 404 && data.message) {
        addToast(data.message, 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.warn('Backend unavailable, using local client storage:', err);
    }

    // 2. Client-side persistent storage fallback (for GitHub Pages live site)
    const users = getLocalUsers();
    const matched = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
    if (matched) {
      const safeUser = {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        role: matched.role,
        phone: matched.phone || '',
        address: matched.address || ''
      };
      const localToken = 'token_' + Date.now();
      setUser(safeUser);
      setToken(localToken);
      localStorage.setItem('dressfeat_user', JSON.stringify(safeUser));
      localStorage.setItem('dressfeat_token', localToken);
      setIsAuthOpen(false);
      addToast(`Welcome back, ${matched.name}!`, 'success');
      return { success: true };
    }

    addToast('Invalid email or password. Please try again.', 'error');
    return { success: false, message: 'Invalid email or password' };
  };

  const handleRegister = async (name, email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();

    // 1. Try remote API first if backend server is online
    try {
      const data = await registerUser(cleanName, cleanEmail, password);
      if (data && data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('dressfeat_user', JSON.stringify(data.user));
        localStorage.setItem('dressfeat_token', data.token);
        setIsAuthOpen(false);
        addToast(`Account created! Welcome to DRESSFEAT, ${data.user.name}.`, 'success');
        return { success: true };
      }
      if (data && data.status && data.status !== 404 && data.message) {
        addToast(data.message, 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.warn('Backend unavailable, registering in local client storage:', err);
    }

    // 2. Client-side persistent storage fallback (for GitHub Pages live site)
    const users = getLocalUsers();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      addToast('Email is already registered. Please sign in.', 'error');
      return { success: false, message: 'Email is already registered' };
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      name: cleanName,
      email: cleanEmail,
      password: password,
      role: 'customer',
      phone: '',
      address: '',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveLocalUsers(users);

    const safeUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: '',
      address: ''
    };
    const localToken = 'token_' + Date.now();

    setUser(safeUser);
    setToken(localToken);
    localStorage.setItem('dressfeat_user', JSON.stringify(safeUser));
    localStorage.setItem('dressfeat_token', localToken);
    setIsAuthOpen(false);
    addToast(`Account created! Welcome to DRESSFEAT, ${safeUser.name}.`, 'success');
    return { success: true };
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('dressfeat_user');
    localStorage.removeItem('dressfeat_token');
    setIsAdminOpen(false);
    setIsProfileOpen(false);
    addToast('You have been logged out.', 'info');
  };

  const updateProfile = async (formData) => {
    // 1. Try remote API first if backend server is online
    try {
      const res = await updateUserProfile(formData, token);
      if (res && res.success) {
        setUser(res.user);
        if (res.token) {
          setToken(res.token);
          localStorage.setItem('dressfeat_token', res.token);
        }
        localStorage.setItem('dressfeat_user', JSON.stringify(res.user));
        addToast(res.message || 'Profile updated successfully', 'success');
        return { success: true };
      }
      if (res && res.status && res.status !== 404 && res.message) {
        addToast(res.message, 'error');
        return { success: false, message: res.message };
      }
    } catch (err) {
      console.warn('Backend unavailable, updating in local client storage:', err);
    }

    // 2. Client-side persistent storage fallback (for GitHub Pages live site)
    if (!user) {
      addToast('You must be signed in to update profile', 'error');
      return { success: false };
    }

    const users = getLocalUsers();
    const userIndex = users.findIndex(
      u => u.id === user.id || u.email.toLowerCase() === (user.email || '').toLowerCase()
    );

    if (userIndex === -1) {
      addToast('User record not found in session', 'error');
      return { success: false };
    }

    const currentRecord = users[userIndex];

    // If changing password:
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        addToast('Current password is required to change password', 'error');
        return { success: false, message: 'Current password required' };
      }
      if (currentRecord.password !== formData.currentPassword) {
        addToast('Current password does not match', 'error');
        return { success: false, message: 'Current password does not match' };
      }
      if (formData.newPassword.length < 6) {
        addToast('New password must be at least 6 characters', 'error');
        return { success: false, message: 'Password too short' };
      }
      currentRecord.password = formData.newPassword;
    }

    // If changing email:
    if (formData.email && formData.email.toLowerCase() !== currentRecord.email.toLowerCase()) {
      const emailExists = users.some(
        u => u.email.toLowerCase() === formData.email.toLowerCase() && u.id !== currentRecord.id
      );
      if (emailExists) {
        addToast('Email address is already in use by another account', 'error');
        return { success: false, message: 'Email in use' };
      }
      currentRecord.email = formData.email.toLowerCase();
    }

    if (formData.name) currentRecord.name = formData.name;
    if (formData.phone !== undefined) currentRecord.phone = formData.phone;
    if (formData.address !== undefined) currentRecord.address = formData.address;

    users[userIndex] = currentRecord;
    saveLocalUsers(users);

    const safeUser = {
      id: currentRecord.id,
      name: currentRecord.name,
      email: currentRecord.email,
      role: currentRecord.role,
      phone: currentRecord.phone || '',
      address: currentRecord.address || ''
    };

    setUser(safeUser);
    localStorage.setItem('dressfeat_user', JSON.stringify(safeUser));
    addToast('Profile & password updated successfully!', 'success');
    return { success: true };
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        setProducts,
        reviews,
        loading,
        loadData,
        activeTab,
        setActiveTab,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        priceRange,
        setPriceRange,
        sortBy,
        setSortBy,
        isCartOpen,
        setIsCartOpen,
        isWishlistOpen,
        setIsWishlistOpen,
        isAuthOpen,
        setIsAuthOpen,
        isSearchOpen,
        setIsSearchOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        isAdminOpen,
        setIsAdminOpen,
        isShopOpen,
        setIsShopOpen,
        isProfileOpen,
        setIsProfileOpen,
        isContactOpen,
        setIsContactOpen,
        isPolicyOpen,
        setIsPolicyOpen,
        isFaqOpen,
        setIsFaqOpen,
        selectedProduct,
        setSelectedProduct,
        cart,
        cartCount,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        wishlist,
        toggleWishlist,
        isInWishlist,
        promoCode,
        discountPercent,
        discountAmount,
        cartSubtotal,
        freeShippingThreshold,
        shippingFee,
        cartTotal,
        applyCoupon,
        removeCoupon,
        user,
        token,
        handleLogin,
        handleRegister,
        handleLogout,
        updateProfile,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within ShopProvider');
  return context;
};
