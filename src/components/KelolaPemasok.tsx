import { useEffect, useState, useCallback } from 'react';
import {
  Search, Save, X, AlertCircle, Check, Store,
  Edit3, Plus, Trash2, Star,
} from 'lucide-react';
import { supabase, type Supplier } from '@/lib/supabase';

type EditState = {
  id: string | null;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  category: string;
  rating: number;
};

const emptyForm: EditState = {
  id: null,
  name: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  category: '',
  rating: 4,
};

const supplierCategories = [
  'Sembako',
  'Kebutuhan Rumah Tangga',
  'Minuman',
  'Makanan Ringan',
  'Kesehatan & Kebersihan',
  'Pertanian & Peternakan',
  'Bangunan & Perkakas',
  'ATK & Lain-lain',
];

export function KelolaPemasok() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('suppliers').select('*').order('name');
      if (error) throw error;
      setSuppliers(data ?? []);
    } catch {
      setSuppliers([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = suppliers.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.contact_person?.toLowerCase().includes(q) || s.city?.toLowerCase().includes(q);
  });

  const startEdit = (s: Supplier) => {
    setEditing({
      id: s.id,
      name: s.name,
      contact_person: s.contact_person ?? '',
      phone: s.phone ?? '',
      email: s.email ?? '',
      address: s.address ?? '',
      city: s.city ?? '',
      category: s.category ?? '',
      rating: s.rating,
    });
    setMsg(null);
  };

  const startAdd = () => {
    setEditing({ ...emptyForm, category: supplierCategories[0] });
    setMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editing.name.trim()) {
      setMsg({ type: 'error', text: 'Nama pemasok harus diisi.' });
      return;
    }

    const payload = {
      name: editing.name.trim(),
      contact_person: editing.contact_person.trim() || null,
      phone: editing.phone.trim() || null,
      email: editing.email.trim() || null,
      address: editing.address.trim() || null,
      city: editing.city.trim() || null,
      category: editing.category || null,
      rating: editing.rating,
    };

    setSaving(true);
    try {
      if (editing.id) {
        const { error } = await supabase.from('suppliers').update(payload).eq('id', editing.id);
        if (error) throw error;
        setMsg({ type: 'success', text: 'Pemasok berhasil diperbarui.' });
        setEditing(null);
      } else {
        const { error } = await supabase.from('suppliers').insert(payload);
        if (error) throw error;
        setMsg({ type: 'success', text: 'Pemasok baru berhasil ditambahkan.' });
        setEditing(null);
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message ?? 'Gagal menyimpan data pemasok.' });
    }
    setSaving(false);
    loadData();
    setTimeout(() => setMsg(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pemasok ini?')) return;
    try {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      if (error) throw error;
      setMsg({ type: 'success', text: 'Pemasok berhasil dihapus.' });
      loadData();
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message ?? 'Gagal menghapus pemasok.' });
    }
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

      {!editing ? (
        <>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari pemasok..."
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
              Tambah Pemasok
            </button>
          </div>

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
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Kategori</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Kontak</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Kota</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{s.category ?? '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                          {s.contact_person ?? '-'}{s.phone ? ` · ${s.phone}` : ''}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">{s.city ?? '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < s.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => startEdit(s)} className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all" title="Edit">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all" title="Hapus">
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
              <Store className="w-5 h-5 text-red-600" />
              {editing.id ? 'Edit Pemasok' : 'Tambah Pemasok Baru'}
            </h3>
            <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className={labelClass}>Nama Pemasok *</label>
              <input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputClass} placeholder="Contoh: PT Sumber Pangan Sejahtera" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Kategori Pasokan</label>
                <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className={inputClass}>
                  <option value="">Pilih kategori</option>
                  {supplierCategories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Rating</label>
                <select value={editing.rating} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} className={inputClass}>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <option key={r} value={r}>{r} Bintang</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Kontak Person</label>
                <input type="text" value={editing.contact_person} onChange={(e) => setEditing({ ...editing, contact_person: e.target.value })} className={inputClass} placeholder="Nama kontak" />
              </div>
              <div>
                <label className={labelClass}>Telepon</label>
                <input type="text" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} className={inputClass} placeholder="08xx-xxxx-xxxx" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} className={inputClass} placeholder="email@perusahaan.com" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Alamat</label>
                <input type="text" value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} className={inputClass} placeholder="Jl. ..." />
              </div>
              <div>
                <label className={labelClass}>Kota</label>
                <input type="text" value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} className={inputClass} placeholder="Kota" />
              </div>
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
