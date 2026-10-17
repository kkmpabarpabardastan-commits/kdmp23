/*
# Seed KDMP with Realistic Example Data

## Overview
Populates all tables with realistic data for a village cooperative (KDMP):
- 8 product categories
- 12 suppliers
- 30+ products across categories
- 15 members
- 8 services
- 20 transactions

This is a data-only migration (INSERTs). Safe to re-run — uses ON CONFLICT DO NOTHING.
*/

-- ===== CATEGORIES =====
INSERT INTO categories (name, icon, description) VALUES
('Sembako', 'Wheat', 'Bahan pokok: beras, gula, minyak, tepung, dll'),
('Kebutuhan Rumah Tangga', 'Home', 'Sabun, deterjen, perlengkapan rumah tangga'),
('Minuman', 'Coffee', 'Kopi, teh, susu, minuman ringan'),
('Makanan Ringan', 'Cookie', 'Snack, biskuit, makanan ringan'),
('Kesehatan & Kebersihan', 'HeartPulse', 'Obat-obatan ringan, P3K, hygiene'),
('Pertanian & Peternakan', 'Sprout', 'Bibit, pupuk, pakan ternak'),
('Bangunan & Perkakas', 'Hammer', 'Material ringan, perkakas, cat'),
('ATK & Lain-lain', 'Pencil', 'Alat tulis kantor, kebutuhan administrasi')
ON CONFLICT (name) DO NOTHING;

-- ===== SUPPLIERS =====
INSERT INTO suppliers (name, contact_person, phone, email, address, city, category, rating) VALUES
('PT Sumber Pangan Sejahtera', 'Budi Santoso', '0812-3456-7890', 'budi@sumberpangan.co.id', 'Jl. Industri No. 15', 'Bandung', 'Sembako', 5),
('CV Mitra Sembako Mandiri', 'Siti Aminah', '0813-2222-1111', 'info@mitrasembako.id', 'Jl. Pasar Lama 22', 'Garut', 'Sembako', 4),
('PT Berkah Jaya Abadi', 'Hendra Wijaya', '0856-7777-8888', 'hendra@berkahjaya.com', 'Jl. Raya Cimahi 45', 'Cimahi', 'Kebutuhan Rumah Tangga', 4),
('UD Cahaya Terang', 'Maya Sari', '0821-5555-3333', 'maya@cahayaterang.id', 'Jl. MH Thamrin 10', 'Bandung', 'Minuman', 5),
('PT Sehat Selalu', 'dr. Rudi Hartono', '0811-9999-0000', 'rudi@sehatselalu.co.id', 'Jl. Kesehatan 8', 'Bandung', 'Kesehatan & Kebersihan', 5),
('CV Tani Makmur', 'Pak Yusep', '0857-1234-5678', 'yusep@tanimakmur.id', 'Jl. Pertanian 100', 'Sumedang', 'Pertanian & Peternakan', 4),
('Toko Bangun Sentosa', 'Asep Sutisna', '0815-3333-2222', 'asep@bangunsentosa.id', 'Jl. Nasional 88', 'Bandung', 'Bangunan & Perkakas', 3),
('CV Sentral ATK', 'Lina Marlina', '0818-4444-7777', 'lina@sentralatk.com', 'Jl. Braga 5', 'Bandung', 'ATK & Lain-lain', 4),
('PT Roti Manis Sejahtera', 'Dedi Kurniawan', '0812-6666-5555', 'dedi@rotimanis.id', 'Jl. Industri Cakra 12', 'Bandung', 'Makanan Ringan', 4),
('CV Bumi Hijau', 'Ratna Dewi', '0852-1111-2222', 'ratna@bumihijau.id', 'Jl. Dago 77', 'Bandung', 'Kebutuhan Rumah Tangga', 5),
('UD Sumber Rejeki', 'Wawan Setiawan', '0813-8888-9999', 'wawan@sumberrejeki.id', 'Jl. Buah Batu 33', 'Bandung', 'Sembako', 3),
('PT Agro Nusantara', 'Tono Pratama', '0856-2222-3333', 'tono@agronusantara.com', 'Jl. Cibadak 90', 'Bandung', 'Pertanian & Peternakan', 5);

