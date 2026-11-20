export interface SafetyChecklistStep {
  id: string;
  phase: 'sebelum' | 'perjalanan' | 'tujuan';
  title: string;
  description: string;
  recommendedAction: string;
}

export const SAFETY_CHECKLISTS: SafetyChecklistStep[] = [
  {
    id: 'chk-1',
    phase: 'sebelum',
    title: 'Verifikasi Plat Nomor & Wajah Pengemudi',
    description: 'Jangan pernah masuk ke kendaraan sebelum mencocokkan plat nomor fisik dengan plat di layar aplikasi.',
    recommendedAction: 'Jika pengemudi beralasan motor/mobil sedang diganti saudaranya, segera batalkan pesanan dan laporkan ke customer service.',
  },
  {
    id: 'chk-2',
    phase: 'sebelum',
    title: 'Aktifkan Fitur "Bagikan Perjalanan" (Share Trip)',
    description: 'Kirimkan tautan pelacakan GPS live dari aplikasi Gojek/Grab/Maxim ke kontak tepercaya atau grup keluarga.',
    recommendedAction: 'Pastikan baterai ponsel minimal 25% dan GPS aktif sepanjang rute.',
  },
  {
    id: 'chk-3',
    phase: 'perjalanan',
    title: 'Posisi Duduk Strategis (Untuk Layanan Mobil)',
    description: 'Duduk di kursi belakang di sisi kiri (diagonal dengan pengemudi) atau tepat di belakang pengemudi.',
    recommendedAction: 'Hindari duduk di kursi depan kecuali terpaksa. Posisi belakang menyulitkan pengemudi melakukan kontak fisik tak diinginkan.',
  },
  {
    id: 'chk-4',
    phase: 'perjalanan',
    title: 'Perhatikan Kunci Pintu (Child Lock & Window)',
    description: 'Pastikan handle pintu dari dalam tidak terkunci secara mekanis (child lock) dan kaca jendela dapat diturunkan sedikit.',
    recommendedAction: 'Buka sedikit jendela 2-3 cm agar suara teriakan atau sinyal minta tolong dapat terdengar keluar jika terjadi keadaan darurat.',
  },
  {
    id: 'chk-5',
    phase: 'perjalanan',
    title: 'Batas Batasan Obrolan Pribadi',
    description: 'Anda berhak menolak menjawab pertanyaan personal seperti: status pernikahan, apakah tinggal sendiri, atau meminta akun Instagram.',
    recommendedAction: 'Gunakan nada datar dan tegas: "Maaf Pak, saya sedang fokus telepon/urusan kerjaan." Atau aktifkan fitur Panggilan Tiruan di VOWA.',
  },
  {
    id: 'chk-6',
    phase: 'tujuan',
    title: 'Minta Diturunkan di Titik Terang',
    description: 'Jika rumah atau gang tujuan Anda gelap atau sempit, minta turun di minimarket atau gerbang pos satpam yang terang.',
    recommendedAction: 'Tunggu hingga kendaraan ride-hailing berlalu sebelum membuka gerbang rumah agar lokasi tinggal Anda tidak dimonitor.',
  }
];

export interface FiveDMethod {
  key: string;
  name: string;
  shortTag: string;
  concept: string;
  exampleScript: string;
}

