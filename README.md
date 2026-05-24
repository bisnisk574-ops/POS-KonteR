<div align="center">

<img src="icon-512.png" width="120" height="120" style="border-radius:24px;" alt="KonterKu Cloud Logo"/>

# KonterKu Cloud

**Aplikasi POS & Manajemen Bisnis Konter Pulsa berbasis Cloud**

[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?logo=firebase&logoColor=white)](https://firebase.google.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-blue?logo=googlechrome&logoColor=white)](https://web.dev/progressive-web-apps/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

[🚀 Buka Aplikasi](https://konterku.github.io/KonterKu/app/) · [📖 Dokumentasi](#cara-pakai) · [🐛 Laporkan Bug](../../issues)

</div>

---

## 📱 Tentang KonterKu Cloud

**KonterKu Cloud** adalah aplikasi manajemen bisnis konter pulsa, paket data, dan aksesoris HP yang berjalan langsung di browser — tanpa install, tanpa server sendiri. Data tersimpan real-time di Firebase Firestore dan bisa diakses dari HP, tablet, maupun laptop kapan saja.

Cocok untuk **pemilik konter** yang ingin mengelola transaksi harian, stok produk, keuangan, dan kasir secara terpusat — bahkan untuk lebih dari satu toko sekaligus.

---

## ✨ Fitur Utama

### 🏪 Multi-Toko
- Kelola lebih dari satu toko dalam satu akun
- Setiap toko memiliki data kasir, produk, dan transaksi yang terpisah
- Monitor semua cabang dari satu dashboard

### 💰 Kasir & Transaksi
- Kasir Digital & E-Wallet (DANA, GoPay, OVO, dll)
- Kasir Fisik — penjualan HP & aksesoris
- Scan barcode produk langsung dari kamera HP
- Cetak struk digital dengan logo & tagline toko

### 📦 Kelola Produk & Stok
- Manajemen stok real-time
- Notifikasi stok menipis otomatis
- Kategori produk fleksibel

### 👥 Manajemen Kasir
- Tambah kasir dengan role berbeda (Digital / Fisik / Lihat Stok)
- Sistem absensi kasir dengan laporan shift
- Saldo kas awal & akhir per shift

### 📊 Laporan & Analitik
- Dashboard statistik penjualan harian / bulanan
- Grafik pendapatan interaktif (Chart.js)
- Export laporan ke PDF
- Laporan per kasir, per toko, per periode

### 💼 Dompet & Keuangan
- Pencatatan modal & pengeluaran
- Histori saldo kas per shift
- Rekap keuangan otomatis

### ☁️ Cloud & Backup
- Data tersimpan otomatis di Firebase Firestore
- Backup & restore data kapan saja
- Akses dari perangkat mana pun tanpa sinkronisasi manual

---

## 🛠️ Teknologi

| Teknologi | Kegunaan |
|-----------|----------|
| **Firebase Firestore** | Database real-time cloud |
| **Firebase Auth** | Login & autentikasi pengguna |
| **Tailwind CSS** | UI framework |
| **Chart.js** | Grafik & visualisasi data |
| **ZXing** | Scanner barcode via kamera |
| **SweetAlert2** | Dialog & notifikasi |
| **Font Awesome** | Ikon UI |
| **PWA** | Install ke homescreen / buat APK |

---

## 📁 Struktur Repo

```
KonterKu/
├── app/
│   └── index.html        # Aplikasi utama (dashboard POS)
├── index.html            # Landing page
├── favicon.ico           # Favicon browser
├── icon-192.png          # Icon PWA Android
├── icon-512.png          # Icon HD / Play Store
├── apple-touch-icon.png  # Icon iOS homescreen
├── manifest.json         # PWA manifest
└── CNAME                 # Custom domain GitHub Pages
```

---

## 🚀 Cara Pakai

### Login sebagai Pemilik Toko
1. Buka [aplikasi](https://konterku.github.io/KonterKu/app/)
2. Tap **Daftar** → isi nama toko, email, password
3. Login → langsung masuk ke dashboard

### Login sebagai Kasir
1. Tap tab **Kasir** di halaman login
2. Masukkan **Kode Toko** (dari pemilik) dan password kasir
3. Mulai catat transaksi

### Install ke Homescreen Android
1. Buka aplikasi di **Chrome**
2. Tap menu **⋮** → **Tambahkan ke layar utama**
3. Aplikasi siap dipakai seperti APK native ✅

---

## 👤 Role Pengguna

| Role | Akses |
|------|-------|
| **Pemilik (Owner)** | Full akses — kelola toko, kasir, laporan, produk, keuangan |
| **Kasir Digital** | Input transaksi digital & e-wallet |
| **Kasir Fisik** | Input penjualan HP & aksesoris |
| **Kasir (Lihat Stok)** | Hanya bisa melihat daftar stok produk |

---

## 📸 Screenshot

> *Coming soon — tambahkan screenshot aplikasi di sini*

---

## 🤝 Kontribusi

Pull request dan saran fitur sangat diterima! Silakan buka [issue baru](../../issues) untuk melaporkan bug atau mengusulkan fitur.

---

## 📄 Lisensi

Proyek ini menggunakan lisensi [MIT](LICENSE).

---

<div align="center">

Dibuat dengan ❤️ untuk pelaku UMKM Indonesia

**[⬆ Kembali ke atas](#konterku-cloud)**

</div>