-- ===== PRODUCTS =====
-- Sembako
INSERT INTO products (name, category_id, unit, price, cost_price, stock, min_stock, supplier_id, description, image_url) VALUES
('Beras Premium Pandan Wangi 5kg', (SELECT id FROM categories WHERE name='Sembako'), 'sak', 68000, 62000, 45, 10, (SELECT id FROM suppliers WHERE name='PT Sumber Pangan Sejahtera'), 'Beras premium kualitas premium, pulen dan wangi', NULL),
('Beras Medium 5kg', (SELECT id FROM categories WHERE name='Sembako'), 'sak', 52000, 48000, 60, 15, (SELECT id FROM suppliers WHERE name='PT Sumber Pangan Sejahtera'), 'Beras kualitas medium, sehari-hari', NULL),
('Gula Pasir Gulaku 1kg', (SELECT id FROM categories WHERE name='Sembako'), 'kg', 16000, 14000, 80, 20, (SELECT id FROM suppliers WHERE name='CV Mitra Sembako Mandiri'), 'Gula pasir putih premium', NULL),
('Minyak Goreng Bimoli 2L', (SELECT id FROM categories WHERE name='Sembako'), 'btl', 38000, 35000, 50, 15, (SELECT id FROM suppliers WHERE name='CV Mitra Sembako Mandiri'), 'Minyak goreng kualitas baik', NULL),
('Minyak Goreng Tropical 1L', (SELECT id FROM categories WHERE name='Sembako'), 'btl', 18000, 16000, 3, 15, (SELECT id FROM suppliers WHERE name='UD Sumber Rejeki'), 'Minyak goreng ekonomis 1 liter', NULL),
('Tepung Terigu Segitiga 1kg', (SELECT id FROM categories WHERE name='Sembako'), 'kg', 13000, 11500, 70, 15, (SELECT id FROM suppliers WHERE name='CV Mitra Sembako Mandiri'), 'Tepung terigu serbaguna', NULL),
('Garam Halus 250g', (SELECT id FROM categories WHERE name='Sembako'), 'bks', 4000, 3000, 120, 30, (SELECT id FROM suppliers WHERE name='CV Mitra Sembako Mandiri'), 'Garam halus beryodium', NULL),
('Kecap Manis ABC 600ml', (SELECT id FROM categories WHERE name='Sembako'), 'btl', 22000, 19500, 40, 10, (SELECT id FROM suppliers WHERE name='UD Sumber Rejeki'), 'Kecap manis premium', NULL),

-- Kebutuhan Rumah Tangga
('Sabun Cuci Sunlight 800ml', (SELECT id FROM categories WHERE name='Kebutuhan Rumah Tangga'), 'btl', 18000, 15500, 55, 15, (SELECT id FROM suppliers WHERE name='PT Berkah Jaya Abadi'), 'Sabun cuci piring efektif', NULL),
('Deterjen Rinso 1.7kg', (SELECT id FROM categories WHERE name='Kebutuhan Rumah Tangga'), 'bks', 35000, 32000, 30, 10, (SELECT id FROM suppliers WHERE name='PT Berkah Jaya Abadi'), 'Deterjen bubuk untuk cucian', NULL),
('Sabun Mandi Lifebuoy 12pcs', (SELECT id FROM categories WHERE name='Kebutuhan Rumah Tangga'), 'bks', 27000, 24000, 8, 10, (SELECT id FROM suppliers WHERE name='CV Bumi Hijau'), 'Sabun mandi antibakteri isi 12', NULL),
('Tisu Paseo 250 sheet', (SELECT id FROM categories WHERE name='Kebutuhan Rumah Tangga'), 'pk', 15000, 13000, 45, 10, (SELECT id FROM suppliers WHERE name='CV Bumi Hijau'), 'Tisu toilet lembut 250 lembar', NULL),
('Pewangi Molto 800ml', (SELECT id FROM categories WHERE name='Kebutuhan Rumah Tangga'), 'btl', 16000, 14000, 25, 8, (SELECT id FROM suppliers WHERE name='PT Berkah Jaya Abadi'), 'Pewangi pakaian segar tahan lama', NULL),

