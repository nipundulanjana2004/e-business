import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Search, User, Heart, ShoppingBag, Menu, X, Shield, LogOut } from 'lucide-react';

export const Navbar = () => {
  const { setIsShopOpen,
    activeTab,
    setActiveTab,
    cartCount,
    wishlist,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsAuthOpen,
    setIsSearchOpen,
    setIsAdminOpen,
    setIsProfileOpen,
    user,
    handleLogout
  } = useShop();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    if (tab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'women') {
      const el = document.getElementById('women-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 600, behavior: 'smooth' });
    } else if (tab === 'men') {
      const el = document.getElementById('men-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 1100, behavior: 'smooth' });
    } else if (tab === 'shop') {
      setActiveTab('shop');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center space-x-2.5 text-left group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-black text-white flex items-center justify-center font-serif font-black tracking-tighter text-sm sm:text-base border border-black group-hover:bg-neutral-800 transition-colors">
                <span className="font-extrabold tracking-tighter">DF</span>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg sm:text-xl tracking-tight text-black font-sans leading-none">
                  DRESS<span className="font-light text-neutral-600">FEAT</span>
                </span>
                <span className="text-[8px] uppercase tracking-[0.25em] text-neutral-400 font-medium">
                  Atelier MMXXVI
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 lg:space-x-12">
            <button
              onClick={() => handleNavClick('women')}
              className={`text-xs font-bold uppercase tracking-[0.18em] transition-all py-1 border-b-2 ${
                activeTab === 'women'
                  ? 'border-black text-black'
                  : 'border-transparent text-neutral-700 hover:text-black hover:border-neutral-300'
              }`}
            >
              WOMEN
            </button>
            <button
              onClick={() => handleNavClick('men')}
              className={`text-xs font-bold uppercase tracking-[0.18em] transition-all py-1 border-b-2 ${
                activeTab === 'men'
                  ? 'border-black text-black'
                  : 'border-transparent text-neutral-700 hover:text-black hover:border-neutral-300'
              }`}
            >
              MEN
            </button>
            <button
              onClick={() => handleNavClick('shop')}
              className={`text-xs font-bold uppercase tracking-[0.18em] transition-all py-1 border-b-2 ${
                activeTab === 'shop'
                  ? 'border-black text-black'
                  : 'border-transparent text-neutral-700 hover:text-black hover:border-neutral-300'
              }`}
            >
              SHOP
            </button>
            <button
              onClick={() => handleNavClick('home')}
              className={`text-xs font-bold uppercase tracking-[0.18em] transition-all py-1 border-b-2 ${
                activeTab === 'home'
                  ? 'border-black text-black'
                  : 'border-transparent text-neutral-700 hover:text-black hover:border-neutral-300'
              }`}
            >
              HOME
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 text-neutral-700 hover:text-black transition-colors rounded-full hover:bg-neutral-100 flex items-center space-x-1"
              title="Search catalog"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden lg:inline text-[11px] text-neutral-400 font-medium ml-1">Search</span>
            </button>

            <div className="relative">
              <button
                onClick={() => {
                  if (user) setUserDropdownOpen(!userDropdownOpen);
                  else setIsAuthOpen(true);
                }}
                className="p-1.5 text-neutral-700 hover:text-black transition-colors rounded-full hover:bg-neutral-100"
                title={user ? `Signed in as ${user.name}` : 'Sign In / Register'}
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {user && userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-neutral-200 shadow-xl py-2 z-50 animate-in fade-in">
                  <div className="px-4 py-2 border-b border-neutral-100">
                    <p className="text-xs font-bold text-neutral-900 truncate">{user.name}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider bg-neutral-100 text-neutral-700">
                      {user.role === 'admin' ? 'Atelier Admin' : 'Vanguard Member'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileOpen(true);
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center space-x-2 border-b border-neutral-100"
                  >
                    <User className="w-3.5 h-3.5 text-neutral-900" />
                    <span>My Profile & Security</span>
                  </button>

                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        setIsAdminOpen(true);
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center space-x-2"
                    >
                      <Shield className="w-3.5 h-3.5 text-neutral-900" />
                      <span>Admin Atelier Panel</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      handleLogout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsWishlistOpen(true)}
              className="p-1.5 text-neutral-700 hover:text-black transition-colors rounded-full hover:bg-neutral-100 relative"
              title="Saved Items"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-neutral-900 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="p-1.5 text-neutral-900 hover:text-black transition-colors rounded-full hover:bg-neutral-100 relative group"
              title="Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-neutral-900 text-white rounded-full text-[9px] font-bold flex items-center justify-center group-hover:scale-110 transition-transform">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-neutral-700 hover:text-black"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-200 px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3 font-semibold text-sm tracking-wider uppercase">
            <button
              onClick={() => handleNavClick('women')}
              className="text-left py-2 border-b border-neutral-100"
            >
              WOMEN
            </button>
            <button
              onClick={() => handleNavClick('men')}
              className="text-left py-2 border-b border-neutral-100"
            >
              MEN
            </button>
            <button
              onClick={() => handleNavClick('shop')}
              className="text-left py-2 border-b border-neutral-100"
            >
              SHOP ALL
            </button>
            <button
              onClick={() => handleNavClick('home')}
              className="text-left py-2 border-b border-neutral-100"
            >
              HOME
            </button>
          </div>

          <div className="pt-2 border-t border-neutral-200">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-xs font-bold text-neutral-900">{user.name}</p>
                    <p className="text-[10px] text-neutral-500">{user.email}</p>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 bg-neutral-100 text-neutral-700 font-bold uppercase">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsProfileOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 text-xs font-bold uppercase tracking-wider bg-neutral-100 hover:bg-neutral-200 text-left flex items-center space-x-2"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>My Profile & Password</span>
                </button>
                {user.role === 'admin' && (
                  <button
                    onClick={() => {
                      setIsAdminOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 text-xs font-bold uppercase tracking-wider bg-black text-white text-left flex items-center space-x-2"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Admin Atelier Panel</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 text-left flex items-center space-x-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsAuthOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
