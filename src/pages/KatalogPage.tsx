import { useEffect, useState, useMemo } from 'react';
import { Search, Package, AlertTriangle, X } from 'lucide-react';
import { supabase, type Product, type Category } from '@/lib/supabase';
import { formatRupiah, formatNumber } from '@/lib/format';
import { getIcon } from '@/lib/icons';

type StockStatus = 'all' | 'tersedia' | 'menipis' | 'habis';

export function KatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<StockStatus>('all');
  const [sort, setSort] = useState<'name' | 'price-asc' | 'price-desc' | 'stock'>('name');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          supabase.from('products').select('*, category:categories(*), supplier:suppliers(*)').eq('is_active', true).order('name'),
          supabase.from('categories').select('*').order('name'),
        ]);
        setProducts(prodRes.data ?? []);
        setCategories(catRes.data ?? []);
      } catch {
        // Supabase not configured or unreachable
      }
      setLoading(false);
    })();
  }, []);

  const getStockStatus = (p: Product): StockStatus => {
    if (p.stock === 0) return 'habis';
    if (p.stock <= p.min_stock) return 'menipis';
    return 'tersedia';
  };

  const filtered = useMemo(() => {
    let result = products;

    if (activeCategory !== 'all') {
      result = result.filter((p) => p.category_id === activeCategory);
    }

    if (stockFilter !== 'all') {
      result = result.filter((p) => getStockStatus(p) === stockFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      );
    }

    const sorted = [...result];
    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'stock':
        sorted.sort((a, b) => b.stock - a.stock);
        break;
      default:
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  }, [products, activeCategory, stockFilter, search, sort]);

  const stockBadge = (status: StockStatus) => {
    const styles: Record<StockStatus, string> = {
      tersedia: 'bg-emerald-50 text-emerald-700',
      menipis: 'bg-amber-50 text-amber-700',
      habis: 'bg-red-50 text-red-700',
      all: '',
    };
    const labels: Record<StockStatus, string> = {
      tersedia: 'Tersedia',
      menipis: 'Stok Menipis',
      habis: 'Habis',
      all: '',
    };
    return { style: styles[status], label: labels[status] };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Katalog Barang</h1>
        <p className="text-sm text-gray-500 mt-2">
          Daftar lengkap barang yang tersedia di Koperasi Desa Merah Putih
        </p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari barang..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeCategory === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Semua Kategori
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Stock & Sort */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            {(['all', 'tersedia', 'menipis', 'habis'] as StockStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStockFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  stockFilter === s
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {s === 'all' ? 'Semua Stok' : stockBadge(s).label}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 border border-gray-200 text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="name">Urutkan: Nama (A-Z)</option>
              <option value="price-asc">Harga: Termurah</option>
              <option value="price-desc">Harga: Termahal</option>
              <option value="stock">Stok: Terbanyak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        Menampilkan <span className="font-medium text-gray-700">{filtered.length}</span> barang
      </p>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="h-32 bg-gray-100 rounded-xl mb-4" />
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Tidak ada barang yang ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => {
            const status = getStockStatus(p);
            const badge = stockBadge(status);
            const Icon = getIcon(p.category?.icon ?? 'Package');
            return (
              <div
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-200/50 transition-all cursor-pointer group"
              >
                <div className="h-32 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-4 group-hover:from-red-50 group-hover:to-red-100/30 transition-all">
                  <Icon className="w-10 h-10 text-gray-300 group-hover:text-red-400 transition-colors" />
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                    {p.category?.name ?? 'Lain-lain'}
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.style}`}>
                    {badge.label}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 min-h-[2.5rem]">
                  {p.name}
                </h3>
                <p className="text-lg font-bold text-red-600 mt-2">{formatRupiah(p.price)}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>Stok: {formatNumber(p.stock)} {p.unit}</span>
                  <span className="text-gray-400">/{p.unit}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Detail Barang</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <div className="h-40 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-5">
                {(() => {
                  const Icon = getIcon(selectedProduct.category?.icon ?? 'Package');
                  return <Icon className="w-14 h-14 text-gray-300" />;
                })()}
              </div>

              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 inline-block mb-3">
                {selectedProduct.category?.name ?? 'Lain-lain'}
              </span>
              <h3 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h3>

              {selectedProduct.description && (
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{selectedProduct.description}</p>
              )}

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Harga Jual</p>
                  <p className="text-lg font-bold text-red-600">{formatRupiah(selectedProduct.price)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Satuan</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">{selectedProduct.unit}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Stok Tersedia</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatNumber(selectedProduct.stock)} {selectedProduct.unit}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">Min. Stok</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatNumber(selectedProduct.min_stock)} {selectedProduct.unit}
                  </p>
                </div>
              </div>

              {selectedProduct.supplier && (
                <div className="mt-4 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Pemasok</p>
                  <p className="text-sm font-semibold text-gray-900">{selectedProduct.supplier.name}</p>
                  {selectedProduct.supplier.contact_person && (
                    <p className="text-xs text-gray-500 mt-0.5">{selectedProduct.supplier.contact_person}</p>
                  )}
                </div>
              )}

              {selectedProduct.stock <= selectedProduct.min_stock && (
                <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-amber-50 text-amber-800">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <p className="text-xs">
                    Stok barang ini menipis. Segera lakukan pemesanan ulang ke pemasok.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