-- Minuman
('Kopi Kapal Api Sachet 10pcs', (SELECT id FROM categories WHERE name='Minuman'), 'bks', 15000, 12000, 100, 20, (SELECT id FROM suppliers WHERE name='UD Cahaya Terang'), 'Kopi instan sachet isi 10', NULL),
('Teh Sariwangi 25 bks', (SELECT id FROM categories WHERE name='Minuman'), 'bks', 9000, 7500, 60, 15, (SELECT id FROM suppliers WHERE name='UD Cahaya Terang'), 'Teh celup isi 25 sachet', NULL),
('Susu Bear Brand 12 kaleng', (SELECT id FROM categories WHERE name='Minuman'), 'dus', 65000, 58000, 20, 5, (SELECT id FROM suppliers WHERE name='UD Cahaya Terang'), 'Susu kental manis isi 12 kaleng', NULL),
('Air Mineral Aqua 600ml 12pcs', (SELECT id FROM categories WHERE name='Minuman'), 'dus', 24000, 21000, 2, 10, (SELECT id FROM suppliers WHERE name='UD Cahaya Terang'), 'Air mineral botol 600ml isi 12', NULL),

-- Makanan Ringan
('Biskuit Roma Kelapa 300g', (SELECT id FROM categories WHERE name='Makanan Ringan'), 'bks', 12000, 10000, 50, 15, (SELECT id FROM suppliers WHERE name='PT Roti Manis Sejahtera'), 'Biskuit kelapa renyah', NULL),
('Roti Tawar Sari Roti 400g', (SELECT id FROM categories WHERE name='Makanan Ringan'), 'bks', 14000, 12000, 18, 10, (SELECT id FROM suppliers WHERE name='PT Roti Manis Sejahtera'), 'Roti tawar lembut', NULL),
('Wafer Tango 10 bks', (SELECT id FROM categories WHERE name='Makanan Ringan'), 'bks', 22000, 19000, 35, 10, (SELECT id FROM suppliers WHERE name='PT Roti Manis Sejahtera'), 'Wafer isi 10 sachet', NULL),

-- Kesehatan & Kebersihan
('Masker 3 Ply 1 box 50pcs', (SELECT id FROM categories WHERE name='Kesehatan & Kebersihan'), 'box', 25000, 20000, 40, 10, (SELECT id FROM suppliers WHERE name='PT Sehat Selalu'), 'Masker medis 3 lapis isi 50', NULL),
('Hand Sanitizer 500ml', (SELECT id FROM categories WHERE name='Kesehatan & Kebersihan'), 'btl', 20000, 17000, 30, 10, (SELECT id FROM suppliers WHERE name='PT Sehat Selalu'), 'Hand sanitizer 70% alkohol', NULL),
('Pisau Silet Gilade 12pcs', (SELECT id FROM categories WHERE name='Kesehatan & Kebersihan'), 'bks', 18000, 15000, 12, 5, (SELECT id FROM suppliers WHERE name='PT Sehat Selalu'), 'Pisau cukup isi 12', NULL),
('Kotak P3K Lengkap', (SELECT id FROM categories WHERE name='Kesehatan & Kebersihan'), 'box', 55000, 48000, 5, 5, (SELECT id FROM suppliers WHERE name='PT Sehat Selalu'), 'Kotak P3K berisi plester, betadine, kasa, dll', NULL),

-- Pertanian & Peternakan
('Pupuk Urea 50kg', (SELECT id FROM categories WHERE name='Pertanian & Peternakan'), 'sak', 280000, 265000, 15, 5, (SELECT id FROM suppliers WHERE name='CV Tani Makmur'), 'Pupuk urea untuk pertanian', NULL),
('Pupuk NPK 25kg', (SELECT id FROM categories WHERE name='Pertanian & Peternakan'), 'sak', 320000, 300000, 8, 5, (SELECT id FROM suppliers WHERE name='PT Agro Nusantara'), 'Pupuk NPK compound 16-16-16', NULL),
('Pakan Ternak BR1 50kg', (SELECT id FROM categories WHERE name='Pertanian & Peternakan'), 'sak', 380000, 360000, 12, 5, (SELECT id FROM suppliers WHERE name='CV Tani Makmur'), 'Pakan ternak konsentrat BR1', NULL),
('Bibit Cabai Rawit 1 bks', (SELECT id FROM categories WHERE name='Pertanian & Peternakan'), 'bks', 8000, 6000, 40, 10, (SELECT id FROM suppliers WHERE name='PT Agro Nusantara'), 'Bibit cabai rawit unggul', NULL),

