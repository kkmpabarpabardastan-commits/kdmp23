import { useState, useEffect } from 'react';
import { Navbar, Footer, type PageId } from '@/components/Layout';
import { BerandaPage } from '@/pages/BerandaPage';
import { KatalogPage } from '@/pages/KatalogPage';
import { PemasokPage } from '@/pages/PemasokPage';
import { AnggotaPage } from '@/pages/AnggotaPage';
import { LayananPage } from '@/pages/LayananPage';
import { AdministrasiPage } from '@/pages/AdministrasiPage';

function App() {
  const [page, setPage] = useState<PageId>('beranda');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar currentPage={page} onNavigate={setPage} />
      <main className="flex-1">
        {page === 'beranda' && <BerandaPage onNavigate={setPage} />}
        {page === 'katalog' && <KatalogPage />}
        {page === 'pemasok' && <PemasokPage />}
        {page === 'anggota' && <AnggotaPage />}
        {page === 'layanan' && <LayananPage />}
        {page === 'administrasi' && <AdministrasiPage />}
      </main>
      <Footer onNavigate={setPage} />
    </div>
  );
}

export default App;
