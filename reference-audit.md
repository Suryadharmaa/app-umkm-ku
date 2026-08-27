# Audit Referensi Redesign BantuUsaha

## Referensi yang Dianalisis

SAPA UMKM menempatkan dirinya sebagai platform terpadu untuk perjalanan usaha dari tahap memulai hingga berkembang. Nilai yang perlu diadaptasi bukanlah penyalinan tampilan, melainkan penataan layanan yang jelas dan rasa percaya melalui kategori kapabilitas seperti verifikasi, peningkatan kapasitas, pembukuan, legalitas, sertifikasi, pembiayaan, komunitas, dan insight.

UMKM-KU menunjukkan pola yang lebih relevan untuk aplikasi pendamping pemula: pertanyaan kebutuhan di bagian atas, akses informasi tanpa pendaftaran, tindakan utama yang jelas, bahasa sehari-hari, dan pengelompokan layanan berdasarkan masalah pengguna. Fitur yang paling sesuai untuk tahap ini adalah berita resmi terkurasi, kategori bantuan “Cari Modal”, materi belajar singkat, pembukuan cepat, checklist izin, serta cek kesiapan usaha.

## Penerapan pada BantuUsaha

| Prinsip referensi | Penerapan desain ulang | Dampak UX yang ditargetkan |
|---|---|---|
| Layanan terpadu berdasarkan perjalanan usaha | Dashboard memetakan kebutuhan menjadi “Mulai”, “Kelola”, dan “Tumbuh” | Pengguna dapat memilih langkah tanpa memahami struktur lembaga |
| CTA dan hierarki yang tegas | Satu aksi utama per modul, tombol berkontras tinggi, serta tindakan lanjutan sekunder | Mengurangi kebingungan dan meningkatkan keterbacaan |
| Akses awal tanpa hambatan | Berita, panduan, materi, dan layanan terbuka tanpa akun | Pengguna pemula bisa mencoba manfaat sebelum memberikan data |
| Informasi ringkas dan praktis | Kartu tindakan, status progres, konten mikro, serta checklist | Mengubah informasi panjang menjadi tindakan konkret |
| Kepercayaan layanan | Penanda konten resmi, catatan batasan, dan penjelasan penyimpanan lokal | Mengurangi keraguan saat pengguna membaca layanan legalitas dan modal |

## Masalah yang Harus Diatasi

Audit awal aplikasi menemukan pemakaian warna teks dari token tema di atas beberapa latar komponen yang memakai nilai warna tetap. Ketidakselarasan ini berisiko mengurangi kontras pada tombol dan label. Redesign akan menggunakan pasangan token teks/latar yang eksplisit pada komponen tombol, mengurangi campuran warna tetap dan token, serta menetapkan tiga tingkatan aksi: primer, sekunder, dan teks.

Struktur beranda juga akan diganti dari kumpulan kartu setara menjadi dashboard dengan urutan keputusan yang jelas: ringkasan kondisi usaha, aksi utama yang disarankan, layanan berdasarkan tahap perjalanan, lalu informasi pendukung. Pendekatan ini menghindari kesan generik dan memberi konteks langsung kepada pengguna.

## Sumber

- [SAPA UMKM](https://sapa.umkm.go.id/), diakses 25 Agustus 2026.
- [UMKM-KU](https://suryadharmaa.github.io/UMKM-KU/index.html), diakses 25 Agustus 2026.
