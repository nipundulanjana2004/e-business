import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchProducts, fetchReviews, loginUser, registerUser } from '../services/api';

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

  // Initial Load
  const loadData = async () => {
    try {
      setLoading(true);
      const [prodRes, revRes] = await Promise.all([
        fetchProducts(),
        fetchReviews()
      ]);
      if (prodRes.success) setProducts(prodRes.products);
      if (revRes.success) setReviews(revRes.reviews);
    } catch (err) {
      console.error('Failed to load initial data:', err);
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

  // Authentication
  const handleLogin = async (email, password) => {
    try {
      const data = await loginUser(email, password);
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('dressfeat_user', JSON.stringify(data.user));
        localStorage.setItem('dressfeat_token', data.token);
        setIsAuthOpen(false);
        addToast(`Welcome back, ${data.user.name}!`, 'success');
        return { success: true };
      } else {
        addToast(data.message || 'Login failed', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      addToast('Network error during login', 'error');
      return { success: false, message: 'Network error' };
    }
  };

  const handleRegister = async (name, email, password) => {
    try {
      const data = await registerUser(name, email, password);
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('dressfeat_user', JSON.stringify(data.user));
        localStorage.setItem('dressfeat_token', data.token);
        setIsAuthOpen(false);
        addToast(`Account created! Welcome to DRESSFEAT, ${data.user.name}.`, 'success');
        return { success: true };
      } else {
        addToast(data.message || 'Registration failed', 'error');
        return { success: false, message: data.message };
      }
    } catch (err) {
      addToast('Network error during registration', 'error');
      return { success: false, message: 'Network error' };
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('dressfeat_user');
    localStorage.removeItem('dressfeat_token');
    setIsAdminOpen(false);
    addToast('You have been logged out.', 'info');
  };

  const quickDemoLogin = async (role) => {
    if (role === 'admin') {
      await handleLogin('admin@dressfeat.com', 'password123');
    } else {
      await handleLogin('sophia@example.com', 'password123');
    }
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
        quickDemoLogin,
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
