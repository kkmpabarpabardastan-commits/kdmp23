import { useEffect, useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Wallet, ArrowDownCircle,
  ArrowUpCircle, Coins, Package, ShoppingCart, Receipt,
  Lock, Unlock, Eye, EyeOff, KeyRound, Check, AlertCircle,
  LayoutDashboard, Store, Users,
} from 'lucide-react';
import { supabase, type Transaction } from '@/lib/supabase';
import { formatRupiah, formatShortDate } from '@/lib/format';
import { KelolaKatalog } from '@/components/KelolaKatalog';
import { KelolaPemasok } from '@/components/KelolaPemasok';
import { KelolaAnggota } from '@/components/KelolaAnggota';
import { KelolaTransaksi } from '@/components/KelolaTransaksi';

const typeConfig: Record<string, { label: string; icon: typeof TrendingUp; color: string; bgColor: string; sign: 'in' | 'out' | 'neutral' }> = {
  penjualan: { label: 'Penjualan', icon: ShoppingCart, color: 'text-emerald-600', bgColor: 'bg-emerald-50', sign: 'in' },
  pembelian: { label: 'Pembelian', icon: Package, color: 'text-blue-600', bgColor: 'bg-blue-50', sign: 'out' },
  simpanan: { label: 'Simpanan', icon: Wallet, color: 'text-blue-600', bgColor: 'bg-blue-50', sign: 'in' },
  pinjaman: { label: 'Pinjaman', icon: Coins, color: 'text-amber-600', bgColor: 'bg-amber-50', sign: 'neutral' },
  biaya_operasional: { label: 'Biaya Operasional', icon: Receipt, color: 'text-red-600', bgColor: 'bg-red-50', sign: 'out' },
};

const statusConfig: Record<string, string> = {
  lunas: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  batal: 'bg-red-50 text-red-700',
};