export const FIVE_D_METHODS: FiveDMethod[] = [
  {
    key: 'distract',
    name: 'Distract (Alihkan Perhatian)',
    shortTag: 'Alihkan',
    concept: 'Putus fokus pelaku dengan mengalihkan pembicaraan atau berpura-pura menanyakan sesuatu yang tidak berhubungan.',
    exampleScript: '"Pak, tolong berhenti sebentar di Indomaret depan ya, saya mau beli air mineral darurat." atau berpura-pura menerima panggilan telepon penting.',
  },
  {
    key: 'delegate',
    name: 'Delegate (Delegasikan Bantuan)',
    shortTag: 'Minta Bantuan',
    concept: 'Cari pihak ketiga yang memiliki otoritas untuk membantu menengahi atau mengamankan situasi.',
    exampleScript: 'Saat berhenti di lampu merah atau tol, lambaikan tangan ke petugas Dishub/Polantas atau kirim sinyal pesan SOS VOWA ke keluarga.',
  },
  {
    key: 'document',
    name: 'Document (Dokumentasikan Bukti)',
    shortTag: 'Catat Bukti',
    concept: 'Rekam audio secara diam-diam, catat nomor plat, nama driver, nama armada, serta jam persisnya peristiwa terjadi.',
    exampleScript: 'Gunakan brankas laporan VOWA untuk mencatat riwayat perkataan driver dan simpan screenshot resi aplikasi sebelum terhapus.',
  },
  {
    key: 'delay',
    name: 'Delay (Dampingi Setelahnya)',
    shortTag: 'Dampingi',
    concept: 'Jika Anda adalah saksi atau sesama penumpang, dampingi korban setelah kejadian dan validasi perasaannya.',
    exampleScript: '"Kamu tidak sendirian. Apakah kamu terluka? Mau saya temani ke pos pengamanan atau hubungi lembaga bantuan?"',
  },
  {
    key: 'direct',
    name: 'Direct (Tegur Langsung Secara Tegas)',
    shortTag: 'Tegur Tegas',
    concept: 'Gunakan ketegasan lisan tanpa perlu memancing amarah, tetapi tunjukkan batasan fisik yang jelas.',
    exampleScript: '"Tolong fokus menyetir ke rute aplikasi, jangan menyentuh atau berbicara topik tidak pantas. Perjalanan ini sedang saya pantau bersama keluarga."',
  }
];

export interface LawProtection {
  article: string;
  title: string;
  explanation: string;
  penalty: string;
  victimRights: string[];
}

export const UU_TPKS_PROTECTIONS: LawProtection[] = [
  {
    article: 'Pasal 5 UU No. 12 Tahun 2022',
    title: 'Pelecehan Seksual Nonfisik',
    explanation: 'Setiap orang yang melakukan perbuatan seksual secara nonfisik (komentar cabul, catcalling melecehkan, isyarat gestur tubuh vulgar, pesan teks/chat tidak pantas setelah perjalanan) yang merendahkan harkat dan martabat.',
    penalty: 'Pidana penjara paling lama 9 (sembilan) bulan dan/atau denda paling banyak Rp10.000.000.',
    victimRights: [
      'Laporan delik aduan yang dapat diproses langsung dengan bukti rekaman/tangkapan layar',
      'Hak atas kerahasiaan identitas korban',
      'Hak perlindungan dari ancaman pembalasan atau intimidasi pelaku'
    ]
  },
  {
    article: 'Pasal 6 UU No. 12 Tahun 2022',
    title: 'Pelecehan Seksual Fisik',
    explanation: 'Setiap orang yang melakukan perbuatan seksual secara fisik (meraba, memegang anggota tubuh korban tanpa persetujuan, atau mencium) di dalam kendaraan umum atau ruang publik.',
    penalty: 'Pidana penjara paling lama 4 (empat) tahun hingga 12 (dua belas) tahun jika ada penyalahgunaan relasi kuasa atau kerentanan.',
    victimRights: [
      'Hak visum et repertum dan pemeriksaan medis tanpa dipungut biaya',
      'Pendampingan gratis dari advokat pro bono/LBH',
      'Pemulihan psikologis dan restitusi ganti rugi'
    ]
  },
  {
    article: 'Pasal 66 & 70 UU TPKS',
    title: 'Hak Perlindungan & Kerahasiaan Saksi/Korban',
    explanation: 'Aparat penegak hukum dan penyedia layanan (termasuk aplikator ride-hailing) wajib merahasiakan identitas korban dalam setiap proses penyelidikan dan penanganan.',
    penalty: 'Wajib disediakan rumah aman dan bantuan hukum independen.',
    victimRights: [
      'Tidak boleh diberitahukan alamat dan nomor kontak pribadi korban kepada pihak terlapor',
      'Hak atas pendampingan dari awal pelaporan hingga putusan selesai'
    ]
  }
];
