import { useEffect, useState } from 'react';
import {
  Store, Users, Package, TrendingUp, ArrowRight,
  ShieldCheck, HeartHandshake, Sprout,
} from 'lucide-react';
import { supabase, type Product, type Category } from '@/lib/supabase';
import { formatRupiah } from '@/lib/format';
import { getIcon } from '@/lib/icons';
import type { PageId } from '@/components/Layout';

export function BerandaPage({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  const [stats, setStats] = useState({ products: 0, members: 0, suppliers: 0, transactions: 0 });
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [prodRes, memRes, supRes, trxRes, catRes] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'aktif'),
          supabase.from('suppliers').select('*', { count: 'exact', head: true }),
          supabase.from('transactions').select('*', { count: 'exact', head: true }),
          supabase.from('categories').select('*').order('name'),
        ]);

        setStats({
          products: prodRes.count ?? 0,
          members: memRes.count ?? 0,
          suppliers: supRes.count ?? 0,
          transactions: trxRes.count ?? 0,
        });
        setCategories(catRes.data ?? []);

        const { data } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(8);
        setFeatured(data ?? []);
      } catch {
        // Supabase not configured or unreachable — show empty state
      }
      setLoading(false);
    })();
  }, []);

  const statCards = [
    { label: 'Jenis Barang', value: stats.products, icon: Package, color: 'from-blue-500 to-blue-600' },
    { label: 'Anggota Aktif', value: stats.members, icon: Users, color: 'from-red-500 to-red-600' },
    { label: 'Pemasok', value: stats.suppliers, icon: Store, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Transaksi', value: stats.transactions, icon: TrendingUp, color: 'from-amber-500 to-amber-600' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-800 to-gray-900" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span className="text-xs font-medium text-white">Berbadan Hukum · No. 421/BH/2023</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Koperasi Desa Merah Putih
            </h1>
            <p className="mt-2 text-xl sm:text-2xl text-red-200 font-medium">
              Kesejahteraan Bersama, Mandiri Bersama
            </p>
            <p className="mt-6 text-base sm:text-lg text-gray-300 leading-relaxed max-w-2xl">
              Sistem informasi koperasi desa untuk katalog barang, pemasok,
              keanggotaan, layanan simpan-pinjam, dan administrasi keuangan
              yang transparan untuk seluruh warga.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onNavigate('katalog')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-red-700 font-semibold hover:bg-red-50 transition-all shadow-lg hover:shadow-xl"
              >
                Lihat Katalog Barang
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('layanan')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 backdrop-blur-sm text-white font-semibold border border-white/20 hover:bg-white/20 transition-all"
              >
                Layanan Koperasi
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-8 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6 border border-gray-100">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Kategori Barang</h2>
            <p className="text-sm text-gray-500 mt-1">Telusuri katalog berdasarkan kategori</p>
          </div>
          <button
            onClick={() => onNavigate('katalog')}
            className="text-sm font-medium text-red-600 hover:text-red-700 inline-flex items-center gap-1"
          >
            Semua Kategori <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat) => {
            const Icon = getIcon(cat.icon);
            return (
              <button
                key={cat.id}
                onClick={() => onNavigate('katalog')}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50/50 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                  <Icon className="w-6 h-6 text-gray-600 group-hover:text-red-600 transition-colors" />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center leading-tight">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Barang Terbaru</h2>
            <p className="text-sm text-gray-500 mt-1">Produk yang baru ditambahkan ke katalog</p>
          </div>
          <button
            onClick={() => onNavigate('katalog')}
            className="text-sm font-medium text-red-600 hover:text-red-700 inline-flex items-center gap-1"
          >
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="h-32 bg-gray-100 rounded-xl mb-4" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-200/50 transition-all group cursor-pointer"
                onClick={() => onNavigate('katalog')}
              >
                <div className="h-32 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-4 group-hover:from-red-50 group-hover:to-red-100/30 transition-all">
                  {(() => {
                    const Icon = getIcon(p.category?.icon ?? 'Package');
                    return <Icon className="w-10 h-10 text-gray-300 group-hover:text-red-400 transition-colors" />;
                  })()}
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {p.category?.name ?? 'Lain-lain'}
                  </span>
                  {p.stock <= p.min_stock && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                      Stok Menipis
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">{p.name}</h3>
                <p className="text-lg font-bold text-red-600 mt-2">{formatRupiah(p.price)}</p>
                <p className="text-xs text-gray-500 mt-1">Stok: {p.stock} {p.unit}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: HeartHandshake, title: 'Gotong Royong', desc: 'Dari, oleh, dan untuk warga desa. Setiap keuntungan kembali untuk kesejahteraan anggota.' },
            { icon: ShieldCheck, title: 'Transparan', desc: 'Administrasi dan keuangan terbuka. Setiap anggota dapat melihat laporan koperasi kapan saja.' },
            { icon: Sprout, title: 'Berkembang', desc: 'Mendukung perekonomian desa melalui perdagangan, simpanan, dan pinjaman modal usaha.' },
          ].map((v) => (
            <div key={v.title} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                <v.icon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{v.title}</h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
