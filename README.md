# 📱 QR Transfer

> Transfer teks & link antar perangkat via QR code — langsung di browser, tanpa install apapun.

**[→ Buka Live Demo](https://your-username.github.io/qruery)**

---

## ✨ Fitur

| Fitur                | Deskripsi                                             |
| -------------------- | ----------------------------------------------------- |
| **Generate QR**      | Ketik atau paste teks/link → tampil QR code instan    |
| **Download PNG**     | Simpan QR code sebagai gambar                         |
| **Scan QR**          | Buka kamera browser → scan QR → hasil muncul otomatis |
| **Copy & Buka Link** | Salin hasil scan atau langsung buka URL               |
| **Ephemeral**        | Nol data tersimpan — semua di memory browser          |
| **Responsive**       | Bekerja di laptop maupun HP                           |

---

## 🏗️ Tech Stack

| Komponen     | Pilihan                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------- |
| Structure    | HTML5                                                                                    |
| Styling      | Vanilla CSS (dark mode, glassmorphism)                                                   |
| Logic        | Vanilla JS (no framework)                                                                |
| QR Generator | [qrcode.js](https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js) via CDN |
| QR Scanner   | [html5-qrcode](https://unpkg.com/html5-qrcode) via CDN                                   |

---

## 🚀 Cara Deploy ke GitHub Pages

```bash
# 1. Buat repo baru di GitHub, push semua file
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main

# 2. Buka Settings → Pages → Source: main / (root)
# 3. Akses: https://USERNAME.github.io/REPO
```

> ⚡ Karena pure static, GitHub Pages bisa serve langsung tanpa konfigurasi tambahan.

---

## 📁 Struktur File

```
qruery/
├── index.html   ← Halaman utama dengan 2 tab
├── style.css    ← Styling & responsive layout
├── app.js       ← Logic generator & scanner
└── README.md    ← Dokumentasi ini
```

---

## 🔄 User Flow

```
Mode Generate (Laptop → HP):
  Ketik/paste teks → Generate → HP scan QR ✅

Mode Scan (HP → Laptop / HP → HP):
  Klik Mulai Scan → Izinkan kamera → Arahkan ke QR → Teks muncul ✅
```

---

## ⚠️ Catatan

- **Kamera hanya bisa diakses via HTTPS** atau `localhost`. Saat testing lokal, gunakan `localhost` (bukan `file://`).
- Untuk testing lokal: jalankan `npx serve .` atau `python -m http.server 8080`.
- Untuk scan di HP: deploy ke GitHub Pages, lalu buka URL-nya di HP.

---

## 📜 Lisensi

MIT — bebas digunakan dan dimodifikasi.
