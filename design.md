# Rancangan Antarmuka Mobile — UMKM-KU

## Dasar Perancangan

**BantuUsaha** adalah pendamping digital ringan bagi pemilik UMKM pemula. Rancangan ini menerjemahkan objective makalah menjadi pengalaman mobile yang memulai setiap interaksi dari masalah pengguna, bukan dari istilah administrasi. Aplikasi akan membantu pengguna memilih kebutuhan hari ini, memahami langkah berikutnya, mencatat uang usaha tanpa istilah akuntansi yang rumit, dan membangun kesiapan usaha secara bertahap.

Seluruh layar dirancang dalam orientasi portrait 9:16 dan mengutamakan penggunaan satu tangan. Navigasi inti memakai empat tab di bagian bawah dengan label sederhana: **Beranda**, **Panduan**, **Catat Uang**, dan **Lainnya**. Target sentuh utama setidaknya setinggi 48 pt, teks isi minimal 16 pt, serta satu tindakan utama ditempatkan dekat area bawah layar ketika diperlukan. Pengguna dapat memakai seluruh informasi umum tanpa akun; data transaksi dan cek kesiapan disimpan lokal pada perangkat sebagai implementasi prototipe yang menjaga kesederhanaan serta privasi.

## Daftar Layar dan Tata Letak

| Layar | Konten utama | Tata letak dan tindakan utama |
|---|---|---|
| Beranda | Sapaan singkat, kartu kemajuan, pertanyaan “Apa yang ingin dibantu hari ini?”, dan pintasan kebutuhan | Header ringkas; kartu status di atas; grid dua kolom berisi kebutuhan besar yang mudah disentuh; satu rekomendasi langkah berikutnya di bagian bawah |
| Cek Kesiapan | Lima pertanyaan mengenai data usaha, produk, catatan uang, izin, dan rencana modal | Satu pertanyaan per layar; indikator langkah; pilihan jawaban berbentuk kartu; hasil berupa persentase dan daftar prioritas |
| Hasil Kesiapan | Skor kemajuan, langkah yang telah siap, dan tiga prioritas tindakan | Cincin progres sederhana; daftar tindakan dengan status; tombol “Mulai langkah pertama” |
| Panduan Usaha | Checklist bertahap: mulai usaha, produk, urus izin, dan jualan online | Daftar kartu kategori; detail menampilkan langkah singkat, penjelasan bahasa manusia, dan checklist yang dapat ditandai |
| Catat Uang | Ringkasan pemasukan, pengeluaran, saldo/perkiraan keuntungan, dan transaksi terbaru | Ringkasan angka berkontras tinggi; tombol tambah masuk/keluar yang menonjol; daftar transaksi dapat dipindai cepat |
| Tambah Catatan | Jenis transaksi, nominal, keterangan, dan tanggal | Form pendek satu tujuan; pilihan “Uang Masuk” atau “Uang Keluar”; validasi sederhana; tombol “Simpan Catatan” di bagian bawah |
| Layanan UMKM | Legalitas, kesiapan modal, pelatihan, dan bantuan istilah | Kartu kategori dengan label sehari-hari seperti “Urus Izin Usaha” dan “Cari Modal Usaha”; tiap detail berupa checklist atau daftar langkah |
| Belajar | Materi mikro tentang jualan, keuangan, foto produk, dan pemasaran digital | Kartu materi yang ringkas; halaman detail berisi poin praktis, estimasi waktu baca, dan tombol selesai |
| Lainnya dan Bantuan | Informasi data lokal, FAQ singkat, kamus istilah, serta pengaturan | Daftar sederhana; pengaturan menampilkan penjelasan transparan bahwa data catatan tersimpan di perangkat |

## Alur Pengguna Utama

| Tujuan pengguna | Alur yang dirancang | Hasil yang diterima pengguna |
|---|---|---|
| Tidak tahu harus mulai dari mana | Beranda → pilih “Cek kondisi usaha” → jawab lima pertanyaan → hasil kesiapan | Tiga langkah paling penting yang dapat langsung dikerjakan |
| Ingin mengelola uang harian | Catat Uang → pilih Uang Masuk/Uang Keluar → isi nominal dan keterangan → simpan | Ringkasan pemasukan, pengeluaran, serta perkiraan keuntungan yang mudah dibaca |
| Ingin memahami izin usaha | Beranda/Layanan → “Urus Izin Usaha” → pilih NIB, Halal, atau Merek → ikuti checklist | Penjelasan sederhana dan daftar persiapan yang dapat ditandai |
| Ingin meningkatkan penjualan | Beranda → “Belajar jualan” → pilih materi → baca panduan praktis → tandai selesai | Materi pendek yang tidak membebani pengguna pemula |
| Ingin mengetahui kesiapan modal | Layanan → “Cari Modal Usaha” → isi indikator kesiapan → lihat hasil | Pemetaan dokumen, pencatatan, dan rencana kebutuhan modal yang perlu dilengkapi |

