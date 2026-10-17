import { useEffect, useState } from 'react';
import { Users, Search, Phone, Mail, MapPin, Calendar, X, Wallet } from 'lucide-react';
import { supabase, type Member } from '@/lib/supabase';
import { formatRupiah, formatDate } from '@/lib/format';

type StatusFilter = 'all' | 'aktif' | 'non-aktif';

export function AnggotaPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selected, setSelected] = useState<Member | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('members').select('*').order('join_date', { ascending: false });
        setMembers(data ?? []);
      } catch {
        // Supabase not configured or unreachable
      }
      setLoading(false);
    })();
  }, []);

  const filtered = members.filter((m) => {
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.member_number.toLowerCase().includes(q) ||
        m.phone?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalSimpanan = members.reduce(
    (sum, m) => sum + m.simpanan_pokok + m.simpanan_wajib + m.simpanan_sukarela,
    0
  );
  const activeCount = members.filter((m) => m.status === 'aktif').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Anggota Koperasi</h1>
        <p className="text-sm text-gray-500 mt-2">
          Daftar anggota Koperasi Desa/Kelurahan Merah Putih
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{members.length}</p>
          <p className="text-sm text-gray-500">Total Anggota</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
          <p className="text-sm text-gray-500">Anggota Aktif</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <Wallet className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatRupiah(totalSimpanan)}</p>
          <p className="text-sm text-gray-500">Total Simpanan</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, nomor anggota, atau telepon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'aktif', 'non-aktif'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                statusFilter === s
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {s === 'all' ? 'Semua' : s === 'aktif' ? 'Aktif' : 'Non-Aktif'}
            </button>
          ))}
        </div>
      </div>

      {/* Members Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-16" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">No. Anggota</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Telepon</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Bergabung</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Simpanan</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => setSelected(m)}
                    className="hover:bg-gray-50/50 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{m.member_number}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-700">{m.name}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 hidden sm:table-cell">{m.phone ?? '-'}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 hidden md:table-cell">{formatDate(m.join_date)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 hidden lg:table-cell">
                      {formatRupiah(m.simpanan_pokok + m.simpanan_wajib + m.simpanan_sukarela)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        m.status === 'aktif'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {m.status === 'aktif' ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Detail Anggota</h2>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-lg">
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selected.name}</h3>
                  <p className="text-sm text-gray-500">{selected.member_number}</p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                {selected.phone && (
                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" /> {selected.phone}
                  </p>
                )}
                {selected.email && (
                  <p className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" /> {selected.email}
                  </p>
                )}
                {selected.address && (
                  <p className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" /> {selected.address}
                  </p>
                )}
                <p className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" /> Bergabung: {formatDate(selected.join_date)}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">Simpanan Pokok</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">{formatRupiah(selected.simpanan_pokok)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">Simpanan Wajib</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">{formatRupiah(selected.simpanan_wajib)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">Simpanan Sukarela</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">{formatRupiah(selected.simpanan_sukarela)}</p>
                </div>
              </div>

              <div className="mt-3 p-4 rounded-xl bg-red-50 flex items-center justify-between">
                <span className="text-sm font-medium text-red-700">Total Simpanan</span>
                <span className="text-lg font-bold text-red-700">
                  {formatRupiah(selected.simpanan_pokok + selected.simpanan_wajib + selected.simpanan_sukarela)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