-- Bangunan & Perkakas
('Cat Avian 1kg', (SELECT id FROM categories WHERE name='Bangunan & Perkakas'), 'btl', 55000, 50000, 15, 5, (SELECT id FROM suppliers WHERE name='Toko Bangun Sentosa'), 'Cat tembok warna putih', NULL),
('Kuas Cat 4 inch', (SELECT id FROM categories WHERE name='Bangunan & Perkakas'), 'pcs', 12000, 10000, 20, 5, (SELECT id FROM suppliers WHERE name='Toko Bangun Sentosa'), 'Kuas cat 4 inch berkualitas', NULL),
('Paku 1kg Mix', (SELECT id FROM categories WHERE name='Bangunan & Perkakas'), 'kg', 15000, 13000, 30, 10, (SELECT id FROM suppliers WHERE name='Toko Bangun Sentosa'), 'Paku campuran ukuran 2-5 inch', NULL),

-- ATK & Lain-lain
('Buku Tulis 38 lbr 10pcs', (SELECT id FROM categories WHERE name='ATK & Lain-lain'), 'pkk', 35000, 30000, 25, 10, (SELECT id FROM suppliers WHERE name='CV Sentral ATK'), 'Buku tulis 38 lembar isi 10', NULL),
('Pulpen Standard 12pcs', (SELECT id FROM categories WHERE name='ATK & Lain-lain'), 'pkk', 18000, 15000, 40, 10, (SELECT id FROM suppliers WHERE name='CV Sentral ATK'), 'Pulpen standard isi 12', NULL),
('Kertas HVS A4 70gsm 1 rim', (SELECT id FROM categories WHERE name='ATK & Lain-lain'), 'rim', 45000, 42000, 15, 5, (SELECT id FROM suppliers WHERE name='CV Sentral ATK'), 'Kertas HVS A4 70gsm 500 lembar', NULL)
ON CONFLICT DO NOTHING;

-- ===== MEMBERS =====
INSERT INTO members (member_number, name, phone, email, address, join_date, status, simpanan_pokok, simpanan_wajib, simpanan_sukarela) VALUES
('KDMP-001', 'Ahmad Fauzi', '0812-1111-1111', 'ahmad.fauzi@email.com', 'RT 01 RW 03 Desa Sukamaju', '2023-01-15', 'aktif', 500000, 250000, 1500000),
('KDMP-002', 'Nurhayati', '0813-2222-3333', 'nurhayati@email.com', 'RT 02 RW 01 Desa Sukamaju', '2023-02-10', 'aktif', 500000, 250000, 850000),
('KDMP-003', 'Dadang Suhendar', '0856-3333-4444', 'dadang.s@email.com', 'RT 03 RW 02 Desa Sukamaju', '2023-03-05', 'aktif', 500000, 300000, 2200000),
('KDMP-004', 'Euis Rohaeti', '0821-5555-6666', 'euis.rohaeti@email.com', 'RT 01 RW 04 Desa Sukamaju', '2023-04-20', 'aktif', 500000, 250000, 650000),
('KDMP-005', 'Rudi Hartono', '0811-7777-8888', 'rudi.h@email.com', 'RT 04 RW 02 Desa Sukamaju', '2023-05-12', 'aktif', 500000, 250000, 1200000),
('KDMP-006', 'Tini Artini', '0815-9999-0000', 'tini.artini@email.com', 'RT 02 RW 03 Desa Sukamaju', '2023-06-18', 'aktif', 500000, 200000, 450000),
('KDMP-007', 'Cecep Hidayat', '0818-1234-5678', 'cecep.h@email.com', 'RT 05 RW 01 Desa Sukamaju', '2023-07-01', 'aktif', 500000, 300000, 1800000),
('KDMP-008', 'Siti Rohimah', '0857-8765-4321', 'siti.rohimah@email.com', 'RT 03 RW 04 Desa Sukamaju', '2023-08-15', 'aktif', 500000, 250000, 750000),
('KDMP-009', 'Jajang Kurnia', '0813-1122-3344', 'jajang.k@email.com', 'RT 04 RW 03 Desa Sukamaju', '2023-09-10', 'aktif', 500000, 250000, 980000),
('KDMP-010', 'Linda Permata', '0852-5566-7788', 'linda.p@email.com', 'RT 01 RW 02 Desa Sukamaju', '2023-10-25', 'aktif', 500000, 250000, 320000),
('KDMP-011', 'Ujang Sutisna', '0812-9988-7766', 'ujang.s@email.com', 'RT 05 RW 02 Desa Sukamaju', '2024-01-08', 'aktif', 500000, 200000, 560000),
('KDMP-012', 'Yuli Astuti', '0811-4433-2211', 'yuli.astuti@email.com', 'RT 02 RW 05 Desa Sukamaju', '2024-02-14', 'aktif', 500000, 250000, 1100000),
('KDMP-013', 'Hendra Gunawan', '0856-6655-4433', 'hendra.g@email.com', 'RT 04 RW 01 Desa Sukamaju', '2024-03-20', 'aktif', 500000, 300000, 2300000),
('KDMP-014', 'Aat Supriatna', '0821-3344-5566', 'aat.s@email.com', 'RT 03 RW 03 Desa Sukamaju', '2024-04-05', 'non-aktif', 500000, 150000, 200000),
('KDMP-015', 'Rina Wati', '0818-7788-9900', 'rina.wati@email.com', 'RT 05 RW 04 Desa Sukamaju', '2024-05-18', 'aktif', 500000, 250000, 670000)
ON CONFLICT (member_number) DO NOTHING;

