import { useEffect, useState, useCallback } from 'react';
import {
  Search, Save, X, AlertCircle, Check, Receipt,
  Edit3, Plus, Trash2, FileSpreadsheet, Loader2, Upload,
} from 'lucide-react';
import { supabase, type Transaction, type Member, type Product } from '@/lib/supabase';
import { formatRupiah, formatShortDate } from '@/lib/format';

type EditState = {
  id: string | null;
  type: string;
  description: string;
  amount: string;
  member_id: string;
  product_id: string;
  quantity: string;
  transaction_date: string;
  status: string;
};

const todayStr = new Date().toISOString().split('T')[0];

const emptyForm: EditState = {
  id: null,
  type: 'penjualan',
  description: '',
  amount: '',
  member_id: '',
  product_id: '',
  quantity: '',
  transaction_date: todayStr,
  status: 'lunas',
};

const typeOptions = [
  { value: 'penjualan', label: 'Penjualan' },
  { value: 'pembelian', label: 'Pembelian' },
  { value: 'simpanan', label: 'Simpanan' },
  { value: 'pinjaman', label: 'Pinjaman' },
  { value: 'biaya_operasional', label: 'Biaya Operasional' },
];

const statusOptions = [
  { value: 'lunas', label: 'Lunas' },
  { value: 'pending', label: 'Pending' },
  { value: 'batal', label: 'Batal' },
];

