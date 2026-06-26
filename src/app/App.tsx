import { useState, useEffect } from 'react';
import { useAuth } from './components/AuthContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { LaunchExclusive } from './components/LaunchExclusive';
import { OneSeasonOff } from './components/OneSeasonOff';
import { OneSeasonOffPage } from './components/OneSeasonOffPage';
import { WhatsNewThisWeek } from './components/WhatsNewThisWeek';
import { ShoppableSetup } from './components/ShoppableSetup';
import { DiscoveryByLifestyle } from './components/DiscoveryByLifestyle';
import { WhyEnthusiasts } from './components/WhyEnthusiasts';
import { OurStory } from './components/OurStory';
import { FostMembership } from './components/FostMembership';
import { FostMembershipPage } from './components/FostMembershipPage';
import { ProductListing } from './components/ProductListing';
import { ProductDetail } from './components/ProductDetail';
import { BrandsPage } from './components/BrandsPage';
import { BrandDetail } from './components/BrandDetail';
import { NavCategoryPage } from './components/NavCategoryPage';
import { CartProvider, useCart } from './components/CartContext';
import { AuthProvider } from './components/AuthContext';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutPage } from './components/CheckoutPage';
import { FostAuthModal } from './components/FostAuthModal';
import { AccountPage } from './components/AccountPage';
import { AdminDashboard } from './components/AdminDashboard';
import { LaunchExclusivePage } from './components/LaunchExclusivePage';
import type { Tab as AccountTab } from './components/AccountPage';
import { useProducts } from './hooks/useProducts';
import type { Product } from './data/products';

type Page = 'home' | 'products' | 'product-detail' | 'brands' | 'brand-detail' | 'nav-category' | 'checkout' | 'account' | 'admin' | 'launch-exclusive' | 'one-season-off' | 'fost-membership';

