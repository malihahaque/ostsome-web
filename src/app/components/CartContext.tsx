import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Product } from '../data/products';
import { createCart, addToCart, removeFromCart, updateCartLine, getCart } from '../data/shopify';
import { useAuth } from './AuthContext';
import { FOST_DISCOUNT_CODE, getFostPrice } from '../data/pricing';

// Flash sale window: 17 July 2026, 7:00–8:00 PM Singapore Time (UTC+8).
// Must stay in sync with the same window in Hero.tsx, ProductDetail.tsx,
// ProductCard.tsx, WhatsNewThisWeek.tsx, CartDrawer.tsx, and the caps in
// flash-sale-webhook.js.
const FLASH_SALE_START = new Date("2026-07-17T19:00:00+08:00").getTime();
const FLASH_SALE_END = new Date("2026-07-17T20:00:00+08:00").getTime();

// TODO: must match the same handles used in the other flash-sale files.
const FLASH_SALE_PRICES: Record<string, number> = {
  "skullcandy-aivator-900-anc-wireless-over-ear": 269.0,
  "kospet-tank-t4-smartwatch-black-silver": 199.0,
};

function isFlashSaleActive(): boolean {
  const now = Date.now();
  return now >= FLASH_SALE_START && now < FLASH_SALE_END;
}

export type CartItem = {
  product: Product;
  qty: number;
  selectedOption1?: string | null;
  selectedOption2?: string | null;
  variantPrice: number;
  variantImage?: string | null;
  shopifyVariantId?: string | null; // Shopify GID for checkout
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'qty'> & { qty?: number }) => void;
  removeItem: (index: number) => void;
  updateQty: (index: number, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isFostMember: boolean;
  fostSubtotal: number;
  fostSavings: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  goToShopifyCheckout: () => Promise<void>;
  checkoutLoading: boolean;
};

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = 'ostsome_cart_items';
const PENDING_CHECKOUT_KEY = 'ostsome_pending_checkout_cart_id';

function loadPersistedCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, shopifyToken } = useAuth();
  const isFostMember = Boolean(user);

  const [items, setItems] = useState<CartItem[]>(() => loadPersistedCart());
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Persist the cart to localStorage on every change, so refreshing the
  // page or navigating back from checkout (via the logo, or the browser's
  // own back button) no longer wipes out items the customer hadn't
  // actually purchased yet — cart state used to live only in memory.
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage can fail (private browsing, storage full) — not worth
      // surfacing to the customer, the cart just won't persist that time.
    }
  }, [items]);

  // Universal auto-clear: when checkout was initiated, we stashed the exact
  // Shopify cart ID we created (see goToShopifyCheckout below). On load, if
  // there's a pending cart ID, ask Shopify whether that cart still exists.
  // Shopify automatically deletes a cart the moment its checkout completes
  // and becomes an order — so if the cart is gone, the purchase went
  // through and we can safely clear the local cart. If it still exists,
  // checkout was abandoned, so we leave the local cart untouched. This
  // works identically for guests and logged-in FOST members, since it
  // doesn't depend on a customer account at all.
  useEffect(() => {
    const pendingCartId = localStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!pendingCartId) return;
    let cancelled = false;

    getCart(pendingCartId).then(cart => {
      if (cancelled) return;
      if (!cart) {
        // Cart is gone — checkout completed, safe to clear.
        setItems([]);
      }
      // Either way, we've resolved this pending checkout; stop tracking it.
      localStorage.removeItem(PENDING_CHECKOUT_KEY);
    }).catch(() => {
      // Best-effort — if the check fails, leave everything as-is and try
      // again next time the app loads (don't clear the marker on error).
    });

    return () => { cancelled = true; };
  }, []);

  const addItem = useCallback((incoming: Omit<CartItem, 'qty'> & { qty?: number }) => {
    const qty = incoming.qty ?? 1;
    setItems(prev => {
      const existingIdx = prev.findIndex(
        i =>
          i.product.handle === incoming.product.handle &&
          i.selectedOption1 === incoming.selectedOption1 &&
          i.selectedOption2 === incoming.selectedOption2
      );
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], qty: updated[existingIdx].qty + qty };
        return updated;
      }
      return [...prev, { ...incoming, qty }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateQty = useCallback((index: number, qty: number) => {
    if (qty < 1) return;
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], qty };
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  // If the customer navigates to checkout, then uses the browser's own Back
  // button (not the logo/continue-shopping links), the browser can restore
  // this page from bfcache exactly as it was mid-navigation — including
  // checkoutLoading stuck at `true` forever, since the code that would
  // normally reset it never got to run (the page had already navigated
  // away to Shopify). That left the checkout button permanently disabled
  // on return. Resetting on `pageshow` (which fires on every bfcache
  // restore) fixes it.
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        setCheckoutLoading(false);
      }
    }
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // Creates a real Shopify cart and redirects to Shopify hosted checkout
  const goToShopifyCheckout = useCallback(async () => {
    if (items.length === 0) return;

    // Check if all items have Shopify variant IDs
    const itemsWithVariants = items.filter(i => i.shopifyVariantId);

    if (itemsWithVariants.length === 0) {
      // No Shopify variant IDs yet — variants are still loading, open cart and wait
      setCheckoutLoading(false);
      return;
    }

    setCheckoutLoading(true);
    try {
      // If the cart contains a flash-sale item during the active window, we
      // deliberately do NOT pass the FOST5 code. Both FOST5 and the Friday
      // Flash Deal automatic discount have "combine with other product
      // discounts" turned off in Shopify Admin — that's what stops them
      // stacking on the SAME item. But if FOST5 is already applied to the
      // cart as a code, Shopify may not swap it out for the larger
      // automatic discount, since neither is allowed to combine. Skipping
      // the code here gives the automatic (bigger) discount room to apply.
      // Trade-off: any OTHER non-flash items in the same cart temporarily
      // lose their 5% FOST discount too, for the duration of this one
      // checkout — acceptable for a 1-hour window, but worth knowing.
      const cartHasFlashItem = items.some(
        i => FLASH_SALE_PRICES[i.product.handle] !== undefined
      );
      const skipFostCode = isFlashSaleActive() && cartHasFlashItem;

      // Create a Shopify cart with the first item. For FOST members, pass the
      // FOST5 discount code so the 5% off is applied on Shopify's side too —
      // this keeps what's shown on-site and what's actually charged in sync.
      // (Requires a "FOST5" discount code to exist and be active in Shopify
      // Admin → Discounts, set to 5% off all products.)
      // Passing the customer's token here links the resulting order to their
      // Shopify account (see comment on createCart) — this is what makes
      // "My Orders" and status tracking work for logged-in FOST members.
      let cart = await createCart(
        isFostMember && !skipFostCode ? [FOST_DISCOUNT_CODE] : undefined,
        shopifyToken ?? undefined
      );

      // Add all items to the cart
      for (const item of itemsWithVariants) {
        cart = await addToCart(cart.id, item.shopifyVariantId!, item.qty);
      }

      // Stash this exact cart's ID so that on the next app load we can ask
      // Shopify whether it still exists — if it's gone, the checkout
      // completed (see the pending-checkout effect above), and we clear
      // the local cart then. This works the same for guests and logged-in
      // FOST members alike.
      localStorage.setItem(PENDING_CHECKOUT_KEY, cart.id);

      // Navigate to Shopify's hosted checkout in the SAME tab. The cart is
      // now persisted to localStorage (see loadPersistedCart / the save
      // effect above), so this no longer wipes it out if the customer
      // comes back via the logo or the browser's back button without
      // completing the purchase.
      window.location.href = cart.checkoutUrl;
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong. Please try again.');
      setCheckoutLoading(false);
    }
  }, [items, isFostMember, shopifyToken]);

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.variantPrice * i.qty, 0);
  const flashActiveNow = isFlashSaleActive();
  const effectivePrice = (i: CartItem) => {
    const flashPrice = FLASH_SALE_PRICES[i.product.handle];
    if (isFostMember && flashActiveNow && flashPrice !== undefined) return flashPrice;
    return isFostMember ? getFostPrice(i.variantPrice) : i.variantPrice;
  };
  const fostSubtotal = isFostMember
    ? items.reduce((sum, i) => sum + effectivePrice(i) * i.qty, 0)
    : subtotal;
  const fostSavings = subtotal - fostSubtotal;

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQty, clearCart,
      totalItems, subtotal, isFostMember, fostSubtotal, fostSavings,
      isOpen, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false),
      goToShopifyCheckout, checkoutLoading,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
