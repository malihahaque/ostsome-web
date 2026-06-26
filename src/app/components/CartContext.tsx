import { createContext, useContext, useState, useCallback } from 'react';
import type { Product } from '../data/products';
import { createCart, addToCart, removeFromCart, updateCartLine } from '../data/shopify';
import { useAuth } from './AuthContext';
import { FOST_DISCOUNT_CODE, getFostPrice } from '../data/pricing';

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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isFostMember = Boolean(user);

  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

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
      // Create a Shopify cart with the first item. For FOST members, pass the
      // FOST5 discount code so the 5% off is applied on Shopify's side too —
      // this keeps what's shown on-site and what's actually charged in sync.
      // (Requires a "FOST5" discount code to exist and be active in Shopify
      // Admin → Discounts, set to 5% off all products.)
      let cart = await createCart(isFostMember ? [FOST_DISCOUNT_CODE] : undefined);

      // Add all items to the cart
      for (const item of itemsWithVariants) {
        cart = await addToCart(cart.id, item.shopifyVariantId!, item.qty);
      }

      // Open Shopify's hosted checkout in a new tab
      // (works in both Figma preview and production)
      window.open(cart.checkoutUrl, '_blank');
      setCheckoutLoading(false);
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Something went wrong. Please try again.');
      setCheckoutLoading(false);
    }
  }, [items, isFostMember]);

  const totalItems = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.variantPrice * i.qty, 0);
  const fostSubtotal = isFostMember
    ? items.reduce((sum, i) => sum + getFostPrice(i.variantPrice) * i.qty, 0)
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