## Pilihan Warna dan Nuansa Visual

| Token | Warna terang | Tujuan penggunaan |
|---|---|---|
| Primary | `#0B6E4F` | Hijau usaha yang tenang; tombol utama dan status aktif |
| Background | `#F7FAF8` | Latar yang bersih dan hemat kontras untuk penggunaan lama |
| Surface | `#FFFFFF` | Kartu informasi dan form |
| Foreground | `#16302A` | Teks utama dengan keterbacaan tinggi |
| Muted | `#64766F` | Keterangan, waktu, dan teks sekunder |
| Accent | `#F4B860` | Sorotan progres dan ajakan belajar tanpa mengalahkan aksi utama |
| Success | `#208D63` | Tanda langkah selesai dan catatan pemasukan |
| Error | `#C84A3F` | Peringatan dan catatan pengeluaran |

Tampilan memakai latar terang, kartu ber-radius 20 pt, batas sangat halus, dan ikon garis sederhana. Penggunaan ilustrasi serta animasi dibatasi agar pengalaman tetap ringan. Umpan balik sentuhan menggunakan perubahan opasitas dan haptic halus untuk tindakan utama; tidak ada animasi dekoratif yang memperlambat proses.

## Model Data Lokal

| Entitas | Atribut inti | Pemakaian |
|---|---|---|
| `BusinessProfile` | jenis usaha, tahap usaha, lokasi opsional | Personalisasi panduan dan cek kesiapan tanpa meminta data berlebih |
| `ReadinessAnswer` | kategori, status siap/belum, waktu pembaruan | Menghitung kemajuan dan prioritas langkah berikutnya |
| `CashTransaction` | id, jenis masuk/keluar, nominal, keterangan, tanggal | Menyusun ringkasan pembukuan sederhana |
| `GuideProgress` | id panduan, daftar langkah selesai | Menjaga status checklist panduan usaha dan legalitas |
| `LearningProgress` | id materi, status selesai | Menampilkan progres pembelajaran yang relevan |

## Keputusan Privasi dan Aksesibilitas

Data pengembangan prototipe disimpan lokal sehingga pengguna tidak perlu membuat akun atau memberikan nomor telepon sebelum memperoleh manfaat. Setiap layar yang meminta konteks usaha akan menjelaskan alasan penggunaannya dengan bahasa singkat. Antarmuka menghindari ketergantungan pada warna saja, menyediakan label teks untuk seluruh status, mengutamakan kontras yang memadai, dan menggunakan istilah sehari-hari seperti **“Catat Uang”**, **“Urus Izin”**, serta **“Cari Modal”**.

## Arah Redesign Berdasarkan Referensi

Redesign BantuUsaha memakai pola layanan terpadu dari SAPA UMKM dan pola tindakan berbasis kebutuhan dari UMKM-KU, tanpa menyalin identitas visual keduanya. Beranda berubah menjadi **dashboard perjalanan usaha** yang membantu pengguna memahami kondisi hari ini, memilih satu langkah penting, lalu menjelajahi layanan menurut tahap **Mulai**, **Kelola**, dan **Tumbuh**. Pendekatan ini menggunakan prinsip *recognition over recall*: pengguna tidak perlu mengingat istilah administrasi karena aplikasi menyajikan tujuan yang mudah dikenali.

| Lapisan pengalaman | Keputusan desain | Prinsip UX yang digunakan |
|---|---|---|
| Orientasi | Hero merangkum kondisi usaha dan langkah berikutnya | Hierarki visual dan *progressive disclosure* |
| Tindakan utama | Satu kartu rekomendasi dengan CTA primer yang eksplisit | Fokus satu tujuan per layar dan *Hick’s Law* |
| Penjelajahan | Grid layanan menurut masalah pengguna, bukan struktur birokrasi | *Match between system and real world* |
| Kepercayaan | Label sumber pada kabar resmi, pernyataan data lokal, serta catatan layanan | Transparansi dan pencegahan kesalahan |
| Kejelasan aksi | Tombol primer memakai latar gelap/teks putih, sekunder memakai latar pucat/teks gelap, dan tidak ada teks token yang diletakkan di atas latar ambigu | Kontras semantik dan aksesibilitas |
| Kesan hidup | Status progres, kartu rekomendasi yang berubah menurut catatan pengguna, konten mikro, dan respon tekan yang konsisten | Umpan balik segera dan *visibility of system status* |

### Sistem Visual Revisi

