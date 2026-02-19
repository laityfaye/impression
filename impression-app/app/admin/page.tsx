'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Printer,
  LogOut,
  ShoppingBag,
  Loader2,
  TrendingUp,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  PackageCheck,
  Truck,
  Eye,
  Download,
  Search,
  ChevronDown,
  Users,
  Banknote,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

type OrderStatus = 'pending' | 'processing' | 'ready' | 'delivered';

interface StoredOrder {
  id: string;
  orderNumber: string;
  document: { name: string; pageCount: number; hasIssues: boolean; savedFileName?: string };
  client: { name: string; phone: string } | null;
  correctionService: boolean;
  finishing: string | null;
  delivery: string | null;
  selectedInstitute: string | null;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { label: string; badge: string; dot: string; icon: React.ReactNode }> = {
  pending:    { label: 'En attente',  badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',   dot: 'bg-amber-400',  icon: <Clock className="w-3.5 h-3.5" /> },
  processing: { label: 'En cours',   badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',       dot: 'bg-blue-500',   icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> },
  ready:      { label: 'Prêt',       badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500', icon: <PackageCheck className="w-3.5 h-3.5" /> },
  delivered:  { label: 'Livré',      badge: 'bg-gray-100 text-gray-500 ring-1 ring-gray-200',      dot: 'bg-gray-400',   icon: <Truck className="w-3.5 h-3.5" /> },
};

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending',    label: 'En attente' },
  { value: 'processing', label: 'En cours' },
  { value: 'ready',      label: 'Prêt' },
  { value: 'delivered',  label: 'Livré' },
];

const FILTER_OPTIONS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all',        label: 'Toutes' },
  { value: 'pending',    label: 'En attente' },
  { value: 'processing', label: 'En cours' },
  { value: 'ready',      label: 'Prêt' },
  { value: 'delivered',  label: 'Livré' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function finishingLabel(f: string | null) {
  if (f === 'reliure') return 'Reliure spirale';
  if (f === 'livre') return 'Format Livre';
  if (f === 'agraphage') return 'Agraphage';
  return 'Aucune';
}

function deliveryLabel(d: string | null) {
  if (d === 'partner') return 'Institut partenaire';
  if (d === 'other') return 'Autre client';
  return '—';
}

function getInitials(name: string) {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

// ── Toast ─────────────────────────────────────────────────────────────────────

interface Toast { id: number; message: string; type: 'success' | 'error'; }

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);
  return { toasts, show };
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const router = useRouter();
  const { toasts, show: showToast } = useToast();

  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const ordRes = await fetch('/api/admin/orders');
      if (ordRes.ok) setOrders(await ordRes.json());
    } catch {
      showToast('Erreur lors du chargement', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingStatus(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
        showToast('Statut mis à jour');
      } else {
        const data = await res.json();
        showToast(data.error ?? 'Erreur de mise à jour', 'error');
      }
    } catch {
      showToast('Erreur réseau', 'error');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalRevenue = orders.reduce((s, o) => s + o.totalPrice, 0);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;
  const processingCount = orders.filter((o) => o.status === 'processing').length;

  // ── Filtered orders ────────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = filterStatus === 'all' || o.status === filterStatus;
      const q = search.toLowerCase();
      const matchSearch = !q
        || o.orderNumber.includes(q)
        || o.client?.name.toLowerCase().includes(q)
        || o.client?.phone.includes(q)
        || o.document.name.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [orders, search, filterStatus]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium pointer-events-auto backdrop-blur-sm ${
              t.type === 'success'
                ? 'bg-emerald-600/95 text-white'
                : 'bg-red-600/95 text-white'
            }`}
          >
            {t.type === 'success'
              ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            {t.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-2xl flex items-center justify-center ring-1 ring-white/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight">ImpressionPro</span>
                <span className="text-xs font-bold bg-blue-500/40 border border-blue-400/30 text-blue-100 px-2.5 py-0.5 rounded-full">
                  Admin
                </span>
              </div>
              <span className="text-blue-300 text-xs hidden sm:block">Tableau de bord</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              title="Actualiser"
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-sm font-semibold hover:scale-105 active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<ShoppingBag className="w-5 h-5" />}
            label="Total commandes"
            value={orders.length.toString()}
            sub={`${processingCount} en cours`}
            color="blue"
          />
          <StatCard
            icon={<Banknote className="w-5 h-5" />}
            label="Chiffre d'affaires"
            value={formatPrice(totalRevenue)}
            sub="Total cumulé"
            color="green"
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="En attente"
            value={pendingCount.toString()}
            sub="À traiter"
            color="amber"
          />
          <StatCard
            icon={<PackageCheck className="w-5 h-5" />}
            label="Prêts"
            value={readyCount.toString()}
            sub="À livrer"
            color="emerald"
          />
        </div>

        {/* Orders section */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Section header */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-sm">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base">Commandes</h2>
                  <p className="text-xs text-gray-400">
                    {filteredOrders.length} / {orders.length} commande{orders.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Search + filter */}
              <div className="flex items-center gap-2 flex-1 sm:flex-none sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 placeholder-gray-400 transition-all"
                  />
                </div>
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'all')}
                    className="appearance-none pl-3 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 text-gray-700 cursor-pointer transition-all"
                  >
                    {FILTER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <SkeletonRows />
          ) : filteredOrders.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag className="w-10 h-10 text-gray-200" />}
              title={orders.length === 0 ? 'Aucune commande' : 'Aucun résultat'}
              subtitle={orders.length === 0 ? 'Les commandes apparaîtront ici.' : 'Essayez de modifier vos filtres.'}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">N°</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Client</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Document</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Finition</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Livraison</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Statut</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Montant</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.map((order) => {
                    const st = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                    const isUpdating = updatingStatus === order.id;
                    return (
                      <tr key={order.id} className="hover:bg-blue-50/30 transition-colors group">

                        {/* N° commande */}
                        <td className="px-5 py-4">
                          <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg whitespace-nowrap">
                            #{order.orderNumber}
                          </span>
                        </td>

                        {/* Client */}
                        <td className="px-5 py-4">
                          {order.client ? (
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-bold">{getInitials(order.client.name)}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate max-w-[120px]">{order.client.name}</p>
                                <p className="text-xs text-gray-400">{order.client.phone}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <Users className="w-4 h-4 text-gray-400" />
                              </div>
                              <span className="text-sm text-gray-400">Anonyme</span>
                            </div>
                          )}
                        </td>

                        {/* Document */}
                        <td className="px-5 py-4 hidden md:table-cell">
                          <div className="flex items-start gap-2">
                            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                              <FileText className="w-4 h-4 text-red-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm text-gray-700 font-medium truncate max-w-[130px]">{order.document.name}</p>
                              <p className="text-xs text-gray-400">{order.document.pageCount} pages</p>
                              {order.document.savedFileName && (
                                <div className="flex items-center gap-1 mt-1.5">
                                  <a
                                    href={`/api/admin/download/${order.document.savedFileName}?view=1`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                                    title="Ouvrir"
                                  >
                                    <Eye className="w-3 h-3" />
                                    Voir
                                  </a>
                                  <a
                                    href={`/api/admin/download/${order.document.savedFileName}`}
                                    download
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg transition-colors"
                                    title="Télécharger"
                                  >
                                    <Download className="w-3 h-3" />
                                    DL
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Finition */}
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <span className="text-sm text-gray-600">{finishingLabel(order.finishing)}</span>
                        </td>

                        {/* Livraison */}
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <span className="text-sm text-gray-600">{deliveryLabel(order.delivery)}</span>
                        </td>

                        {/* Statut */}
                        <td className="px-5 py-4">
                          <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full ${st.badge} mb-2`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot} flex-shrink-0`} />
                            {st.label}
                            {isUpdating && <Loader2 className="w-3 h-3 animate-spin ml-0.5" />}
                          </div>
                          <div className="relative">
                            <select
                              value={order.status}
                              disabled={isUpdating}
                              onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                              className="appearance-none w-full text-xs border border-gray-200 rounded-lg pl-2.5 pr-6 py-1.5 bg-white text-gray-600 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 disabled:opacity-50 cursor-pointer transition-all hover:border-gray-300"
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                          </div>
                        </td>

                        {/* Montant */}
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                            {formatPrice(order.totalPrice)}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(order.createdAt)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  icon, label, value, sub, color,
}: {
  icon: React.ReactNode; label: string; value: string; sub: string;
  color: 'blue' | 'green' | 'amber' | 'emerald';
}) {
  const colors = {
    blue:    { bg: 'bg-blue-500',    light: 'bg-blue-50',    text: 'text-blue-600' },
    green:   { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600' },
    amber:   { bg: 'bg-amber-500',   light: 'bg-amber-50',   text: 'text-amber-600' },
    emerald: { bg: 'bg-teal-500',    light: 'bg-teal-50',    text: 'text-teal-600' },
  };
  const c = colors[color];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-2xl ${c.light} flex items-center justify-center flex-shrink-0`}>
        <span className={c.text}>{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-400 font-medium truncate">{label}</p>
        <p className="text-xl font-extrabold text-gray-900 truncate leading-tight">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {sub}
        </p>
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="divide-y divide-gray-50">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
          <div className="w-16 h-6 bg-gray-100 rounded-lg" />
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 bg-gray-100 rounded-full" />
            <div className="space-y-1.5">
              <div className="w-24 h-3 bg-gray-100 rounded" />
              <div className="w-16 h-2.5 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="hidden md:block w-32 h-4 bg-gray-100 rounded" />
          <div className="w-20 h-6 bg-gray-100 rounded-full ml-auto" />
          <div className="w-16 h-4 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="mb-4">{icon}</div>
      <p className="text-base font-semibold text-gray-400">{title}</p>
      <p className="text-sm text-gray-300 mt-1">{subtitle}</p>
    </div>
  );
}
