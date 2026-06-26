import { useState, useEffect, useMemo } from 'react';
import { Package, Truck, CheckCircle, Clock, Search, X, RefreshCw, Lock, TrendingUp, ShoppingBag, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchAdminOrders } from '../data/shopifyAdmin';
import type { AdminOrder } from '../data/shopifyAdmin';

const ADMIN_PASSWORD = 'ostsome2024';

function getStatusStyle(financial: string, fulfillment: string | null) {
  if (fulfillment === 'fulfilled') return { label: 'Delivered', color: 'bg-green-50 text-green-600 border-green-200', icon: CheckCircle };
  if (fulfillment === 'in_transit' || fulfillment === 'out_for_delivery') return { label: 'Shipped', color: 'bg-blue-50 text-blue-600 border-blue-200', icon: Truck };
  if (financial === 'paid') return { label: 'Processing', color: 'bg-amber-50 text-amber-600 border-amber-200', icon: Clock };
  if (financial === 'refunded') return { label: 'Refunded', color: 'bg-red-50 text-red-500 border-red-200', icon: X };
  return { label: 'Pending', color: 'bg-neutral-50 text-neutral-500 border-neutral-200', icon: Package };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string; sub: string; icon: typeof Package; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-black">{value}</p>
        <p className="text-sm font-semibold text-black">{label}</p>
        <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ─── LOGIN GATE ───────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');

  function handleSubmit() {
    if (pw === ADMIN_PASSWORD) { onLogin(); }
    else { setError('Incorrect password'); }
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#F16C10] flex items-center justify-center">
            <Lock size={18} className="text-white" />
          </div>
          <div>
            <p className="text-base font-bold text-black">Ostsome Admin</p>
            <p className="text-xs text-neutral-400">Orders Dashboard</p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-neutral-600 uppercase tracking-wide block mb-1.5">Password</label>
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Enter admin password"
              className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#F16C10] transition"
              autoFocus
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
          <button
            onClick={handleSubmit}
            className="w-full bg-[#F16C10] hover:bg-[#d65f0e] text-white font-bold py-3 rounded-xl transition text-sm"
          >
            Access Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
function Dashboard() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'processing' | 'shipped' | 'delivered' | 'refunded'>('all');
  const [dateFilter, setDateFilter] = useState<'today' | '7days' | '30days' | 'all'>('today');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  async function loadOrders() {
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      let created_at_min: string | undefined;
      if (dateFilter === 'today') {
        const start = new Date(now); start.setHours(0, 0, 0, 0);
        created_at_min = start.toISOString();
      } else if (dateFilter === '7days') {
        created_at_min = new Date(now.getTime() - 7 * 86400000).toISOString();
      } else if (dateFilter === '30days') {
        created_at_min = new Date(now.getTime() - 30 * 86400000).toISOString();
      }
      const data = await fetchAdminOrders({ created_at_min });
      setOrders(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError('Failed to load orders. Check your network connection.');
    }
    setLoading(false);
  }

  useEffect(() => { loadOrders(); }, [dateFilter]);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.name.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        (o.shipping_address?.name ?? '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter(o => {
        const s = getStatusStyle(o.financial_status, o.fulfillment_status).label.toLowerCase();
        return s === statusFilter;
      });
    }
    return list;
  }, [orders, search, statusFilter]);

  // Stats
  const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_price), 0);
  const processing = orders.filter(o => !o.fulfillment_status || o.fulfillment_status === 'partial').length;
  const shipped = orders.filter(o => o.fulfillment_status === 'in_transit' || o.fulfillment_status === 'out_for_delivery').length;
  const delivered = orders.filter(o => o.fulfillment_status === 'fulfilled').length;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-black">Orders Dashboard</h1>
          <p className="text-xs text-neutral-400">Last updated: {lastRefresh.toLocaleTimeString('en-SG')}</p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-neutral-200 rounded-xl hover:bg-neutral-50 transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Date filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['today', '7days', '30days', 'all'] as const).map(d => (
            <button
              key={d}
              onClick={() => setDateFilter(d)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${dateFilter === d ? 'bg-black text-white border-black' : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400'}`}
            >
              {d === 'today' ? 'Today' : d === '7days' ? 'Last 7 Days' : d === '30days' ? 'Last 30 Days' : 'All Time'}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Orders" value={String(orders.length)} sub={`${filtered.length} matching filters`} icon={ShoppingBag} color="bg-[#F16C10]/10 text-[#F16C10]" />
          <StatCard label="Revenue" value={`SGD ${totalRevenue.toFixed(0)}`} sub="All orders in period" icon={DollarSign} color="bg-green-50 text-green-600" />
          <StatCard label="Processing" value={String(processing)} sub="Awaiting fulfilment" icon={Clock} color="bg-amber-50 text-amber-600" />
          <StatCard label="Delivered" value={String(delivered)} sub={`${shipped} in transit`} icon={CheckCircle} color="bg-blue-50 text-blue-600" />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by order #, email, or customer name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-neutral-200 rounded-xl outline-none focus:border-[#F16C10] transition bg-white"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'processing', 'shipped', 'delivered', 'refunded'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition capitalize ${statusFilter === s ? 'bg-[#F16C10] border-[#F16C10] text-white' : 'bg-white border-neutral-200 text-neutral-600 hover:border-[#F16C10]'}`}
              >
                {s === 'all' ? 'All Status' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Orders count */}
        <p className="text-sm text-neutral-500 mb-4">
          Showing <span className="font-semibold text-black">{filtered.length}</span> of {orders.length} orders
        </p>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-[#F16C10] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-neutral-400">Loading orders from Shopify…</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-sm font-semibold text-red-600 mb-2">{error}</p>
            <button onClick={loadOrders} className="text-sm text-red-500 hover:underline">Try again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-neutral-100">
            <Package size={40} className="mx-auto text-neutral-200 mb-3" />
            <p className="text-base font-semibold text-neutral-400">No orders found</p>
            <p className="text-sm text-neutral-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(order => {
              const status = getStatusStyle(order.financial_status, order.fulfillment_status);
              const StatusIcon = status.icon;
              const isExpanded = expanded === order.id;
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-neutral-100 overflow-hidden hover:border-neutral-200 transition">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : order.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left"
                  >
                    {/* Status icon */}
                    <div className={`w-9 h-9 rounded-full border flex items-center justify-center shrink-0 ${status.color}`}>
                      <StatusIcon size={15} />
                    </div>

                    {/* Order info */}
                    <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <p className="text-sm font-bold text-black">{order.name}</p>
                        <p className="text-xs text-neutral-400">{formatDate(order.created_at)}</p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-xs font-semibold text-neutral-600">{order.shipping_address?.name ?? '—'}</p>
                        <p className="text-xs text-neutral-400 truncate">{order.email}</p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-xs text-neutral-400">{order.line_items.length} item{order.line_items.length !== 1 ? 's' : ''}</p>
                        <p className="text-xs text-neutral-400">{order.financial_status}</p>
                      </div>
                      <div className="text-right sm:text-left">
                        <p className="text-sm font-bold text-black">SGD {parseFloat(order.total_price).toFixed(2)}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {isExpanded ? <ChevronUp size={16} className="text-neutral-300 shrink-0" /> : <ChevronDown size={16} className="text-neutral-300 shrink-0" />}
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-neutral-100 bg-neutral-50 px-5 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-1">Customer</p>
                          <p className="text-sm font-semibold text-black">{order.shipping_address?.name ?? '—'}</p>
                          <p className="text-xs text-neutral-500">{order.email}</p>
                          {order.phone && <p className="text-xs text-neutral-500">{order.phone}</p>}
                        </div>
                        {order.shipping_address && (
                          <div>
                            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-1">Ship to</p>
                            <p className="text-sm text-neutral-600">{order.shipping_address.address1}</p>
                            <p className="text-sm text-neutral-600">{order.shipping_address.city} {order.shipping_address.zip}</p>
                            <p className="text-sm text-neutral-600">{order.shipping_address.country}</p>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-wide mb-2">Items</p>
                      <div className="flex flex-col gap-2">
                        {order.line_items.map(item => (
                          <div key={item.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-neutral-100">
                            <div>
                              <p className="text-sm font-semibold text-black">{item.title}</p>
                              {item.variant_title && item.variant_title !== 'Default Title' && (
                                <p className="text-xs text-neutral-400">{item.variant_title}</p>
                              )}
                              {item.vendor && <p className="text-xs text-[#F16C10] font-semibold">{item.vendor}</p>}
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-black">SGD {parseFloat(item.price).toFixed(2)}</p>
                              <p className="text-xs text-neutral-400">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end mt-3">
                        <a
                          href={`https://admin.shopify.com/store/outdoor-sports-travel/orders/${order.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#F16C10] font-semibold hover:underline"
                        >
                          View in Shopify Admin →
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────
export function AdminDashboard() {
  const [authed, setAuthed] = useState(() =>
    sessionStorage.getItem('ostsome_admin') === 'true'
  );

  function handleLogin() {
    sessionStorage.setItem('ostsome_admin', 'true');
    setAuthed(true);
  }

  if (!authed) return <AdminLogin onLogin={handleLogin} />;
  return <Dashboard />;
}