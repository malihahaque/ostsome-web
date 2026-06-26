import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, ShoppingBag, CreditCard, MapPin, Package, X, Lock, Tag } from 'lucide-react';
import { useCart } from './CartContext';
import { getFostPrice } from '../data/pricing';

type CheckoutProps = {
  onBack: () => void;
  onOrderComplete: (orderNum: string) => void;
};

type Step = 'review' | 'shipping' | 'payment' | 'confirmation';

type ShippingInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  unit: string;
  city: string;
  postal: string;
  country: string;
};

type PaymentInfo = {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
};

const STEPS: { key: Step; label: string; icon: typeof ShoppingBag }[] = [
  { key: 'review', label: 'Cart', icon: ShoppingBag },
  { key: 'shipping', label: 'Shipping', icon: MapPin },
  { key: 'payment', label: 'Payment', icon: CreditCard },
  { key: 'confirmation', label: 'Confirm', icon: Package },
];

const STEP_ORDER: Step[] = ['review', 'shipping', 'payment', 'confirmation'];

function StepIndicator({ current }: { current: Step }) {
  const currentIdx = STEP_ORDER.indexOf(current);
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const Icon = s.icon;
        return (
          <div key={s.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                done ? 'bg-[#F16C10] text-white' :
                active ? 'bg-black text-white' :
                'bg-neutral-100 text-neutral-400'
              }`}>
                {done ? <Check size={16} /> : <Icon size={15} />}
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${
                active ? 'text-black' : done ? 'text-[#F16C10]' : 'text-neutral-400'
              }`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-10 sm:w-16 h-px mx-1 mb-5 transition-colors ${i < currentIdx ? 'bg-[#F16C10]' : 'bg-neutral-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderSummary({ compact = false }: { compact?: boolean }) {
  const { items, subtotal, isFostMember, fostSubtotal, fostSavings } = useCart();
  const freeShipping = fostSubtotal >= 150;
  const shipping = freeShipping ? 0 : 8.90;
  const total = fostSubtotal + shipping;
  const [open, setOpen] = useState(!compact);

  return (
    <div className="bg-neutral-50 rounded-2xl border border-neutral-100 overflow-hidden">
      <button
        className={`w-full flex items-center justify-between px-5 py-4 ${compact ? '' : 'cursor-default'}`}
        onClick={() => compact && setOpen(o => !o)}
      >
        <span className="text-sm font-bold text-black">Order Summary ({items.length} item{items.length !== 1 ? 's' : ''})</span>
        {compact && <ChevronRight size={16} className={`text-neutral-400 transition-transform ${open ? 'rotate-90' : ''}`} />}
      </button>

      {open && (
        <div className="px-5 pb-5">
          <div className="flex flex-col gap-3 mb-4 max-h-64 overflow-y-auto">
            {items.map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-white border border-neutral-100 overflow-hidden">
                    <img
                      src={item.variantImage || item.product.images[0]}
                      alt={item.product.title}
                      className="w-full h-full object-contain p-1.5"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'; }}
                    />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 bg-[#F16C10] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.qty}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-black line-clamp-2 leading-snug">{item.product.title}</p>
                  {item.selectedOption1 && (
                    <p className="text-[10px] text-neutral-400 mt-0.5">{item.selectedOption1}{item.selectedOption2 ? ` / ${item.selectedOption2}` : ''}</p>
                  )}
                </div>
                {isFostMember ? (
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-xs font-bold text-[#F16C10]">SGD {(getFostPrice(item.variantPrice) * item.qty).toFixed(2)}</span>
                    <span className="text-[10px] text-neutral-400 line-through">SGD {(item.variantPrice * item.qty).toFixed(2)}</span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-black shrink-0">SGD {(item.variantPrice * item.qty).toFixed(2)}</span>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-neutral-200 pt-3 flex flex-col gap-2">
            <div className="flex justify-between text-sm text-neutral-500">
              <span>Subtotal</span>
              <span className={`font-medium ${isFostMember ? 'text-neutral-400 line-through' : 'text-black'}`}>SGD {subtotal.toFixed(2)}</span>
            </div>
            {isFostMember && (
              <div className="flex justify-between text-sm text-[#F16C10] font-semibold">
                <span>FOST member savings (5%)</span><span>– SGD {fostSavings.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-neutral-500">
              <span>Shipping</span>
              <span className={freeShipping ? 'text-green-600 font-medium' : 'text-black font-medium'}>
                {freeShipping ? 'Free' : `SGD ${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-black border-t border-neutral-200 pt-2 mt-1">
              <span>Total</span><span>SGD {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewStep({ onNext }: { onNext: () => void }) {
  const { items, removeItem, updateQty, subtotal, isFostMember, fostSubtotal, fostSavings, clearCart } = useCart();
  const freeShipping = fostSubtotal >= 150;
  const shipping = freeShipping ? 0 : 8.90;
  const total = fostSubtotal + shipping;
  const [coupon, setCoupon] = useState('');

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag size={48} className="mx-auto text-neutral-200 mb-4" />
        <p className="text-lg font-semibold text-neutral-400">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
      {/* Left: items */}
      <div>
        <div className="flex flex-col gap-4">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-4 p-4 rounded-2xl border border-neutral-100 bg-white hover:border-neutral-200 transition">
              <div className="w-20 h-20 shrink-0 rounded-xl bg-neutral-50 overflow-hidden border border-neutral-100">
                <img
                  src={item.variantImage || item.product.images[0]}
                  alt={item.product.title}
                  className="w-full h-full object-contain p-2"
                  onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-[#F16C10] uppercase tracking-widest mb-0.5">{item.product.vendor}</p>
                <p className="text-sm font-semibold text-black leading-snug mb-1">{item.product.title}</p>
                {item.selectedOption1 && (
                  <p className="text-xs text-neutral-400 mb-2">{item.selectedOption1}{item.selectedOption2 ? ` / ${item.selectedOption2}` : ''}</p>
                )}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 border border-neutral-200 rounded-lg px-2 py-1">
                    <button onClick={() => updateQty(idx, item.qty - 1)} disabled={item.qty <= 1} className="text-neutral-400 hover:text-black w-5 h-5 flex items-center justify-center disabled:opacity-30">
                      <span className="text-base leading-none">−</span>
                    </button>
                    <span className="text-sm font-semibold text-black w-5 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(idx, item.qty + 1)} className="text-neutral-400 hover:text-black w-5 h-5 flex items-center justify-center">
                      <span className="text-base leading-none">+</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    {isFostMember ? (
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-[#F16C10]">SGD {(getFostPrice(item.variantPrice) * item.qty).toFixed(2)}</span>
                        <span className="text-[10px] text-neutral-400 line-through">SGD {(item.variantPrice * item.qty).toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="text-sm font-bold text-black">SGD {(item.variantPrice * item.qty).toFixed(2)}</span>
                    )}
                    <button onClick={() => removeItem(idx)} className="text-neutral-300 hover:text-red-400 transition p-1">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coupon */}
        <div className="mt-6 flex gap-2">
          <div className="flex items-center flex-1 border border-neutral-200 rounded-xl px-4 gap-2 focus-within:border-[#F16C10] transition">
            <Tag size={14} className="text-neutral-400" />
            <input
              type="text"
              placeholder="Discount code"
              value={coupon}
              onChange={e => setCoupon(e.target.value)}
              className="flex-1 py-3 text-sm outline-none bg-transparent text-black placeholder-neutral-400"
            />
          </div>
          <button className="px-5 py-3 rounded-xl border border-neutral-200 text-sm font-semibold text-black hover:bg-neutral-50 transition">
            Apply
          </button>
        </div>
      </div>

      {/* Right: summary + CTA */}
      <div className="flex flex-col gap-4">
        <div className="bg-neutral-50 rounded-2xl border border-neutral-100 p-5">
          <h3 className="text-sm font-bold text-black mb-4">Order Summary</h3>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-neutral-500">
              <span>Subtotal</span>
              <span className={`font-medium ${isFostMember ? 'text-neutral-400 line-through' : 'text-black'}`}>SGD {subtotal.toFixed(2)}</span>
            </div>
            {isFostMember && (
              <div className="flex justify-between text-[#F16C10] font-semibold">
                <span>FOST member savings (5%)</span><span>– SGD {fostSavings.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-neutral-500">
              <span>Shipping</span>
              <span className={freeShipping ? 'text-green-600 font-medium' : 'text-black font-medium'}>
                {freeShipping ? 'Free' : `SGD ${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-black border-t border-neutral-200 pt-3 mt-1">
              <span>Total</span><span>SGD {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <button
          onClick={onNext}
          className="w-full bg-[#F16C10] hover:bg-[#d65f0e] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition text-base"
        >
          Proceed to Shipping <ChevronRight size={18} />
        </button>
        <div className="flex items-center justify-center gap-2 text-xs text-neutral-400">
          <Lock size={12} /> Secure checkout
        </div>
      </div>
    </div>
  );
}

function ShippingStep({ onNext, onBack, info, setInfo }: {
  onNext: () => void;
  onBack: () => void;
  info: ShippingInfo;
  setInfo: (i: ShippingInfo) => void;
}) {
  const field = (label: string, key: keyof ShippingInfo, type = 'text', placeholder = '') => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        value={info[key]}
        onChange={e => setInfo({ ...info, [key]: e.target.value })}
        placeholder={placeholder}
        className="border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#F16C10] transition text-black placeholder-neutral-400 bg-white"
      />
    </div>
  );

  const isValid = info.firstName && info.lastName && info.email && info.address && info.city && info.postal;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
      <div>
        <h3 className="text-base font-bold text-black mb-5">Shipping Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field('First Name', 'firstName', 'text', 'Jane')}
          {field('Last Name', 'lastName', 'text', 'Tan')}
          <div className="sm:col-span-2">{field('Email Address', 'email', 'email', 'jane@example.com')}</div>
          {field('Phone', 'phone', 'tel', '+65 9123 4567')}
          <div className="sm:col-span-2">{field('Address', 'address', 'text', 'Block 123, Tampines Street 11')}</div>
          {field('Unit / Floor', 'unit', 'text', '#04-21')}
          {field('City', 'city', 'text', 'Singapore')}
          {field('Postal Code', 'postal', 'text', '520123')}
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide block mb-1.5">Country</label>
            <select
              value={info.country}
              onChange={e => setInfo({ ...info, country: e.target.value })}
              className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#F16C10] transition text-black bg-white"
            >
              <option value="Singapore">Singapore</option>
              <option value="Malaysia">Malaysia</option>
              <option value="Indonesia">Indonesia</option>
              <option value="Thailand">Thailand</option>
              <option value="Philippines">Philippines</option>
              <option value="Vietnam">Vietnam</option>
            </select>
          </div>
        </div>

        {/* Shipping method */}
        <div className="mt-6">
          <h3 className="text-base font-bold text-black mb-3">Delivery Method</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Standard Delivery', sub: '3–5 business days', price: 'SGD 8.90' },
              { label: 'Express Delivery', sub: '1–2 business days', price: 'SGD 15.00' },
              { label: 'Self Collection', sub: 'Collect at Ostsome HQ', price: 'Free' },
            ].map((opt, i) => (
              <label key={i} className="flex items-center gap-4 p-4 border border-neutral-200 rounded-xl cursor-pointer hover:border-[#F16C10] transition group has-[:checked]:border-[#F16C10] has-[:checked]:bg-[#F16C10]/5">
                <input type="radio" name="delivery" defaultChecked={i === 0} className="accent-[#F16C10]" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-black">{opt.label}</p>
                  <p className="text-xs text-neutral-400">{opt.sub}</p>
                </div>
                <span className="text-sm font-bold text-black">{opt.price}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <OrderSummary compact />
        <div className="flex flex-col gap-3">
          <button
            onClick={onNext}
            disabled={!isValid}
            className="w-full bg-[#F16C10] hover:bg-[#d65f0e] disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition text-base"
          >
            Continue to Payment <ChevronRight size={18} />
          </button>
          <button onClick={onBack} className="w-full flex items-center justify-center gap-1 text-sm text-neutral-400 hover:text-black transition">
            <ChevronLeft size={14} /> Back to Cart
          </button>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-neutral-400">
          <Lock size={12} /> Secure checkout
        </div>
      </div>
    </div>
  );
}

function PaymentStep({ onNext, onBack, info, setInfo }: {
  onNext: () => void;
  onBack: () => void;
  info: PaymentInfo;
  setInfo: (i: PaymentInfo) => void;
}) {
  const [method, setMethod] = useState<'card' | 'paynow'>('card');

  const formatCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  const isValid = method === 'paynow' || (info.cardName && info.cardNumber.replace(/\s/g, '').length === 16 && info.expiry.length === 5 && info.cvv.length >= 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
      <div>
        <h3 className="text-base font-bold text-black mb-5">Payment Method</h3>

        {/* Method tabs */}
        <div className="flex gap-3 mb-6">
          {[
            { key: 'card' as const, label: '💳 Credit / Debit Card' },
            { key: 'paynow' as const, label: '🏦 PayNow' },
          ].map(m => (
            <button
              key={m.key}
              onClick={() => setMethod(m.key)}
              className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition ${
                method === m.key ? 'border-[#F16C10] bg-[#F16C10]/5 text-[#F16C10]' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {method === 'card' ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">Name on Card</label>
              <input
                type="text"
                value={info.cardName}
                onChange={e => setInfo({ ...info, cardName: e.target.value })}
                placeholder="Jane Tan"
                className="border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#F16C10] transition text-black placeholder-neutral-400"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">Card Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={info.cardNumber}
                  onChange={e => setInfo({ ...info, cardNumber: formatCard(e.target.value) })}
                  placeholder="1234 5678 9012 3456"
                  className="w-full border border-neutral-200 rounded-xl px-4 py-3 pr-16 text-sm outline-none focus:border-[#F16C10] transition text-black placeholder-neutral-400 font-mono"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                  <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">VISA</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">Expiry</label>
                <input
                  type="text"
                  value={info.expiry}
                  onChange={e => setInfo({ ...info, expiry: formatExpiry(e.target.value) })}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#F16C10] transition text-black placeholder-neutral-400 font-mono"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">CVV</label>
                <input
                  type="password"
                  value={info.cvv}
                  onChange={e => setInfo({ ...info, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  placeholder="•••"
                  className="border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#F16C10] transition text-black placeholder-neutral-400"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 gap-4 bg-neutral-50 rounded-2xl border border-neutral-100">
            <div className="w-32 h-32 bg-white rounded-2xl border border-neutral-200 flex items-center justify-center">
              {/* Mock QR */}
              <svg viewBox="0 0 80 80" className="w-24 h-24 opacity-70">
                {[0,10,20,30,40,50,60,70].map(x =>
                  [0,10,20,30,40,50,60,70].map(y =>
                    Math.random() > 0.5 ? <rect key={`${x}${y}`} x={x} y={y} width="8" height="8" fill="#222" /> : null
                  )
                )}
                <rect x="0" y="0" width="28" height="28" fill="none" stroke="#222" strokeWidth="4" />
                <rect x="52" y="0" width="28" height="28" fill="none" stroke="#222" strokeWidth="4" />
                <rect x="0" y="52" width="28" height="28" fill="none" stroke="#222" strokeWidth="4" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-black mb-1">Scan with your bank app</p>
              <p className="text-xs text-neutral-400">UEN: 202312345K • Ostsome Pte Ltd</p>
              <p className="text-xs text-neutral-400 mt-1">Screenshot this QR and pay via your preferred banking app</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <OrderSummary compact />
        <div className="flex flex-col gap-3">
          <button
            onClick={onNext}
            disabled={!isValid}
            className="w-full bg-[#F16C10] hover:bg-[#d65f0e] disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition text-base"
          >
            <Lock size={16} /> Place Order
          </button>
          <button onClick={onBack} className="w-full flex items-center justify-center gap-1 text-sm text-neutral-400 hover:text-black transition">
            <ChevronLeft size={14} /> Back to Shipping
          </button>
        </div>
        <p className="text-xs text-neutral-400 text-center leading-relaxed">
          By placing your order you agree to Ostsome's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

function ConfirmationStep({ orderNum, onContinue }: { orderNum: string; onContinue: () => void }) {
  return (
    <div className="flex flex-col items-center text-center py-12 gap-6 max-w-md mx-auto">
      <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
        <Check size={36} className="text-green-500" strokeWidth={2.5} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-black mb-2">Order Confirmed!</h2>
        <p className="text-neutral-500 text-sm leading-relaxed">
          Thank you for your order. We've received it and will start processing right away.
        </p>
      </div>
      <div className="bg-neutral-50 rounded-2xl border border-neutral-100 px-8 py-5 w-full">
        <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Order Number</p>
        <p className="text-lg font-bold text-black font-mono">{orderNum}</p>
      </div>
      <div className="grid grid-cols-3 gap-4 w-full text-sm">
        {[
          { icon: '📦', label: 'Processing', sub: 'Right now' },
          { icon: '🚚', label: 'Dispatched', sub: '1–2 days' },
          { icon: '🏠', label: 'Delivered', sub: '3–5 days' },
        ].map(s => (
          <div key={s.label} className="flex flex-col items-center gap-1 p-3 bg-white rounded-xl border border-neutral-100">
            <span className="text-xl">{s.icon}</span>
            <p className="font-semibold text-black text-xs">{s.label}</p>
            <p className="text-[10px] text-neutral-400">{s.sub}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-neutral-400">
        A confirmation email has been sent to your inbox.
      </p>
      <button
        onClick={onContinue}
        className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-4 rounded-xl transition text-base"
      >
        Continue Shopping
      </button>
    </div>
  );
}

export function CheckoutPage({ onBack, onOrderComplete }: CheckoutProps) {
  const [step, setStep] = useState<Step>('review');
  const [orderNum, setOrderNum] = useState('');
  const { clearCart } = useCart();

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', unit: '', city: 'Singapore', postal: '', country: 'Singapore',
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardName: '', cardNumber: '', expiry: '', cvv: '',
  });

  function placeOrder() {
    const num = `OST-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    setOrderNum(num);
    clearCart();
    setStep('confirmation');
    onOrderComplete(num);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back link (not on confirmation) */}
        {step !== 'confirmation' && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-black transition mb-6"
          >
            <ChevronLeft size={16} /> Back to Shop
          </button>
        )}

        <StepIndicator current={step} />

        {step === 'review' && <ReviewStep onNext={() => setStep('shipping')} />}
        {step === 'shipping' && (
          <ShippingStep
            onNext={() => setStep('payment')}
            onBack={() => setStep('review')}
            info={shippingInfo}
            setInfo={setShippingInfo}
          />
        )}
        {step === 'payment' && (
          <PaymentStep
            onNext={placeOrder}
            onBack={() => setStep('shipping')}
            info={paymentInfo}
            setInfo={setPaymentInfo}
          />
        )}
        {step === 'confirmation' && (
          <ConfirmationStep orderNum={orderNum} onContinue={onBack} />
        )}
      </div>
    </div>
  );
}