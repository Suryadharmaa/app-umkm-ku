export type Guide = { id: string; title: string; summary: string; icon: string; steps: string[] };
export type Service = { id: string; title: string; summary: string; icon: string; note: string; checklist: string[] };
export type Lesson = { id: string; title: string; duration: string; summary: string; content: string[] };
export type OfficialResource = { id: string; source: string; title: string; summary: string; url: string; category: string };

export const guides: Guide[] = [
  { id: "mulai-usaha", title: "Mulai Usaha", summary: "Rapikan dasar usaha sebelum mulai jualan.", icon: "rocket", steps: ["Tentukan produk atau jasa yang ingin dijual.", "Kenali calon pembeli di sekitar Anda.", "Catat biaya awal yang dibutuhkan.", "Buat harga sederhana yang menutup biaya dan memberi untung."] },
  { id: "produk", title: "Siapkan Produk", summary: "Buat produk lebih mudah dipilih pembeli.", icon: "inventory-2", steps: ["Tuliskan manfaat utama produk Anda.", "Gunakan kemasan yang bersih dan mudah dibuka.", "Ambil foto produk di tempat yang terang.", "Minta satu orang mencoba dan memberi masukan."] },
  { id: "izin", title: "Urus Izin Usaha", summary: "Pahami dokumen penting tanpa bahasa rumit.", icon: "verified-user", steps: ["Siapkan data pemilik dan alamat usaha.", "Mulai dari Nomor Induk Berusaha atau NIB.", "Cek kebutuhan sertifikat halal bila produk Anda relevan.", "Simpan salinan dokumen di tempat yang mudah ditemukan."] },
  { id: "jualan-online", title: "Jualan Online", summary: "Mulai promosi digital dengan langkah kecil.", icon: "campaign", steps: ["Pilih satu saluran jualan yang paling sering dipakai pembeli.", "Tulis deskripsi produk dengan manfaat dan harga yang jelas.", "Unggah foto yang terang dan tidak terlalu ramai.", "Balas pertanyaan calon pembeli dengan ramah dan singkat."] },
];

export const services: Service[] = [
  { id: "nib", title: "Buat NIB", summary: "Nomor pengenal usaha agar aktivitas bisnis lebih tertata.", icon: "badge", note: "NIB dapat menjadi langkah awal untuk mengurus kebutuhan usaha lain. Periksa selalu kanal resmi sebelum mengirim data.", checklist: ["Identitas pemilik usaha", "Alamat usaha yang digunakan", "Jenis kegiatan usaha", "Nomor kontak yang aktif"] },
  { id: "halal", title: "Siapkan Halal", summary: "Kenali bahan, proses, dan dokumen yang perlu dirapikan.", icon: "check-circle", note: "Sertifikasi halal memiliki ketentuan berbeda menurut jenis produk. Gunakan daftar ini untuk menyiapkan informasi awal.", checklist: ["Daftar bahan baku", "Catatan pemasok bahan", "Penjelasan proses produksi", "Foto kemasan produk"] },
  { id: "merek", title: "Lindungi Merek", summary: "Bedakan nama usaha Anda agar lebih mudah dikenali.", icon: "sell", note: "Pilih nama yang mudah diingat dan cek ketersediaannya lewat sumber resmi sebelum memakai atau mendaftarkannya.", checklist: ["Nama merek yang ingin dipakai", "Logo sederhana bila sudah ada", "Daftar produk atau jasa", "Contoh penggunaan merek pada kemasan"] },
  { id: "modal", title: "Cek Kesiapan Modal", summary: "Siapkan data sebelum mencari dukungan modal usaha.", icon: "account-balance-wallet", note: "Mencari modal akan lebih terarah bila Anda memahami kebutuhan biaya, catatan uang, dan rencana pengembalian.", checklist: ["Hitung kebutuhan biaya usaha", "Catat uang masuk dan keluar", "Siapkan rencana penggunaan dana", "Pisahkan uang usaha dan uang pribadi"] },
];

