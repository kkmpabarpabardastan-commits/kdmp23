import { useEffect, useState } from 'react';
import { Store, Phone, Mail, MapPin, Star, Search } from 'lucide-react';
import { supabase, type Supplier } from '@/lib/supabase';

export function PemasokPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('suppliers').select('*').order('rating', { ascending: false });
        setSuppliers(data ?? []);
      } catch {
        // Supabase not configured or unreachable
      }
      setLoading(false);
    })();
  }, []);

  const categories = ['all', ...Array.from(new Set(suppliers.map((s) => s.category).filter((c): c is string => Boolean(c))))];

  const filtered = suppliers.filter((s) => {
    if (filterCat !== 'all' && s.category !== filterCat) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.contact_person?.toLowerCase().includes(q) ||
        s.city?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
        />
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pemasok</h1>
        <p className="text-sm text-gray-500 mt-2">
          Direktori pemasok yang bekerja sama dengan Koperasi Desa Merah Putih
        </p>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari pemasok, kontak, atau kota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterCat === cat
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'Semua' : cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-200/50 transition-all">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Store className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 leading-snug">{s.name}</h3>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 inline-block mt-1">
                    {s.category ?? 'Umum'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {s.contact_person && (
                  <p className="text-gray-600">
                    <span className="text-gray-400">Kontak: </span>
                    {s.contact_person}
                  </p>
                )}
                {s.phone && (
                  <p className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    {s.phone}
                  </p>
                )}
                {s.email && (
                  <p className="flex items-center gap-2 text-gray-600 truncate">
                    <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    {s.email}
                  </p>
                )}
                {s.address && (
                  <p className="flex items-start gap-2 text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span>{s.address}, {s.city}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                {renderStars(s.rating)}
                <span className="text-xs text-gray-500 ml-1">{s.rating}/5</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
