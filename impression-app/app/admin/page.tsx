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
  ShieldCheck,
  X,
} from 'lucide-react';
import Link from 'next/link';

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
  copies?: number;
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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [institutes, setInstitutes] = useState<{ id: string; name: string }[]>([]);
  const [countdown, setCountdown] = useState(120);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [ordRes, instRes] = await Promise.all([
        fetch('/api/admin/orders'),
        fetch('/api/institutes'),
      ]);
      if (ordRes.ok) {
        setOrders(await ordRes.json());
        setLastUpdated(new Date());
      }
      if (instRes.ok) setInstitutes(await instRes.json());
    } catch {
      showToast('Erreur lors du chargement', 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh toutes les 2 minutes avec compteur
  useEffect(() => {
    let secs = 120;
    setCountdown(120);
    const tick = setInterval(() => {
      secs -= 1;
      if (secs <= 0) { secs = 120; fetchData(true); }
      setCountdown(secs);
    }, 1000);
    return () => clearInterval(tick);
  }, [fetchData]);

  const hasActiveFilters = search.trim() !== '' || filterStatus !== 'all';
  const clearFilters = () => { setSearch(''); setFilterStatus('all'); };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearch('');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/80">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none max-w-[90vw] sm:max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto border ${
              t.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500/30'
                : 'bg-red-600 text-white border-red-500/30'
            }`}
          >
            {t.type === 'success'
              ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="bg-gradient-to-br from-slate-800 via-slate-800 to-indigo-900 text-white shadow-lg sticky top-0 z-40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center ring-1 ring-white/10 shadow-inner flex-shrink-0">
                <Printer className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-lg tracking-tight text-white">Tableau de bord</span>
                  <span className="text-xs font-semibold bg-indigo-500/80 text-indigo-100 px-2.5 py-1 rounded-full border border-indigo-400/30">
                    Admin
                  </span>
                  <Link
                    href="/admin/super"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors"
                    title="Super Admin"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Super Admin
                  </Link>
                </div>
                <p className="text-slate-400 text-xs mt-0.5 hidden sm:block">
                  {lastUpdated
                    ? `Mis à jour à ${lastUpdated.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · `
                    : ''}
                  Actualisation dans {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => fetchData()}
                disabled={loading}
                title="Actualiser les commandes"
                aria-label="Actualiser"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-70 transition-all hover:scale-105 active:scale-95"
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

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
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">

          {/* Section header */}
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-gray-900 text-lg">Commandes</h2>
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-700">{filteredOrders.length}</span>
                    {' / '}{orders.length} commande{orders.length !== 1 ? 's' : ''}
                    {hasActiveFilters && (
                      <span className="text-amber-600 ml-1">· filtres actifs</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Search + filter + clear */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[180px] sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="search"
                    placeholder="N°, client, document..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Rechercher une commande"
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 placeholder-gray-400 transition-all"
                  />
                </div>
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as OrderStatus | 'all')}
                    aria-label="Filtrer par statut"
                    className="appearance-none pl-4 pr-9 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-gray-700 cursor-pointer transition-all min-w-[140px]"
                  >
                    {FILTER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Effacer
                  </button>
                )}
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
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full min-w-[800px]">
                <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">N°</th>
                    <th className="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-14">Ex.</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Document</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Finition</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Livraison</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => {
                    const st = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                    const isUpdating = updatingStatus === order.id;
                    return (
                      <tr key={order.id} className="hover:bg-indigo-50/50 transition-colors group">

                        {/* N° commande */}
                        <td className="px-5 py-4">
                          <span className="text-xs font-mono font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1.5 rounded-lg whitespace-nowrap ring-1 ring-indigo-100">
                            #{order.orderNumber}
                          </span>
                        </td>

                        {/* Exemplaires */}
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[2rem] text-sm font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded-lg">
                            {order.copies ?? 1}
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
                                <div className="flex items-center gap-1.5 mt-1.5">
                                  <a
                                    href={`/api/admin/download/${order.document.savedFileName}?view=1`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors"
                                    title="Ouvrir le document"
                                  >
                                    <Eye className="w-3 h-3" />
                                    Voir
                                  </a>
                                  <a
                                    href={`/api/admin/download/${order.document.savedFileName}`}
                                    download
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg transition-colors"
                                    title="Télécharger le document"
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
                          {order.delivery === 'partner' && order.selectedInstitute && (
                            <p className="text-xs text-blue-600 mt-0.5">
                              {institutes.find((i) => i.id === order.selectedInstitute)?.name ?? order.selectedInstitute}
                            </p>
                          )}
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
                              aria-label={`Changer le statut de la commande ${order.orderNumber}`}
                              className="appearance-none w-full min-w-[120px] text-xs border border-gray-200 rounded-lg pl-2.5 pr-7 py-2 bg-white text-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50 cursor-pointer transition-all hover:border-gray-300"
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
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
    blue:    { light: 'bg-blue-50',    text: 'text-blue-600',  ring: 'ring-blue-100' },
    green:   { light: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
    amber:   { light: 'bg-amber-50',   text: 'text-amber-600',   ring: 'ring-amber-100' },
    emerald: { light: 'bg-teal-50',    text: 'text-teal-600',    ring: 'ring-teal-100' },
  };
  const c = colors[color];
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:border-gray-200 transition-all">
      <div className={`w-12 h-12 rounded-2xl ${c.light} ring-2 ${c.ring} flex items-center justify-center flex-shrink-0`}>
        <span className={c.text}>{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 font-medium truncate">{label}</p>
        <p className="text-xl font-extrabold text-gray-900 truncate leading-tight mt-0.5">{value}</p>
        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <TrendingUp className="w-3 h-3 flex-shrink-0" />
          {sub}
        </p>
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="divide-y divide-gray-100">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
          <div className="w-20 h-7 bg-gray-100 rounded-lg" />
          <div className="w-10 h-7 bg-gray-100 rounded-lg flex-shrink-0" />
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-9 h-9 bg-gray-100 rounded-full flex-shrink-0" />
            <div className="space-y-2 min-w-0">
              <div className="w-28 h-3.5 bg-gray-100 rounded" />
              <div className="w-20 h-2.5 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="hidden md:block w-36 h-4 bg-gray-100 rounded flex-shrink-0" />
          <div className="hidden lg:block w-24 h-4 bg-gray-100 rounded flex-shrink-0" />
          <div className="hidden lg:block w-28 h-4 bg-gray-100 rounded flex-shrink-0" />
          <div className="w-24 h-8 bg-gray-100 rounded-full flex-shrink-0" />
          <div className="w-20 h-5 bg-gray-100 rounded flex-shrink-0" />
          <div className="hidden sm:block w-24 h-3 bg-gray-100 rounded flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-5 text-gray-300">
        {icon}
      </div>
      <p className="text-base font-semibold text-gray-500">{title}</p>
      <p className="text-sm text-gray-400 mt-1.5 max-w-sm">{subtitle}</p>
    </div>
  );
}