function AppInner() {
  const { user } = useAuth();
  const { openCart } = useCart();
  const [page, setPage] = useState<Page>('home');
  const [authModal, setAuthModal] = useState<{ open: boolean; view: 'login' | 'signup' }>({ open: false, view: 'login' });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedNavCategory, setSelectedNavCategory] = useState<string | null>(null);
  const [initialSearch, setInitialSearch] = useState<string>('');
  const [accountTab, setAccountTab] = useState<AccountTab>('orders');

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const { products: liveProducts } = useProducts();
  const heshAncProduct = liveProducts.find(p => p.handle === 'skullcandy-hesh-anc-noise-canceling-wireless-headphones');
  const lookiProduct = liveProducts.find(p => p.handle === 'looki-l1');

  // Secret admin access: navigate to /#admin or press Ctrl+Shift+A
  useEffect(() => {
    if (window.location.hash === '#admin') setPage('admin');
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') setPage('admin');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setPage('product-detail');
    scrollTop();
  };

  const handleSelectBrand = (brand: string) => {
    setSelectedBrand(brand);
    setPage('brand-detail');
    scrollTop();
  };

  const handleNavToNavCategory = (category: string) => {
    setSelectedNavCategory(category);
    setPage('nav-category');
    scrollTop();
  };

  const handleNavToProducts = () => { setInitialSearch(''); setPage('products'); scrollTop(); };
  const handleNavToHome = () => { setPage('home'); scrollTop(); };
  const handleNavToBrands = () => { setPage('brands'); scrollTop(); };

  const handleSearchNavigate = (query: string) => {
    setInitialSearch(query);
    setPage('products');
    scrollTop();
  };

  const handleBackFromProduct = () => {
    if (selectedBrand) setPage('brand-detail');
    else if (selectedNavCategory) setPage('nav-category');
    else setPage('products');
    scrollTop();
  };

  const handleGoToCheckout = () => { openCart(); };
  const handleOrderComplete = (_orderNum: string) => {};
  const handleBackFromCheckout = () => { setPage('home'); scrollTop(); };

  const showHeader = page !== 'checkout';

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-0">
      {authModal.open && (
        <FostAuthModal
          initialView={authModal.view}
          onClose={() => setAuthModal({ open: false, view: 'login' })}
        />
      )}

      <CartDrawer />

      {showHeader && (
        <Header
          onNavToProducts={handleNavToProducts}
          onNavToHome={handleNavToHome}
          onNavToBrands={handleNavToBrands}
          onNavToCategory={handleNavToNavCategory}
          onSelectProduct={handleSelectProduct}
          onSearchNavigate={handleSearchNavigate}
          onNavToLogin={() => {
            if (user) { setAccountTab('orders'); setPage('account'); scrollTop(); }
            else setAuthModal({ open: true, view: 'login' });
          }}
          onNavToAccount={(tab) => {
            setAccountTab((tab as AccountTab) ?? 'orders');
            setPage('account');
            scrollTop();
          }}
          onLogout={() => { setPage('home'); scrollTop(); }}
          currentPage={page}
          currentNavCategory={selectedNavCategory}
        />
      )}

      {page === 'home' && (
        <>
          <Hero
            onNavToAllProducts={handleNavToProducts}
            onNavToHeshAnc={() => { if (heshAncProduct) handleSelectProduct(heshAncProduct); }}
            onNavToFostSignup={() => setAuthModal({ open: true, view: 'signup' })}
            onNavToClearance={() => { setPage('one-season-off'); scrollTop(); }}
            onNavToLooki={() => { if (lookiProduct) handleSelectProduct(lookiProduct); }}
          />
          <WhatsNewThisWeek onShopAll={handleNavToProducts} onSelectProduct={handleSelectProduct} />
          <DiscoveryByLifestyle onNavToCategory={handleNavToNavCategory} onNavToProducts={handleNavToProducts} />
          <FostMembership
            onJoin={() => setAuthModal({ open: true, view: 'signup' })}
            onLogin={() => setAuthModal({ open: true, view: 'login' })}
            onLearnMore={() => { setPage('fost-membership'); scrollTop(); }}
          />
          <LaunchExclusive
            onSelectProduct={handleSelectProduct}
            onViewAll={() => { setPage('launch-exclusive'); scrollTop(); }}
          />
          <WhyEnthusiasts />
          <OneSeasonOff
            onSelectProduct={handleSelectProduct}
            onViewAll={() => { setPage('one-season-off'); scrollTop(); }}
          />
          <ShoppableSetup onSelectProduct={handleSelectProduct} />
          <OurStory />
        </>
      )}

      {page === 'products' && (
        <ProductListing
          key={initialSearch}
          onSelectProduct={handleSelectProduct}
          initialSearch={initialSearch}
        />
      )}

      {page === 'product-detail' && selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onBack={handleBackFromProduct}
          onCheckout={handleGoToCheckout}
        />
      )}

      {page === 'brands' && (
        <BrandsPage onSelectBrand={handleSelectBrand} />
      )}

      {page === 'brand-detail' && selectedBrand && (
        <BrandDetail
          brand={selectedBrand}
          onBack={() => { setPage('brands'); scrollTop(); }}
          onSelectProduct={handleSelectProduct}
        />
      )}

      {page === 'nav-category' && selectedNavCategory && (
        <NavCategoryPage
          category={selectedNavCategory}
          onBack={() => { setPage('home'); scrollTop(); }}
          onSelectProduct={handleSelectProduct}
        />
      )}

      {page === 'checkout' && (
        <CheckoutPage
          onBack={handleBackFromCheckout}
          onOrderComplete={handleOrderComplete}
        />
      )}

      {page === 'admin' && <AdminDashboard />}

      {page === 'launch-exclusive' && (
        <LaunchExclusivePage
          onBack={() => { setPage('home'); scrollTop(); }}
          onSelectProduct={handleSelectProduct}
          onJoinFost={() => setAuthModal({ open: true, view: 'signup' })}
        />
      )}

      {page === 'one-season-off' && (
        <OneSeasonOffPage
          onBack={() => { setPage('home'); scrollTop(); }}
          onSelectProduct={handleSelectProduct}
        />
      )}

      {page === 'fost-membership' && (
        <FostMembershipPage
          onBack={() => { setPage('home'); scrollTop(); }}
          onJoin={() => setAuthModal({ open: true, view: 'signup' })}
          onLogin={() => setAuthModal({ open: true, view: 'login' })}
        />
      )}

      {page === 'account' && (
        <AccountPage
          key={accountTab}
          onBack={() => { setPage('home'); scrollTop(); }}
          onSelectProduct={handleSelectProduct}
          initialTab={accountTab}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppInner />
      </CartProvider>
    </AuthProvider>
  );
}