| Elemen | Ketentuan |
|---|---|
| Latar | Kanvas krem sangat muda (`#F8F7F2`) agar kartu putih memiliki kedalaman yang tenang |
| Warna utama | Hijau hutan gelap (`#124C43`) untuk aksi primer dan hero; emas hangat (`#E9B653`) hanya untuk penanda progres atau sorotan |
| Teks | Teks utama selalu `#14211F`; teks sekunder `#5E706B`; teks pada aksi primer selalu putih eksplisit |
| Kartu | Radius 24 pt, batas tipis netral, bayangan lembut hanya pada kartu yang dapat ditekan |
| Spasi | Skala 8 pt; konten dikelompokkan dalam blok jelas agar layar tidak terasa sebagai daftar kartu generik |
| Interaksi | Seluruh target tekan minimal 48 pt, umpan balik opasitas/skalanya seragam, dan CTA utama berada dalam jangkauan ibu jari |

## Sistem Visual Mobile Finance

Referensi visual menunjukkan pendekatan aplikasi bisnis yang matang: informasi keuangan diletakkan sebagai fokus teratas, aksi cepat berada di dalam konteks saldo, metrik memiliki kotak tersendiri, dan navigasi bawah menjadi jangkar tetap. BantuUsaha akan menerapkan **bahasa desain mobile-finance** tersebut untuk kebutuhan pendampingan UMKM tanpa mengadopsi logo, nama, atau konten merek lain.

| Area | Spesifikasi BantuUsaha |
|---|---|
| Header | Safe area lega dengan brand mark SVG, nama aplikasi, notifikasi, dan avatar usaha berbentuk medali. Tidak ada teks pembuka panjang yang menggeser informasi utama ke bawah. |
| Kartu utama | Kartu saldo bergradasi biru-hijau dengan motif SVG abstrak, nilai saldo aktual, dua tindakan yang jelas, dan pemilih konteks usaha. Kartu memiliki radius 22 pt, bukan sudut generik yang terlalu besar. |
| Metrik | Pemasukan dan pengeluaran muncul sebagai dua kartu ringkas berdampingan; nilai bersumber dari catatan yang disimpan pengguna. |
| Statistik | Kartu statistik berisi grafik batang SVG, pilihan periode, dan ringkasan perubahan hanya jika data transaksi tersedia. Pada keadaan kosong, kartu menjelaskan cara membuka data pertama. |
| Menu layanan | Ikon medali SVG yang memiliki bentuk, warna, dan latar berbeda untuk modal, izin, panduan, serta belajar. Label berada di bawah ikon dengan jarak vertikal presisi. |
| Konten promosi | Banner gradien dengan ilustrasi SVG orisinal yang menampilkan konteks pertumbuhan usaha; bukan stok gambar dekoratif atau kartu teks generik. |
| Navigasi | Bar bawah putih, empat tujuan jelas, dengan aksi “Catat Uang” berbentuk tombol pusat yang menonjol tetapi tetap berlabel. |

### Tipografi dan Ritme

BantuUsaha akan menggunakan tipografi sistem dengan rasa humanis: **Avenir Next** di iOS dan sans-serif platform pada Android, dengan angka saldo menggunakan *tabular figures* melalui bobot tebal dan tracking rapat. Judul halaman memakai 22–24 pt, nilai keuangan 25–30 pt, label metrik 11–12 pt, dan teks pendukung minimal 12 pt. Semua ruang memakai ritme 4/8/12/16/24 pt untuk memastikan kepadatan informasi tetap mudah dipindai dalam satu tangan.

### Aset SVG Orisinal

Sistem aset tidak memakai emoji atau ikon AI yang acak. Brand mark, ikon layanan, motif kartu saldo, ilustrasi banner, dan grafik batang akan dibuat sebagai SVG vektor di proyek. Setiap aset mengikuti palet biru-navy, aqua, kuning hangat, dan putih agar satu sama lain terasa sebagai satu keluarga visual.

## Arah Tema Light dan Dark

Tema **Light** menggunakan kanvas putih bersih, permukaan putih, teks biru-abu tegas, dan aksen biru untuk tindakan utama; tidak ada gradien oranye atau kuning pada latar. Tema **Dark** mempertahankan permukaan navy arang, teks putih kebiruan, serta aksen emas lembut agar tetap nyaman dibaca.

| Token | Light — terinspirasi karakter UMKM-KU | Dark — adaptasi BantuUsaha |
|---|---|---|
| Latar | `#FFFFFF` putih bersih | `#101827` navy arang |
| Surface | `#FFFFFF` putih bersih | `#172235` biru arang |
| Teks utama | `#29435B` biru-abu gelap | `#EFF5FF` putih kebiruan |
| Aksi utama | `#2D6EAE` biru netral | `#E9BC58` emas lembut |
| Aksen sekunder | `#5E315D` plum | `#7FB6E8` biru lembut |
| Batas | `#E2E9ED` abu-biru sangat muda | `#2A3B54` slate navy |
