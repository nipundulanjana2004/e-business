import React from 'react';
import { useShop } from './context/ShopContext';
import { TopBar } from './components/TopBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { NewArrivals } from './components/NewArrivals';
import { WomenSection } from './components/WomenSection';
import { MenSection } from './components/MenSection';
import { CustomerReviews } from './components/CustomerReviews';
import { Footer } from './components/Footer';
import { ShopCatalog } from './components/ShopCatalog';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { SearchModal } from './components/SearchModal';
import { UserProfileModal } from './components/UserProfileModal';
import { InfoModals } from './components/InfoModals';
import { ToastContainer } from './components/Toast';

export function App() {
  const { activeTab } = useShop();

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-neutral-900">
      {/* Top Header Bar */}
      <TopBar />

      {/* Main Sticky Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'shop' ? (
          <ShopCatalog />
        ) : (
          <>
            {/* Dark Hero Section matching screenshot */}
            <Hero />

            {/* New Arrivals with Silk Utility Shirt */}
            <NewArrivals />

            {/* Women Section (4 items from screenshot) */}
            <WomenSection />

            {/* Men Section (4 items from screenshot) */}
            <MenSection />

            {/* Loved by our customers Testimonial Section */}
            <CustomerReviews />
          </>
        )}
      </main>

      {/* Footer matching screenshot */}
      <Footer />

      {/* Interactive Modals & Drawers */}
      <ProductModal />
      <CartDrawer />
      <CheckoutModal />
      <WishlistDrawer />
      <AuthModal />
      <AdminDashboard />
      <SearchModal />
      <UserProfileModal />
      <InfoModals />
      <ToastContainer />
    </div>
  );
}

export default App;