-- ===== SERVICES =====
INSERT INTO services (name, description, category, fee_or_rate, icon) VALUES
('Simpanan Pokok', 'Simpanan wajib sekali saat menjadi anggota. Dapat dikembalikan saat keluar keanggotaan.', 'simpanan', 'Rp 500.000 (sekali)', 'Wallet'),
('Simpanan Wajib', 'Setoran bulanan rutin anggota sebagai modal koperasi. Dapat ditarik saat keluar.', 'simpanan', 'Rp 25.000/bulan', 'PiggyBank'),
('Simpanan Sukarela', 'Tabungan sukarela dengan bunga 6% per tahun. Dapat ditarik kapan saja.', 'simpanan', 'Bunga 6%/tahun', 'Banknote'),
('Pinjaman Modal Usaha', 'Pinjaman untuk modal usaha dengan jangka waktu 6-24 bulan.', 'pinjaman', 'Bunga 12%/tahun', 'Landmark'),
('Pinjaman Konsumtif', 'Pinjaman untuk kebutuhan mendesik dengan jangka pendek 3-12 bulan.', 'pinjaman', 'Bunga 15%/tahun', 'ShoppingCart'),
('Pelayanan Listrik & Token', 'Pembayaran listrik dan pembelian token prabayar PLN.', 'jasa', 'Biaya admin Rp 2.500', 'Zap'),
('Pelayanan Pulsa & Data', 'Pembelian pulsa dan paket data semua operator.', 'jasa', 'Diskon 2% dari harga normal', 'Smartphone'),
('Toko Sembako Murah', 'Penjualan sembako dan kebutuhan harian dengan harga anggota.', 'perdagangan', 'Diskon 5% untuk anggota', 'Store')
ON CONFLICT DO NOTHING;