export function AdministrasiPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');

  // Staff auth state
  const [unlocked, setUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [storedPassword, setStoredPassword] = useState('');

  // Change password state
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changeMsg, setChangeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Admin tab state
  const [adminTab, setAdminTab] = useState<'keuangan' | 'katalog' | 'pemasok' | 'anggota' | 'transaksi'>('keuangan');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('transactions')
          .select('*, member:members(*), product:products(*)')
          .order('transaction_date', { ascending: false })
          .order('created_at', { ascending: false });
        setTransactions(data ?? []);

        const { data: settingsData } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'admin_password')
          .maybeSingle();
        setStoredPassword(settingsData?.value ?? 'kdmp2024');
      } catch {
        // Supabase not configured or unreachable
      }
      setLoading(false);
    })();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === storedPassword) {
      setUnlocked(true);
      setPasswordInput('');
      setAuthError('');
    } else {
      setAuthError('Password salah. Silakan coba lagi.');
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    setUnlocked(false);
    setShowChangeForm(false);
    setChangeMsg(null);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeMsg(null);

    if (oldPassword !== storedPassword) {
      setChangeMsg({ type: 'error', text: 'Password lama tidak cocok.' });
      return;
    }
    if (newPassword.length < 4) {
      setChangeMsg({ type: 'error', text: 'Password baru minimal 4 karakter.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangeMsg({ type: 'error', text: 'Konfirmasi password tidak cocok.' });
      return;
    }

    const { error } = await supabase
      .from('settings')
      .update({ value: newPassword, updated_at: new Date().toISOString() })
      .eq('key', 'admin_password');

    if (error) {
      setChangeMsg({ type: 'error', text: 'Gagal mengubah password. Silakan coba lagi.' });
      return;
    }

    setStoredPassword(newPassword);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowChangeForm(false);
    setChangeMsg({ type: 'success', text: 'Password berhasil diubah.' });
    setTimeout(() => setChangeMsg(null), 3000);
  };

  const summary = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'penjualan' && t.status === 'lunas')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = transactions
      .filter((t) => (t.type === 'pembelian' || t.type === 'biaya_operasional') && t.status === 'lunas')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const simpanan = transactions
      .filter((t) => t.type === 'simpanan' && t.status === 'lunas')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const pinjamanOutstanding = transactions
      .filter((t) => t.type === 'pinjaman' && t.status === 'pending')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return {
      income,
      expenses,
      surplus: income - expenses,
      simpanan,
      pinjamanOutstanding,
    };
  }, [transactions]);

  const types = ['all', ...Array.from(new Set(transactions.map((t) => t.type)))];
  const filtered = filterType === 'all' ? transactions : transactions.filter((t) => t.type === filterType);

  const summaryCards = [
    { label: 'Pendapatan', value: summary.income, icon: ArrowUpCircle, color: 'from-emerald-500 to-emerald-600', sub: 'Penjualan lunas' },
    { label: 'Pengeluaran', value: summary.expenses, icon: ArrowDownCircle, color: 'from-red-500 to-red-600', sub: 'Pembelian + operasional' },
    { label: 'Surplus', value: summary.surplus, icon: TrendingUp, color: summary.surplus >= 0 ? 'from-blue-500 to-blue-600' : 'from-red-500 to-red-600', sub: 'Pendapatan - Pengeluaran' },
    { label: 'Simpanan Masuk', value: summary.simpanan, icon: Wallet, color: 'from-amber-500 to-amber-600', sub: 'Setoran anggota' },
  ];

  // ===== LOCKED VIEW =====
  if (!unlocked) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administrasi Koperasi</h1>
          <p className="text-sm text-gray-500 mt-2">
            Ringkasan keuangan dan catatan transaksi Koperasi Desa Merah Putih
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-lg shadow-gray-200/30">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center mb-4 shadow-md shadow-red-600/30">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Mode Staf Terkunci</h2>
              <p className="text-sm text-gray-500 mt-1">
                Masukkan password staf untuk mengakses data administrasi koperasi
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password Staf
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Masukkan password..."
                    autoFocus
                    className="w-full pl-4 pr-11 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {authError && (
                  <p className="flex items-center gap-1.5 mt-2 text-xs text-red-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {authError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white font-semibold text-sm hover:shadow-lg hover:shadow-red-600/30 transition-all"
              >
                Buka Akses
              </button>
            </form>

            <div className="mt-6 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Password default: <span className="font-mono font-medium text-gray-700">kdmp2024</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== UNLOCKED VIEW =====
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Administrasi Koperasi</h1>
            <p className="text-sm text-gray-500 mt-2">
              Ringkasan keuangan dan catatan transaksi Koperasi Desa Merah Putih
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700">
              <Unlock className="w-3.5 h-3.5" />
              Mode Staf Aktif
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              Kunci
            </button>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-px">
          {([
            { id: 'keuangan', label: 'Keuangan & Transaksi', icon: LayoutDashboard },
            { id: 'katalog', label: 'Kelola Katalog', icon: Package },
            { id: 'pemasok', label: 'Kelola Pemasok', icon: Store },
            { id: 'anggota', label: 'Kelola Anggota', icon: Users },
            { id: 'transaksi', label: 'Kelola Transaksi', icon: Receipt },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${
                adminTab === tab.id
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== KEUANGAN TAB ===== */}
      {adminTab === 'keuangan' && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {summaryCards.map((s) => (
              <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatRupiah(s.value)}</p>
                <p className="text-sm font-medium text-gray-700 mt-1">{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Secondary info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Pinjaman Pending</p>
                  <p className="text-xl font-bold text-gray-900">{formatRupiah(summary.pinjamanOutstanding)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Total Transaksi</p>
                  <p className="text-xl font-bold text-gray-900">{transactions.length} catatan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="mb-8">
            {changeMsg && (
              <div className={`mb-3 flex items-center gap-2 p-3 rounded-xl text-sm ${
                changeMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-700'
              }`}>
                {changeMsg.type === 'success'
                  ? <Check className="w-4 h-4 flex-shrink-0" />
                  : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                {changeMsg.text}
              </div>
            )}

            {!showChangeForm ? (
              <button
                onClick={() => setShowChangeForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-red-300 hover:bg-red-50/50 transition-all"
              >
                <KeyRound className="w-4 h-4 text-gray-500" />
                Ganti Password Staf
              </button>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900">Ganti Password Staf</h3>
                  <button
                    onClick={() => {
                      setShowChangeForm(false);
                      setOldPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setChangeMsg(null);
                    }}
                    className="text-sm text-gray-400 hover:text-gray-600"
                  >
                    Batal
                  </button>
                </div>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password Lama
                    </label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Masukkan password saat ini"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Password Baru
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 4 karakter"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Konfirmasi Password Baru
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi password baru"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white font-semibold text-sm hover:shadow-lg hover:shadow-red-600/30 transition-all"
                  >
                    Simpan Password Baru
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Transactions */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Catatan Transaksi</h2>
        <p className="text-sm text-gray-500">Riwayat semua transaksi koperasi</p>
      </div>

      {/* Type Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {types.map((t) => {
          const cfg = typeConfig[t];
          return (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterType === t
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t === 'all' ? 'Semua' : cfg?.label ?? t}
            </button>
          );
        })}
      </div>

      {/* Transaction List */}
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
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jenis</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Deskripsi</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Anggota</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Jumlah</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((t) => {
                  const cfg = typeConfig[t.type] ?? typeConfig.biaya_operasional;
                  return (
                    <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                        {formatShortDate(t.transaction_date)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cfg.bgColor} ${cfg.color}`}>
                          <cfg.icon className="w-3.5 h-3.5" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-700 max-w-xs">
                        <div className="truncate">{t.description}</div>
                        {t.quantity && (
                          <span className="text-xs text-gray-400">x{t.quantity}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600 hidden md:table-cell">
                        {t.member?.name ?? '-'}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-right whitespace-nowrap">
                        <span className={`font-semibold ${
                          cfg.sign === 'in' ? 'text-emerald-600'
                            : cfg.sign === 'out' ? 'text-red-600'
                            : 'text-gray-900'
                        }`}>
                          {cfg.sign === 'in' ? '+' : cfg.sign === 'out' ? '-' : ''}{formatRupiah(Number(t.amount))}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusConfig[t.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {t.status === 'lunas' ? 'Lunas' : t.status === 'pending' ? 'Pending' : 'Batal'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </>
      )}

      {/* ===== KATALOG TAB ===== */}
      {adminTab === 'katalog' && <KelolaKatalog />}

      {/* ===== TRANSAKSI TAB ===== */}
      {adminTab === 'transaksi' && <KelolaTransaksi />}

      {/* ===== PEMASOK TAB ===== */}
      {adminTab === 'pemasok' && <KelolaPemasok />}

      {/* ===== ANGGOTA TAB ===== */}
      {adminTab === 'anggota' && <KelolaAnggota />}
    </div>
  );
}
