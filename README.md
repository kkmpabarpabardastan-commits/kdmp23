# Koperasi Desa/Kelurahan Merah Putih (KDMP)

Website sistem informasi koperasi desa untuk katalog barang, pemasok, anggota, layanan, dan administrasi keuangan.

## Fitur Utama

| Halaman | Deskripsi |
|---------|-----------|
| **Beranda** | Statistik koperasi, kategori barang, produk terbaru, nilai koperasi |
| **Katalog** | 30+ produk dengan filter kategori, status stok, pencarian, dan detail produk |
| **Pemasok** | Direktori 12 pemasok dengan kontak, alamat, kategori, dan rating |
| **Anggota** | Daftar 15 anggota dengan simpanan pokok/wajib/sukarela dan detail |
| **Layanan** | 8 layanan: simpanan, pinjaman, jasa, dan perdagangan |
| **Administrasi** | Mode staf dengan password, 5 tab pengelolaan |

### Tab Administrasi (Mode Staf)

1. **Keuangan & Transaksi** — Ringkasan pendapatan/pengeluaran, filter transaksi, ganti password
2. **Kelola Katalog** — Tambah/edit/hapus barang, ubah harga dan stok
3. **Kelola Pemasok** — Tambah/edit/hapus data pemasok
4. **Kelola Anggota** — Tambah/edit/hapus data anggota dan simpanan
5. **Kelola Transaksi** — Tambah/edit/hapus transaksi + sinkronisasi ke Google Spreadsheet

## Teknologi

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons
- **Backend:** Supabase (PostgreSQL + RLS + Edge Functions)
- **Sinkronisasi:** Google Sheets API via Supabase Edge Function

## Cara Menjalankan

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev

# Build untuk production
npm run build

# Type check
npm run typecheck
```

## Konfigurasi Environment

File `.env` berisi kredensial Supabase (sudah pre-populated):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Setup Google Sheets Sync (Opsional)

Untuk mengaktifkan sinkronisasi transaksi ke Google Spreadsheet:

### 1. Buat Google Service Account
- Buka [Google Cloud Console](https://console.cloud.google.com/)
- Enable **Google Sheets API**
- Buat Service Account dan download JSON key

### 2. Dapatkan Spreadsheet ID
- Buka Google Spreadsheet Anda
- Salin ID dari URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`

### 3. Bagikan Spreadsheet
- Klik "Share" di spreadsheet
- Masukkan email Service Account (`xxx@xxx.iam.gserviceaccount.com`)
- Berikan akses **Editor**

### 4. Set Secrets di Supabase
Buka Supabase Dashboard > Edge Functions > Secrets, tambahkan:

| Secret Name | Value |
|-------------|-------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Email service account |
| `GOOGLE_PRIVATE_KEY` | Private key dari JSON (mulai dengan `-----BEGIN PRIVATE KEY-----`) |
| `GOOGLE_SPREADSHEET_ID` | ID spreadsheet dari URL |

### 5. Buat Tab "Transaksi"
Di spreadsheet Anda, buat sheet/tab baru bernama `Transaksi`.

### 6. Gunakan
Buka halaman Administrasi > tab "Kelola Transaksi" > klik "Sync ke Spreadsheet".

> Petunjuk detail juga ada di file `supabase/functions/sync-google-sheets/index.ts` dengan tanda `>>> [ISI DI SINI] <<<`.

## Password Default Staf

```
kdmp2024
```

Password dapat diganti di menu Administrasi > Keuangan & Transaksi > Ganti Password Staf.

## Struktur Project

```
├── src/
│   ├── components/
│   │   ├── Layout.tsx           # Navbar + Footer
│   │   ├── KelolaKatalog.tsx     # Panel edit katalog (admin)
│   │   ├── KelolaPemasok.tsx     # Panel edit pemasok (admin)
│   │   ├── KelolaAnggota.tsx     # Panel edit anggota (admin)
│   │   └── KelolaTransaksi.tsx   # Panel edit transaksi + sync (admin)
│   ├── pages/
│   │   ├── BerandaPage.tsx       # Halaman beranda
│   │   ├── KatalogPage.tsx       # Halaman katalog barang
│   │   ├── PemasokPage.tsx       # Halaman pemasok
│   │   ├── AnggotaPage.tsx       # Halaman anggota
│   │   ├── LayananPage.tsx       # Halaman layanan
│   │   └── AdministrasiPage.tsx  # Halaman administrasi (mode staf)
│   ├── lib/
│   │   ├── supabase.ts           # Client + TypeScript types
│   │   ├── format.ts             # Format Rupiah, tanggal, angka
│   │   └── icons.ts              # Mapping icon Lucide
│   ├── App.tsx                   # Root component + routing
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Tailwind CSS
├── supabase/
│   ├── config.toml               # Konfigurasi edge function
│   ├── functions/
│   │   └── sync-google-sheets/
│   │       └── index.ts          # Edge function Google Sheets sync
│   └── migrations/
│       ├── ..._create_kdmp_schema.sql    # Skema database
│       ├── ..._seed_kdmp_data.sql        # Data contoh
│       └── ..._create_settings_table.sql # Tabel password admin
├── .env                          # Kredensial Supabase (JANGAN commit)
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Database Schema

| Tabel | Deskripsi |
|-------|-----------|
| `categories` | Kategori produk (8 kategori) |
| `suppliers` | Data pemasok (12 pemasok) |
| `products` | Katalog barang (30+ produk) |
| `members` | Data anggota (15 anggota) |
| `services` | Layanan koperasi (8 layanan) |
| `transactions` | Catatan transaksi keuangan |
| `settings` | Pengaturan sistem (password admin) |

Semua tabel menggunakan Row Level Security (RLS) dengan kebijakan `anon + authenticated`.

## Lisensi

Internal use for KDMP (Koperasi Desa/Kelurahan Merah Putih).
