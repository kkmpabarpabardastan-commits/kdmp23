import { useState, useEffect } from 'react';
import { Menu, X, Store } from 'lucide-react';

export type PageId = 'beranda' | 'katalog' | 'pemasok' | 'anggota' | 'layanan' | 'administrasi';

const menuItems: { id: PageId; label: string }[] = [
  { id: 'beranda', label: 'Beranda' },
  { id: 'katalog', label: 'Katalog' },
  { id: 'pemasok', label: 'Pemasok' },
  { id: 'anggota', label: 'Anggota' },
  { id: 'layanan', label: 'Layanan' },
  { id: 'administrasi', label: 'Administrasi' },
];

export function Navbar({
  currentPage,
  onNavigate,
}: {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (page: PageId) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white shadow-lg shadow-gray-200/50'
          : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => handleNav('beranda')}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-md shadow-red-600/30 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <span className="block text-sm font-bold text-gray-900 leading-tight">
                KDMP
              </span>
              <span className="block text-[10px] text-gray-500 leading-tight">
                Koperasi Desa Merah Putih
              </span>
            </div>
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === item.id
                    ? 'text-red-700 bg-red-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-3 border-t border-gray-100">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  currentPage === item.id
                    ? 'text-red-700 bg-red-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}

export function Footer({ onNavigate }: { onNavigate: (page: PageId) => void }) {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="block text-sm font-bold text-white">KDMP</span>
                <span className="block text-[10px] text-gray-500">
                  Koperasi Desa/Kelurahan Merah Putih
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              Koperasi Desa/Kelurahan Merah Putih berkomitmen melayani
              masyarakat desa dengan menyediakan kebutuhan pokok, layanan
              simpan pinjam, dan perdagangan dengan harga terjangkau untuk
      kesejahteraan bersama.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Menu</h4>
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Kontak</h4>
            <ul className="space-y-2 text-sm">
              <li>Desa Sukamaju, Kec. Cimahi</li>
              <li>Kabupaten Bandung, Jawa Barat</li>
              <li>Telp: (022) 1234-5678</li>
              <li>Email: kdmp@sukamaju.desa.id</li>
              <li>Jam Layanan: 08.00 - 16.00 WIB</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs">
          <p>
            © {new Date().getFullYear()} Koperasi Desa/Kelurahan Merah Putih.
            Berbadan Hukum. No. 421/BH/2023.
          </p>
        </div>
      </div>
    </footer>
  );
}
