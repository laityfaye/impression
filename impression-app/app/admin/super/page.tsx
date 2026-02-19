'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Printer,
  LogOut,
  Building2,
  ShoppingBag,
  Trash2,
  Plus,
  X,
  Loader2,
  TrendingUp,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  Eye,
  Download,
} from 'lucide-react';

interface Institute {
  id: string;
  name: string;
  createdAt: string;
}

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
  status: string;
  createdAt: string;
}

function formatPrice(amount: number) {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function finishingLabel(f: string | null) {
  if (f === 'reliure') return 'Reliure spirale';
  if (f === 'livre') return 'Format Livre';
  return 'Aucune';
}

function deliveryLabel(d: string | null) {
  if (d === 'partner') return 'Institut partenaire';
  if (d === 'other') return 'Autre client';
  return '—';
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending:    { label: 'En attente',  cls: 'bg-amber-100 text-amber-700' },
  processing: { label: 'En cours',   cls: 'bg-blue-100 text-blue-700' },
  ready:      { label: 'Prêt',       cls: 'bg-green-100 text-green-700' },
  delivered:  { label: 'Livré',      cls: 'bg-gray-100 text-gray-600' },
};

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

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { toasts, show: showToast } = useToast();

  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const [deletingInstitute, setDeletingInstitute] = useState<string | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null);
  const [confirmInstitute, setConfirmInstitute] = useState<string | null>(null);
  const [confirmOrder, setConfirmOrder] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [instRes, ordRes] = await Promise.all([
        fetch('/api/admin/institutes'),
        fetch('/api/admin/orders'),
      ]);
      if (instRes.ok) setInstitutes(await instRes.json());
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

  const handleAddInstitute = async () => {
    if (!newName.trim()) return;
    setAddLoading(true);
    try {
      const res = await fetch('/api/admin/institutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setInstitutes((prev) => [...prev, data]);
        setNewName('');
        setShowAddForm(false);
        showToast('Institut ajouté avec succès');
      } else {
        showToast(data.error ?? "Erreur lors de l'ajout", 'error');
      }
    } catch {
      showToast('Erreur réseau', 'error');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteInstitute = async (id: string) => {
    setDeletingInstitute(id);
    setConfirmInstitute(null);
    try {
      const res = await fetch(`/api/admin/institutes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setInstitutes((prev) => prev.filter((i) => i.id !== id));
        showToast('Institut supprimé');
      } else {
        const data = await res.json();
        showToast(data.error ?? 'Erreur lors de la suppression', 'error');
      }
    } catch {
      showToast('Erreur réseau', 'error');
    } finally {
      setDeletingInstitute(null);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    setDeletingOrder(id);
    setConfirmOrder(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
        showToast('Commande supprimée');
      } else {
        const data = await res.json();
        showToast(data.error ?? 'Erreur lors de la suppression', 'error');
      }
    } catch {
      showToast('Erreur réseau', 'error');
    } finally {
      setDeletingOrder(null);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
              t.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {t.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {t.message}
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-purple-900 to-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg">ImpressionPro</span>
                <span className="flex items-center gap-1 text-xs font-semibold bg-purple-500/30 border border-purple-400/40 text-purple-200 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  Super Admin
                </span>
              </div>
              <span className="text-purple-300 text-xs hidden sm:block">Tableau de bord Super Administrateur</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm"
              title="Aller au tableau de bord admin"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Tableau Admin</span>
            </button>
            <button
              onClick={fetchData}
              title="Actualiser"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard icon={<ShoppingBag className="w-5 h-5" />} label="Total commandes" value={orders.length.toString()} color="blue" />
          <StatCard icon={<TrendingUp className="w-5 h-5" />} label="Chiffre d'affaires" value={formatPrice(totalRevenue)} color="green" />
          <StatCard icon={<Building2 className="w-5 h-5" />} label="Instituts partenaires" value={institutes.length.toString()} color="purple" />
        </div>

        {/* Institutes section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-700" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Instituts partenaires</h2>
                <p className="text-xs text-gray-500">{institutes.length} établissement{institutes.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={() => { setShowAddForm(!showAddForm); setNewName(''); }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showAddForm ? 'Annuler' : 'Ajouter'}
            </button>
          </div>

          {showAddForm && (
            <div className="px-6 py-4 bg-purple-50 border-b border-purple-100">
              <p className="text-sm font-medium text-purple-800 mb-2">Nouvel institut partenaire</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddInstitute()}
                  placeholder="Ex : ENSPT - École Nationale Supérieure Polytechnique de Thiès"
                  autoFocus
                  className="flex-1 px-4 py-2.5 rounded-xl border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-sm bg-white"
                />
                <button
                  onClick={handleAddInstitute}
                  disabled={addLoading || !newName.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  {addLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Ajouter
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <LoadingRows />
          ) : institutes.length === 0 ? (
            <EmptyState icon={<Building2 className="w-8 h-8 text-gray-300" />} message="Aucun institut partenaire" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Établissement</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Date d&apos;ajout</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {institutes.map((inst, i) => (
                    <tr key={inst.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-400 font-mono">{i + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-3.5 h-3.5 text-purple-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-800">{inst.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">{formatDate(inst.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        {confirmInstitute === inst.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-gray-500">Confirmer ?</span>
                            <button
                              onClick={() => handleDeleteInstitute(inst.id)}
                              disabled={deletingInstitute === inst.id}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg disabled:opacity-60"
                            >
                              {deletingInstitute === inst.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Supprimer'}
                            </button>
                            <button onClick={() => setConfirmInstitute(null)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg">
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmInstitute(inst.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors ml-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Supprimer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Orders section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Commandes</h2>
                <p className="text-xs text-gray-500">{orders.length} commande{orders.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingRows />
          ) : orders.length === 0 ? (
            <EmptyState icon={<ShoppingBag className="w-8 h-8 text-gray-300" />} message="Aucune commande" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">N°</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Document</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Finition</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Livraison</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Statut</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Montant</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => {
                    const st = STATUS_MAP[order.status] ?? STATUS_MAP.pending;
                    return (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-lg">#{order.orderNumber}</span>
                        </td>
                        <td className="px-4 py-4">
                          {order.client ? (
                            <div>
                              <p className="text-sm font-medium text-gray-800">{order.client.name}</p>
                              <p className="text-xs text-gray-500">{order.client.phone}</p>
                            </div>
                          ) : <span className="text-sm text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                              <p className="text-sm text-gray-700 truncate max-w-[140px]">{order.document.name}</p>
                              <p className="text-xs text-gray-500 mb-1.5">{order.document.pageCount} pages</p>
                              {order.document.savedFileName && (
                                <div className="flex items-center gap-1">
                                  <a
                                    href={`/api/admin/download/${order.document.savedFileName}?view=1`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium rounded-lg transition-colors"
                                    title="Ouvrir le document"
                                  >
                                    <Eye className="w-3 h-3" />
                                    Voir
                                  </a>
                                  <a
                                    href={`/api/admin/download/${order.document.savedFileName}`}
                                    download
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg transition-colors"
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
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <span className="text-sm text-gray-600">{finishingLabel(order.finishing)}</span>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <span className="text-sm text-gray-600">{deliveryLabel(order.delivery)}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{formatPrice(order.totalPrice)}</span>
                        </td>
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <span className="text-xs text-gray-500 whitespace-nowrap">{formatDate(order.createdAt)}</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {confirmOrder === order.id ? (
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => handleDeleteOrder(order.id)} disabled={deletingOrder === order.id} className="px-2 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg disabled:opacity-60">
                                {deletingOrder === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Oui'}
                              </button>
                              <button onClick={() => setConfirmOrder(null)} className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg">
                                Non
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmOrder(order.id)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors" title="Supprimer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: 'blue' | 'green' | 'purple' }) {
  const colors = { blue: 'bg-blue-100 text-blue-700', green: 'bg-green-100 text-green-700', purple: 'bg-purple-100 text-purple-700' };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-extrabold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="flex items-center justify-center py-12 text-gray-400">
      <Loader2 className="w-6 h-6 animate-spin mr-2" />
      <span className="text-sm">Chargement...</span>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
      {icon}
      <p className="text-sm">{message}</p>
    </div>
  );
}