export function KelolaTransaksi() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [trxRes, memRes, prodRes] = await Promise.all([
        supabase.from('transactions').select('*, member:members(*), product:products(*)').order('transaction_date', { ascending: false }).order('created_at', { ascending: false }),
        supabase.from('members').select('*').order('name'),
        supabase.from('products').select('*').order('name'),
      ]);
      setTransactions(trxRes.data ?? []);
      setMembers(memRes.data ?? []);
      setProducts(prodRes.data ?? []);
    } catch {
      // Supabase not configured or unreachable
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = transactions.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return t.description?.toLowerCase().includes(q) || t.member?.name?.toLowerCase().includes(q) || t.type.toLowerCase().includes(q);
  });

  const startEdit = (t: Transaction) => {
    setEditing({
      id: t.id,
      type: t.type,
      description: t.description ?? '',
      amount: String(t.amount),
      member_id: t.member_id ?? '',
      product_id: t.product_id ?? '',
      quantity: t.quantity ? String(t.quantity) : '',
      transaction_date: t.transaction_date,
      status: t.status,
    });
    setMsg(null);
  };

  const startAdd = () => {
    setEditing({ ...emptyForm });
    setMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editing.description.trim()) {
      setMsg({ type: 'error', text: 'Deskripsi transaksi harus diisi.' });
      return;
    }
    if (!editing.amount || Number(editing.amount) <= 0) {
      setMsg({ type: 'error', text: 'Jumlah harus lebih dari 0.' });
      return;
    }

    const payload = {
      type: editing.type,
      description: editing.description.trim(),
      amount: Number(editing.amount),
      member_id: editing.member_id || null,
      product_id: editing.product_id || null,
      quantity: editing.quantity ? Number(editing.quantity) : null,
      transaction_date: editing.transaction_date,
      status: editing.status,
    };

    setSaving(true);
    try {
      if (editing.id) {
        const { error } = await supabase.from('transactions').update(payload).eq('id', editing.id);
        if (error) throw error;
        setMsg({ type: 'success', text: 'Transaksi berhasil diperbarui.' });
        setEditing(null);
      } else {
        const { error } = await supabase.from('transactions').insert(payload);
        if (error) throw error;
        setMsg({ type: 'success', text: 'Transaksi baru berhasil ditambahkan.' });
        setEditing(null);
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message ?? 'Gagal menyimpan data transaksi.' });
    }
    setSaving(false);
    loadData();
    setTimeout(() => setMsg(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus transaksi ini?')) return;
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      setMsg({ type: 'success', text: 'Transaksi berhasil dihapus.' });
      loadData();
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message ?? 'Gagal menghapus transaksi.' });
    }
  };

  // ===== GOOGLE SHEETS SYNC =====
  // Fungsi ini mengirim semua data transaksi ke Google Spreadsheet
  // melalui Supabase Edge Function.
  // Pastikan Anda sudah mengisi kredensial Google Sheets di edge function.
  const handleSyncToSheets = async () => {
    setSyncing(true);
    setSyncMsg(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const apiUrl = `${supabaseUrl}/functions/v1/sync-google-sheets`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ action: 'sync_transactions' }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gagal sync (${response.status}): ${errText}`);
      }

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      setSyncMsg({ type: 'success', text: `Berhasil! ${result.synced ?? transactions.length} transaksi tersinkron ke Google Spreadsheet.` });
      setTimeout(() => setSyncMsg(null), 5000);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Terjadi kesalahan saat sinkronisasi.';
      setSyncMsg({ type: 'error', text: errMsg });
    } finally {
      setSyncing(false);
    }
  };

  const typeLabels: Record<string, string> = {
    penjualan: 'Penjualan',
    pembelian: 'Pembelian',
    simpanan: 'Simpanan',
    pinjaman: 'Pinjaman',
    biaya_operasional: 'Biaya Operasional',
  };

  const statusColors: Record<string, string> = {
    lunas: 'bg-emerald-50 text-emerald-700',
    pending: 'bg-amber-50 text-amber-700',
    batal: 'bg-red-50 text-red-700',
  };

  const inputClass = 'w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm';
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1';

  return (
    <div>
      {msg && (
        <div className={`mb-4 flex items-center gap-2 p-3 rounded-xl text-sm ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {msg.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {msg.text}
        </div>
      )}

      {syncMsg && (
        <div className={`mb-4 flex items-start gap-2 p-3 rounded-xl text-sm ${syncMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {syncMsg.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
          <span className="flex-1">{syncMsg.text}</span>
        </div>
      )}

      {!editing ? (
        <>
          {/* Google Sheets Sync Banner */}
          <div className="mb-4 bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
                  <FileSpreadsheet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Sinkronisasi Google Spreadsheet</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Kirim semua data transaksi ke Google Spreadsheet untuk pencatatan eksternal
                  </p>
                </div>
              </div>
              <button
                onClick={handleSyncToSheets}
                disabled={syncing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm"
              >
                {syncing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyinkronkan...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Sync ke Spreadsheet
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
            </div>
            <button
              onClick={startAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              Tambah Transaksi
            </button>
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterType === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Semua Jenis
            </button>
            {typeOptions.map((t) => (
              <button
                key={t.value}
                onClick={() => setFilterType(t.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterType === t.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Transaction Table */}
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse h-14" />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jenis</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deskripsi</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Anggota</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jumlah</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{formatShortDate(t.transaction_date)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{typeLabels[t.type] ?? t.type}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 max-w-xs">
                          <div className="truncate">{t.description}</div>
                          {t.quantity && <span className="text-xs text-gray-400">x{t.quantity}</span>}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{t.member?.name ?? '-'}</td>
                        <td className="px-4 py-3 text-sm text-right whitespace-nowrap font-semibold text-gray-900">{formatRupiah(Number(t.amount))}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[t.status] ?? 'bg-gray-100 text-gray-600'}`}>
                              {t.status === 'lunas' ? 'Lunas' : t.status === 'pending' ? 'Pending' : 'Batal'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => startEdit(t)} className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all" title="Edit">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all" title="Hapus">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-red-600" />
              {editing.id ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
            </h3>
            <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Jenis Transaksi *</label>
                <select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })} className={inputClass}>
                  {typeOptions.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className={inputClass}>
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Deskripsi *</label>
              <input type="text" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inputClass} placeholder="Contoh: Penjualan Beras Premium 5kg" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Jumlah (Rp) *</label>
                <input type="number" value={editing.amount} onChange={(e) => setEditing({ ...editing, amount: e.target.value })} className={inputClass} placeholder="0" min="0" />
              </div>
              <div>
                <label className={labelClass}>Tanggal</label>
                <input type="date" value={editing.transaction_date} onChange={(e) => setEditing({ ...editing, transaction_date: e.target.value })} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Anggota (opsional)</label>
                <select value={editing.member_id} onChange={(e) => setEditing({ ...editing, member_id: e.target.value })} className={inputClass}>
                  <option value="">Tanpa anggota</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.member_number} - {m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Produk (opsional)</label>
                <select value={editing.product_id} onChange={(e) => setEditing({ ...editing, product_id: e.target.value })} className={inputClass}>
                  <option value="">Tanpa produk</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Jumlah Barang (opsional)</label>
              <input type="number" value={editing.quantity} onChange={(e) => setEditing({ ...editing, quantity: e.target.value })} className={inputClass} placeholder="Kosongkan jika tidak ada" min="0" />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-all">
                <Save className="w-4 h-4" />
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button type="button" onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all">
                Batal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