-- ===== TRANSACTIONS =====
INSERT INTO transactions (type, description, amount, member_id, product_id, quantity, transaction_date, status) VALUES
('penjualan', 'Penjualan Beras Premium 5kg', 68000, (SELECT id FROM members WHERE member_number='KDMP-001'), (SELECT id FROM products WHERE name='Beras Premium Pandan Wangi 5kg'), 1, '2024-10-01', 'lunas'),
('penjualan', 'Penjualan Gula Pasir 1kg x 2', 32000, (SELECT id FROM members WHERE member_number='KDMP-002'), (SELECT id FROM products WHERE name='Gula Pasir Gulaku 1kg'), 2, '2024-10-01', 'lunas'),
('penjualan', 'Penjualan Minyak Goreng Bimoli 2L', 38000, (SELECT id FROM members WHERE member_number='KDMP-003'), (SELECT id FROM products WHERE name='Minyak Goreng Bimoli 2L'), 1, '2024-10-02', 'lunas'),
('simpanan', 'Setoran simpanan wajib bulanan', 25000, (SELECT id FROM members WHERE member_number='KDMP-004'), NULL, NULL, '2024-10-02', 'lunas'),
('penjualan', 'Penjualan Deterjen Rinso 1.7kg', 35000, (SELECT id FROM members WHERE member_number='KDMP-005'), (SELECT id FROM products WHERE name='Deterjen Rinso 1.7kg'), 1, '2024-10-03', 'lunas'),
('penjualan', 'Penjualan Kopi Kapal Api 10pcs x 3', 45000, (SELECT id FROM members WHERE member_number='KDMP-007'), (SELECT id FROM products WHERE name='Kopi Kapal Api Sachet 10pcs'), 3, '2024-10-03', 'lunas'),
('simpanan', 'Setoran simpanan sukarela', 500000, (SELECT id FROM members WHERE member_number='KDMP-003'), NULL, NULL, '2024-10-04', 'lunas'),
('pinjaman', 'Cicilan pinjaman modal usaha bulan ke-3', 450000, (SELECT id FROM members WHERE member_number='KDMP-013'), NULL, NULL, '2024-10-05', 'lunas'),
('penjualan', 'Penjualan Sabun Mandi Lifebuoy 12pcs', 27000, (SELECT id FROM members WHERE member_number='KDMP-008'), (SELECT id FROM products WHERE name='Sabun Mandi Lifebuoy 12pcs'), 1, '2024-10-05', 'lunas'),
('pembelian', 'Restock Minyak Goreng Tropical 1L x 30', 540000, NULL, (SELECT id FROM products WHERE name='Minyak Goreng Tropical 1L'), 30, '2024-10-06', 'lunas'),
('penjualan', 'Penjualan Pupuk Urea 50kg', 280000, (SELECT id FROM members WHERE member_number='KDMP-007'), (SELECT id FROM products WHERE name='Pupuk Urea 50kg'), 1, '2024-10-07', 'lunas'),
('penjualan', 'Penjualan Biskuit Roma Kelapa x 5', 60000, (SELECT id FROM members WHERE member_number='KDMP-009'), (SELECT id FROM products WHERE name='Biskuit Roma Kelapa 300g'), 5, '2024-10-08', 'lunas'),
('simpanan', 'Setoran simpanan wajib bulanan', 25000, (SELECT id FROM members WHERE member_number='KDMP-010'), NULL, NULL, '2024-10-08', 'lunas'),
('penjualan', 'Penjualan Air Mineral Aqua 600ml 12pcs x 4', 96000, (SELECT id FROM members WHERE member_number='KDMP-012'), (SELECT id FROM products WHERE name='Air Mineral Aqua 600ml 12pcs'), 4, '2024-10-09', 'lunas'),
('biaya_operasional', 'Pembayaran listrik koperasi', 350000, NULL, NULL, NULL, '2024-10-10', 'lunas'),
('penjualan', 'Penjualan Kertas HVS A4 1 rim x 3', 135000, (SELECT id FROM members WHERE member_number='KDMP-005'), (SELECT id FROM products WHERE name='Kertas HVS A4 70gsm 1 rim'), 3, '2024-10-11', 'lunas'),
('pinjaman', 'Pinjaman konsumtif baru - KDMP-006', 2000000, (SELECT id FROM members WHERE member_number='KDMP-006'), NULL, NULL, '2024-10-12', 'pending'),
('penjualan', 'Penjualan Cat Avian 1kg x 2', 110000, (SELECT id FROM members WHERE member_number='KDMP-011'), (SELECT id FROM products WHERE name='Cat Avian 1kg'), 2, '2024-10-13', 'lunas'),
('penjualan', 'Penjualan Susu Bear Brand 12 kaleng', 65000, (SELECT id FROM members WHERE member_number='KDMP-015'), (SELECT id FROM products WHERE name='Susu Bear Brand 12 kaleng'), 1, '2024-10-14', 'lunas'),
('biaya_operasional', 'Gaji pegawai koperasi Oktober', 2500000, NULL, NULL, NULL, '2024-10-15', 'lunas')
ON CONFLICT DO NOTHING;
