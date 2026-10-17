import { useEffect, useState } from 'react';
import { supabase, type Service } from '@/lib/supabase';
import { getIcon } from '@/lib/icons';

const categoryLabels: Record<string, string> = {
  simpanan: 'Simpanan',
  pinjaman: 'Pinjaman',
  jasa: 'Jasa',
  perdagangan: 'Perdagangan',
};

const categoryColors: Record<string, string> = {
  simpanan: 'from-blue-500 to-blue-600',
  pinjaman: 'from-amber-500 to-amber-600',
  jasa: 'from-emerald-500 to-emerald-600',
  perdagangan: 'from-red-500 to-red-600',
};

export function LayananPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('services').select('*').order('category').order('name');
        setServices(data ?? []);
      } catch {
        // Supabase not configured or unreachable
      }
      setLoading(false);
    })();
  }, []);

  const cats = ['all', ...Array.from(new Set(services.map((s) => s.category)))];
  const filtered = activeCat === 'all' ? services : services.filter((s) => s.category === activeCat);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Layanan Koperasi</h1>
        <p className="text-sm text-gray-500 mt-2">
          Berbagai layanan yang tersedia untuk anggota dan masyarakat desa
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        {cats.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCat(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeCat === cat
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat === 'all' ? 'Semua Layanan' : categoryLabels[cat] ?? cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => {
            const Icon = getIcon(s.icon);
            const color = categoryColors[s.category] ?? 'from-gray-500 to-gray-600';
            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 inline-block mb-1">
                      {categoryLabels[s.category] ?? s.category}
                    </span>
                    <h3 className="text-base font-bold text-gray-900 leading-snug">{s.name}</h3>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-4 leading-relaxed">{s.description}</p>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">Ketentuan</span>
                  <span className="text-sm font-semibold text-gray-900">{s.fee_or_rate}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