export const lessons: Lesson[] = [
  { id: "harga-produk", title: "Menentukan Harga Produk", duration: "3 menit baca", summary: "Harga yang baik harus menutup biaya dan memberi ruang untung.", content: ["Tuliskan semua biaya yang benar-benar keluar untuk membuat satu produk.", "Tambahkan biaya kecil yang sering terlupa, seperti kemasan atau ongkir bahan.", "Tentukan untung yang wajar, lalu bandingkan dengan harga di sekitar Anda.", "Uji harga tersebut pada beberapa pembeli dan dengarkan pertanyaannya."] },
  { id: "foto-produk", title: "Foto Produk yang Jelas", duration: "2 menit baca", summary: "Tidak perlu alat mahal untuk membuat foto yang mudah dilihat.", content: ["Gunakan cahaya dari dekat jendela pada siang hari.", "Pilih latar yang bersih agar produk menjadi fokus.", "Ambil satu foto dari depan dan satu foto yang memperlihatkan detail.", "Hindari tulisan terlalu banyak di atas foto."] },
  { id: "pisah-uang", title: "Pisahkan Uang Usaha", duration: "3 menit baca", summary: "Membedakan uang usaha membantu Anda melihat kondisi bisnis dengan jujur.", content: ["Tentukan satu tempat khusus untuk menyimpan uang usaha.", "Setiap uang masuk dan keluar dicatat pada hari yang sama.", "Ambil uang untuk kebutuhan pribadi dengan catatan yang jelas.", "Lihat ringkasan setiap minggu untuk mengetahui pola usaha."] },
  { id: "balas-pelanggan", title: "Membalas Pelanggan", duration: "2 menit baca", summary: "Jawaban singkat dan jelas dapat meningkatkan kepercayaan pembeli.", content: ["Sapa pembeli dan jawab pertanyaan utamanya lebih dahulu.", "Sebutkan harga, cara pesan, dan waktu pengiriman dengan jelas.", "Jika stok belum pasti, sampaikan dengan jujur kapan Anda akan memberi kabar.", "Tutup pesan dengan ajakan sederhana untuk memesan."] },
];

export const officialResources: OfficialResource[] = [
  { id: "oss", source: "OSS Indonesia", category: "Legalitas", title: "Mulai memahami perizinan usaha", summary: "Akses panduan dan layanan perizinan dari portal resmi OSS Indonesia.", url: "https://oss.go.id" },
  { id: "halal", source: "BPJPH", category: "Sertifikasi", title: "Kenali persiapan sertifikasi halal", summary: "Pelajari informasi sertifikasi halal dari kanal resmi sebelum menyiapkan dokumen.", url: "https://halal.go.id" },
  { id: "umkm", source: "Kementerian UMKM", category: "Pengembangan", title: "Cari program dan informasi UMKM", summary: "Temukan informasi layanan dan pengembangan usaha dari kanal resmi UMKM.", url: "https://umkm.go.id" },
];

export const readinessQuestions = [
  { id: "profile", question: "Apakah Anda sudah tahu produk atau jasa yang ingin dijual?", help: "Ini membantu Anda memilih panduan yang paling cocok." },
  { id: "product", question: "Apakah Anda sudah punya produk atau contoh layanan?", help: "Produk tidak harus sempurna. Yang penting ada bentuk awal untuk diuji." },
  { id: "money", question: "Apakah uang masuk dan keluar usaha sudah dicatat?", help: "Catatan sederhana cukup untuk memulai." },
  { id: "legal", question: "Apakah Anda sudah menyiapkan data dasar untuk urus izin?", help: "Data dasar meliputi identitas, alamat, serta jenis usaha." },
  { id: "capital", question: "Apakah kebutuhan biaya usaha sudah dihitung?", help: "Hitung bahan, alat, kemasan, dan biaya kecil lainnya." },
] as const;

export type ReadinessKey = (typeof readinessQuestions)[number]["id"];
