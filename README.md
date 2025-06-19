# SILOKA QUIZKI
Web development full stack untuk PWL - B Final 4th Semester (Collab)

[![GitHub contributors](https://img.shields.io/github/contributors/reynaldyAl/siloka-quizki)](https://github.com/reynaldyAl/siloka-quizki/graphs/contributors)
[![GitHub issues](https://img.shields.io/github/issues/reynaldyAl/siloka-quizki)](https://github.com/reynaldyAl/siloka-quizki/issues)
[![GitHub stars](https://img.shields.io/github/stars/reynaldyAl/siloka-quizki)](https://github.com/reynaldyAl/siloka-quizki/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/reynaldyAl/siloka-quizki)](https://github.com/reynaldyAl/siloka-quizki/network)
[![GitHub license](https://img.shields.io/github/license/reynaldyAl/siloka-quizki)](https://github.com/reynaldyAl/siloka-quizki/blob/main/LICENSE)

## 📝 Gambaran Proyek

SILOKA QUIZKI adalah aplikasi web full-stack yang dibangun dengan JSX yang terintegrasi dengan berbagai database untuk memberikan platform kuis interaktif. Aplikasi ini akan menggunakan API untuk mengambil dan mengelola konten kuis.

## 🔧 Tech Stack

- Frontend: React.js dengan JSX
- Backend: Node.js
- Database: Fast API and SQLite
- Integrasi API
- Teknologi lain: 
   - Prop-Types, 
   - CSS, Tailwinds, sqlalchemy,
   - python-jose[cryptography], 
   - passlib[bcrypt], python-multipart, python-dotenv, pydantic[email], 
   - email-validator


## How to run
### Requirements
- Npm install Prop-types
- npm install -D tailwindcss@3
- npx tailwindcss init -p 
- pip install -r requirements.txt

#### Note : We're using 2 terminal : Back-End run, Front-end run
### Terminal 1 (Backend)
- cd backend
- python main.py

### Terminal 2 (Front-end)
- cd quizki
- npm run dev
- open the localhost in the terminal

#### Enjoy Testing!


## 👥 Panduan Kolaborasi Git

### Langkah Awal Kolaborasi

#### Metode 1: Sebagai Kontributor Langsung (Direkomendasikan untuk Tim Inti)

1. **Clone repositori**
   ```bash
   git clone https://github.com/reynaldyAl/siloka-quizki.git
   cd siloka-quizki
   ```

2. **Pasang dependencies**
   ```bash
   npm install
   ```

3. **Buat branch baru**
   ```bash
   # Pastikan kamu berada di branch develop terbaru
   git checkout develop
   git pull origin develop
   
   # Buat branch fitur baru
   git checkout -b feature/nama-fitur
   ```

#### Metode 2: Menggunakan Fork (Direkomendasikan untuk Kontributor Eksternal)

1. **Fork repositori**
   - Kunjungi https://github.com/reynaldyAl/siloka-quizki
   - Klik tombol "Fork" di pojok kanan atas
   - Pilih akun GitHub kamu sebagai tujuan fork

2. **Clone hasil fork**
   ```bash
   git clone https://github.com/username-kamu/siloka-quizki.git
   cd siloka-quizki
   ```

3. **Tambahkan upstream remote**
   ```bash
   git remote add upstream https://github.com/reynaldyAl/siloka-quizki.git
   ```

4. **Buat branch baru**
   ```bash
   # Update dari upstream terlebih dahulu
   git fetch upstream
   git checkout develop
   git merge upstream/develop
   
   # Buat branch fitur baru
   git checkout -b feature/nama-fitur
   ```

### Struktur Branch

Kami mengikuti strategi branching terstruktur:

- `main` - Kode siap produksi
- `develop` - Branch integrasi untuk fitur-fitur
- `feature/[nama-fitur]` - Pengembangan fitur individu
- `bugfix/[nama-bug]` - Perbaikan bug
- `hotfix/[nama-hotfix]` - Perbaikan darurat untuk produksi

### Konvensi Penamaan Branch

- `feature/[nama-fitur]` - Untuk fitur baru (misal: `feature/pencarian-kuis`)
- `bugfix/[nama-bug]` - Untuk perbaikan bug (misal: `bugfix/kalkulasi-skor`)
- `hotfix/[nama-hotfix]` - Untuk perbaikan kritis (misal: `hotfix/kerentanan-auth`)
- `docs/[nama-docs]` - Untuk pembaruan dokumentasi (misal: `docs/endpoint-api`)
- `refactor/[area]` - Untuk refaktor kode (misal: `refactor/kueri-database`)

Gunakan kebab-case (huruf kecil dengan tanda hubung) untuk bagian deskriptif.

> **CATATAN PENTING**: Jika ingin collab, silahkan buat branch sendiri dan push ke branch serta pastikan agar git fetch untuk memastikan kesamaan

### Alur Kerja Harian

1. **Selalu update branch develop sebelum memulai pekerjaan baru**
   ```bash
   # Jika menggunakan metode 1 (kontributor langsung)
   git checkout develop
   git pull origin develop
   
   # Jika menggunakan metode 2 (fork)
   git checkout develop
   git fetch upstream
   git merge upstream/develop
   git push origin develop  # Update fork kamu
   ```

2. **Kembali ke branch fitur kamu dan update dengan perubahan terbaru dari develop**
   ```bash
   git checkout feature/nama-fitur
   git merge develop
   ```

3. **Sinkronkan dengan repositori remote sebelum melakukan perubahan**
   ```bash
   git fetch --all
   ```

4. **Kerjakan perubahan kamu**
   - Buat perubahan kode
   - Uji perubahan lokal

5. **Commit perubahan**
   ```bash
   git add .
   git commit -m "feat: menambahkan fitur login"
   ```

   **Format Pesan Commit:**
   - `feat:` - Fitur baru
   - `fix:` - Perbaikan bug
   - `docs:` - Perubahan dokumentasi
   - `style:` - Perubahan format kode (tidak mengubah logika)
   - `refactor:` - Refaktor kode
   - `test:` - Menambah/mengubah test
   - `chore:` - Pemeliharaan repositori

6. **Push ke branch**
   ```bash
   git push origin nama-branch-kamu
   ```

### Pull Request

1. **Buka Pull Request (PR) di GitHub**
   - Buka repositori di GitHub
   - Klik "Pull Requests" > "New Pull Request"
   - Pilih branch kamu sebagai "compare"
   - Pilih "develop" sebagai "base" (atau "main" untuk hotfix)
   - Isi template PR

2. **Persyaratan PR**
   - Berikan judul PR yang jelas
   - Jelaskan perubahan yang kamu buat
   - Referensikan issue terkait (#nomor-issue)
   - Minta review dari anggota tim yang relevan
   - Pastikan semua pemeriksaan CI lolos

3. **Proses Review Kode**
   - Tanggapi komentar reviewer
   - Lakukan perubahan yang diperlukan
   - Push commit tambahan ke branch yang sama
   - PR akan diperbarui secara otomatis

4. **Penggabungan**
   - PR memerlukan setidaknya satu persetujuan
   - Selesaikan konflik penggabungan yang ada
   - PR biasanya digabungkan menggunakan "Squash and merge" untuk menjaga riwayat tetap bersih

### Mengatasi Konflik Merge

Jika kamu mengalami konflik merge:

```bash
# Update branch develop lokal
git checkout develop
git pull origin develop

# Kembali ke branch kamu
git checkout nama-branch-kamu
git merge develop

# Selesaikan konflik di editor kode
# Setelah menyelesaikan, tandai file sebagai resolved
git add .

# Selesaikan merge
git commit
git push origin nama-branch-kamu
```

## 📁 Struktur Kode

Proyek kami mengikuti struktur berikut:

```
siloka-quizki/
├── client/               # Kode frontend
│   ├── public/           # Aset statis
│   ├── src/
│   │   ├── assets/       # Gambar, font, dll.
│   │   ├── components/   # Komponen yang dapat digunakan kembali
│   │   ├── contexts/     # Konteks React
│   │   ├── hooks/        # Hook khusus
│   │   ├── pages/        # Komponen halaman
│   │   ├── services/     # Layanan API
│   │   ├── utils/        # Fungsi pembantu
│   │   └── App.jsx       # Komponen aplikasi utama
├── server/               # Kode backend
│   ├── config/           # File konfigurasi
│   ├── controllers/      # Handler request
│   ├── middleware/       # Middleware Express
│   ├── models/           # Model database
│   ├── routes/           # Rute API
│   └── server.js         # Entry point
├── .gitignore
├── package.json
└── README.md
```

**Panduan:**
- Tempatkan komponen di direktori yang sesuai
- Gunakan PascalCase untuk file komponen (misalnya, `UserProfile.jsx`)
- Gunakan camelCase untuk file non-komponen (misalnya, `authService.js`)
- Buat subdirektori untuk kode fitur khusus

## 🧪 Pengujian

- Tulis pengujian untuk fitur baru
- Pastikan pengujian yang sudah ada lulus sebelum mengajukan PR
- Jalankan suite pengujian secara lokal:
  ```bash
  npm test
  ```

## 🚀 Deployment

(Informasi deployment akan ditambahkan nanti)

## 📝 Sumber Daya Tambahan

- [Dokumentasi React](https://reactjs.org/docs/getting-started.html)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🤝 Anggota Tim

- [reynaldyAl](https://github.com/reynaldyAl) - Project Lead
- [A. M. YUSRAN MAZIDAN](https://github.com/Yousran)
- [REZKY ROBBYYANTO AKBARI](https://github.com/)
- [A.MUH. MUFLIH HANIFATUSSURUR](https://github.com/)

## 📜 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT - lihat file LICENSE untuk detailnya.
