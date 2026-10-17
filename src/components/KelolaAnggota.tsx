import { useEffect, useState, useCallback } from 'react';
import {
  Search, Save, X, AlertCircle, Check, Users,
  Edit3, Plus, Trash2,
} from 'lucide-react';
import { supabase, type Member } from '@/lib/supabase';
import { formatRupiah, formatDate } from '@/lib/format';

type EditState = {
  id: string | null;
  member_number: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  join_date: string;
  status: string;
  simpanan_pokok: string;
  simpanan_wajib: string;
  simpanan_sukarela: string;
};

const todayStr = new Date().toISOString().split('T')[0];

const emptyForm: EditState = {
  id: null,
  member_number: '',
  name: '',
  phone: '',
  email: '',
  address: '',
  join_date: todayStr,
  status: 'aktif',
  simpanan_pokok: '500000',
  simpanan_wajib: '0',
  simpanan_sukarela: '0',
};

export function KelolaAnggota() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('members').select('*').order('member_number');
      if (error) throw error;
      setMembers(data ?? []);
    } catch {
      setMembers([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = members.filter((m) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return m.name.toLowerCase().includes(q) || m.member_number.toLowerCase().includes(q) || m.phone?.toLowerCase().includes(q);
  });

  const startEdit = (m: Member) => {
    setEditing({
      id: m.id,
      member_number: m.member_number,
      name: m.name,
      phone: m.phone ?? '',
      email: m.email ?? '',
      address: m.address ?? '',
      join_date: m.join_date,
      status: m.status,
      simpanan_pokok: String(m.simpanan_pokok),
      simpanan_wajib: String(m.simpanan_wajib),
      simpanan_sukarela: String(m.simpanan_sukarela),
    });
    setMsg(null);
  };

  const startAdd = () => {
    const nextNum = members.length > 0
      ? `KDMP-${String(Math.max(...members.map((m) => parseInt(m.member_number.replace('KDMP-', ''), 10) || 0)) + 1).padStart(3, '0')}`
      : 'KDMP-001';
    setEditing({ ...emptyForm, member_number: nextNum });
    setMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editing.name.trim()) {
      setMsg({ type: 'error', text: 'Nama anggota harus diisi.' });
      return;
    }
    if (!editing.member_number.trim()) {
      setMsg({ type: 'error', text: 'Nomor anggota harus diisi.' });
      return;
    }

    const payload = {
      member_number: editing.member_number.trim(),
      name: editing.name.trim(),
      phone: editing.phone.trim() || null,
      email: editing.email.trim() || null,
      address: editing.address.trim() || null,
      join_date: editing.join_date,
      status: editing.status,
      simpanan_pokok: Number(editing.simpanan_pokok) || 0,
      simpanan_wajib: Number(editing.simpanan_wajib) || 0,
      simpanan_sukarela: Number(editing.simpanan_sukarela) || 0,
    };

    setSaving(true);
    try {
      if (editing.id) {
        const { error } = await supabase.from('members').update(payload).eq('id', editing.id);
        if (error) throw error;
        setMsg({ type: 'success', text: 'Data anggota berhasil diperbarui.' });
        setEditing(null);
      } else {
        const { error } = await supabase.from('members').insert(payload);
        if (error) throw error;
        setMsg({ type: 'success', text: 'Anggota baru berhasil ditambahkan.' });
        setEditing(null);
      }
    } catch (err: any) {
      const code = err?.code ?? '';
      setMsg({ type: 'error', text: code === '23505' ? 'Nomor anggota sudah digunakan.' : (err?.message ?? 'Gagal menyimpan data anggota.') });
    }
    setSaving(false);
    loadData();
    setTimeout(() => setMsg(null), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus anggota ini?')) return;
    try {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if (error) throw error;
      setMsg({ type: 'success', text: 'Anggota berhasil dihapus.' });
      loadData();
      setTimeout(() => setMsg(null), 3000);
    } catch (err: any) {
      setMsg({ type: 'error', text: err?.message ?? 'Gagal menghapus anggota.' });
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
                placeholder="Cari anggota..."
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
              Tambah Anggota
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
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">No. Anggota</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Telepon</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Bergabung</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Total Simpanan</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{m.member_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{m.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{m.phone ?? '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{formatDate(m.join_date)}</td>
                        <td className="px-4 py-3 text-sm text-right whitespace-nowrap hidden lg:table-cell font-medium text-gray-700">
                          {formatRupiah(m.simpanan_pokok + m.simpanan_wajib + m.simpanan_sukarela)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${m.status === 'aktif' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                              {m.status === 'aktif' ? 'Aktif' : 'Non-Aktif'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => startEdit(m)} className="p-1.5 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all" title="Edit">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all" title="Hapus">
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
              <Users className="w-5 h-5 text-red-600" />
              {editing.id ? 'Edit Anggota' : 'Tambah Anggota Baru'}
            </h3>
            <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nomor Anggota *</label>
                <input type="text" value={editing.member_number} onChange={(e) => setEditing({ ...editing, member_number: e.target.value })} className={inputClass} placeholder="KDMP-001" />
              </div>
              <div>
                <label className={labelClass}>Nama Lengkap *</label>
                <input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputClass} placeholder="Nama anggota" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Telepon</label>
                <input type="text" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} className={inputClass} placeholder="08xx-xxxx-xxxx" />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} className={inputClass} placeholder="email@contoh.com" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Alamat</label>
              <input type="text" value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} className={inputClass} placeholder="RT/RW, Desa" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tanggal Bergabung</label>
                <input type="date" value={editing.join_date} onChange={(e) => setEditing({ ...editing, join_date: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className={inputClass}>
                  <option value="aktif">Aktif</option>
                  <option value="non-aktif">Non-Aktif</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-700 mb-3">Simpanan Anggota (Rp)</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Simpanan Pokok</label>
                  <input type="number" value={editing.simpanan_pokok} onChange={(e) => setEditing({ ...editing, simpanan_pokok: e.target.value })} className={inputClass} placeholder="0" min="0" />
                </div>
                <div>
                  <label className={labelClass}>Simpanan Wajib</label>
                  <input type="number" value={editing.simpanan_wajib} onChange={(e) => setEditing({ ...editing, simpanan_wajib: e.target.value })} className={inputClass} placeholder="0" min="0" />
                </div>
                <div>
                  <label className={labelClass}>Simpanan Sukarela</label>
                  <input type="number" value={editing.simpanan_sukarela} onChange={(e) => setEditing({ ...editing, simpanan_sukarela: e.target.value })} className={inputClass} placeholder="0" min="0" />
                </div>
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
