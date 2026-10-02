export interface ProkerItem {
  id: string;
  code: string;
  nama: string;
  subtitle?: string;
  kategori: 'proker' | 'agenda';
  deskripsi: string;
  chips: string[];
  urutan: number;
}

export interface PengurusItem {
  id: string;
  nama: string;
  role: string;
  kategori: 'lead' | 'staff' | 'internship';
  foto_url?: string;
  initials: string;
  urutan: number;
}

export interface PeminjamanItem {
  id: string;
  nama_peminjam: string;
  nim: string;
  jurusan: string;
  nama_alat: string;
  jumlah: number;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  keperluan: string;
  no_wa: string;
  status: 'pending' | 'disetujui' | 'ditolak' | 'selesai';
  catatan_admin?: string;
  created_at: string;
}

export interface DelegasiItem {
  id: string;
  nama_ketua: string;
  nim: string;
  jurusan: string;
  nama_lomba: string;
  penyelenggara?: string;
  kategori: 'berbayar' | 'tidak_berbayar';
  link_berkas: string;
  no_wa: string;
  status: 'menunggu_review' | 'diverifikasi' | 'ditolak';
  catatan_admin?: string;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  nama: string;
  total: number;
  tersedia: number;
  kategori: string;
}

export interface AchievementItem {
  id: string;
  nama_mahasiswa: string;
  jurusan: string;
  nama_lomba: string;
  prestasi: string;
  tahun: string;
}

export const INITIAL_PROKER: ProkerItem[] = [
  {
    id: 'proker-1',
    code: 'PROKER · 01',
    nama: 'POST 4.0',
    subtitle: 'Pekan Olahraga Seni Teknik',
    kategori: 'proker',
    deskripsi: 'POST 4.0 ini berbentuk kompetisi olahraga dan seni antar jurusan yang ada di Fakultas Teknik. POST 4.0 bertujuan mewadahi berbagai minat dan bakat dari KBMFT yang nantinya bisa mewakili Fakultas Teknik pada perlombaan di jenjang yang lebih tinggi dan tentunya sebagai ajang silaturahmi antar jurusan.',
    chips: ['Olahraga', 'Seni', 'Antar Jurusan'],
    urutan: 1,
  },
  {
    id: 'proker-2',
    code: 'PROKER · 02',
    nama: 'Techart 3.0',
    subtitle: 'Technic & Art Festival',
    kategori: 'proker',
    deskripsi: 'TechArt atau Pentas Kreasi ini ditujukan untuk mahasiswa baru Fakultas Teknik Unsoed tahun 2026. TechArt 3.0 menjadi ajang bagi mahasiswa baru untuk membangun solidaritas antar angkatan dari setiap jurusan yang ada di Fakultas Teknik, dalam rangka mewujudkan kreativitas mahasiswa baru yang berbentuk kompetisi drama musikal antar jurusan.',
    chips: ['Pentas Kreasi', 'Mahasiswa Baru', 'Drama Musikal'],
    urutan: 2,
  },
  {
    id: 'agenda-1',
    code: 'AGENDA · 01',
    nama: 'Delegasi Lomba',
    kategori: 'agenda',
    deskripsi: 'Delegasi Lomba bertujuan memfasilitasi pengiriman delegasi KBMFT Unsoed ke berbagai perlombaan. Agenda kerja ini berperan sebagai sarana tindak lanjut dari pengembangan minat, bakat, dan menanamkan jiwa kompetitif positif pada mahasiswa dalam bidang kesenian serta keolahragaan.',
    chips: ['Pembinaan', 'Kompetitif'],
    urutan: 3,
  },
  {
    id: 'agenda-2',
    code: 'AGENDA · 02',
    nama: 'FORTUNA',
    subtitle: 'Faculty of Engineering Sport & Art Community',
    kategori: 'agenda',
    deskripsi: 'Komunitas ini didirikan sebagai wadah seluruh KBMFT dalam melatih, menyalurkan, dan menjadi ajang unjuk minat dan bakat mereka dalam bidang olahraga dan seni, sekaligus sebagai wadah mempersiapkan para delegasi untuk perlombaan-perlombaan yang ada.',
    chips: ['Komunitas', 'Olahraga & Seni'],
    urutan: 4,
  },
  {
    id: 'agenda-3',
    code: 'AGENDA · 03',
    nama: 'Techno Afterhours',
    kategori: 'agenda',
    deskripsi: 'Kegiatan music corner santai yang menjadi wadah ekspresi seni serta relaksasi bagi KBMFT melalui penampilan musik akustik yang dikemas dalam suasana chill dan interaktif. Agenda ini mewadahi minat dan bakat KBMFT di bidang seni musik dengan menyediakan ruang hiburan positif.',
    chips: ['Musik Akustik', 'Kekeluargaan'],
    urutan: 5,
  },
  {
    id: 'agenda-4',
    code: 'AGENDA · 04',
    nama: 'Techno Talent Hub',
    kategori: 'agenda',
    deskripsi: 'Platform yang tersedia di sosial media untuk menginformasikan berbagai perlombaan. Techno Talent Hub hadir melalui saluran WhatsApp yang terdapat pada linktree bio Instagram Kementerian Minat dan Bakat, dapat diakses oleh seluruh KBMFT.',
    chips: ['Info Lomba', 'WhatsApp Channel'],
    urutan: 6,
  },
  {
    id: 'agenda-5',
    code: 'AGENDA · 05',
    nama: 'Lingkar Mikat X Lingkar Sinema',
    kategori: 'agenda',
    deskripsi: 'Kegiatan yang mempertemukan divisi Minat dan Bakat masing-masing himpunan. Kegiatan ini diadakan untuk mendiskusikan serta memberikan informasi terkait setiap program dan agenda kerja dari Kementerian Minat dan Bakat dan Kementerian Sinema.',
    chips: ['Kolaborasi Kementerian', 'Sinergi KBMFT'],
    urutan: 7,
  },
  {
    id: 'agenda-6',
    code: 'AGENDA · 06',
    nama: 'DKV',
    subtitle: 'Desain Komunikasi Visual',
    kategori: 'agenda',
    deskripsi: 'Seluruh bentuk desain grafis yang ada di Kementerian Minat dan Bakat — seperti feeds Instagram @mikatftunsoed, logo agenda kerja, dan pamflet agenda kerja. DKV merupakan non program/agenda kerja, namun menjadi upaya branding Kementerian.',
    chips: ['Branding', 'Desain Grafis'],
    urutan: 8,
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'inv-1', nama: 'Sound System / TOA', total: 2, tersedia: 2, kategori: 'Elektronik' },
  { id: 'inv-2', nama: 'Bola Basket', total: 5, tersedia: 3, kategori: 'Olahraga' },
  { id: 'inv-3', nama: 'Bola Futsal', total: 4, tersedia: 4, kategori: 'Olahraga' },
  { id: 'inv-4', nama: 'Gitar Akustik', total: 2, tersedia: 1, kategori: 'Seni' },
  { id: 'inv-5', nama: 'Tenda Dome', total: 3, tersedia: 0, kategori: 'Outdoor' },
];

export const INITIAL_ACHIEVEMENTS: AchievementItem[] = [
  { id: 'ach-1', nama_mahasiswa: 'Rifki Pratama', jurusan: 'Teknik Informatika', nama_lomba: 'Kontes Robot Cerdas Indonesia 2026', prestasi: 'Juara 1 Nasional', tahun: '2026' },
  { id: 'ach-2', nama_mahasiswa: 'Nadia Saphira', jurusan: 'Teknik Sipil', nama_lomba: 'BIM National Competition', prestasi: 'Juara 2', tahun: '2026' },
  { id: 'ach-3', nama_mahasiswa: 'Bima Aryasena', jurusan: 'Teknik Elektro', nama_lomba: 'Lomba Inovasi Energi Terbarukan', prestasi: 'Best Inovation Award', tahun: '2025' },
];

export const INITIAL_PENGURUS: PengurusItem[] = [
  {
    id: 'p-1',
    nama: 'Callista Okta Livia',
    role: 'Menteri',
    kategori: 'lead',
    foto_url: '/assets/IMG_6272 (Large).JPG',
    initials: 'CO',
    urutan: 1,
  },
  {
    id: 'p-2',
    nama: 'Muhammad Raihan Nabil',
    role: 'Wakil Menteri',
    kategori: 'lead',
    foto_url: '/assets/IMG_6317 (Large).JPG',
    initials: 'MR',
    urutan: 2,
  },
  {
    id: 'p-3',
    nama: 'Satria Nugraha Surya Putra',
    role: 'Staff',
    kategori: 'staff',
    foto_url: '/assets/IMG_6309 (Large).JPG',
    initials: 'SN',
    urutan: 3,
  },
  {
    id: 'p-4',
    nama: 'Lionny Amanda Karubaba',
    role: 'Staff',
    kategori: 'staff',
    foto_url: '/assets/IMG_6302 (Large).JPG',
    initials: 'LA',
    urutan: 4,
  },
  {
    id: 'p-5',
    nama: 'Khaneswari Putri Pradipta',
    role: 'Staff',
    kategori: 'staff',
    foto_url: '/assets/IMG_6299 (Large).JPG',
    initials: 'KP',
    urutan: 5,
  },
  {
    id: 'p-6',
    nama: 'Zahran Febrian Nugraha',
    role: 'Staff',
    kategori: 'staff',
    foto_url: '/assets/IMG_6281 (Large).JPG',
    initials: 'ZF',
    urutan: 6,
  },
  {
    id: 'p-7',
    nama: 'Ratu Alya Al Ghaniyy Susanto',
    role: 'Staff',
    kategori: 'staff',
    foto_url: '/assets/IMG_6320 (Large).JPG',
    initials: 'RA',
    urutan: 7,
  },
  {
    id: 'p-8',
    nama: 'Alya Levia Putri',
    role: 'Staff',
    kategori: 'staff',
    foto_url: '/assets/IMG_6291 (Large).JPG',
    initials: 'AL',
    urutan: 8,
  },
  {
    id: 'p-9',
    nama: 'Hafiz Juninda',
    role: 'Staff',
    kategori: 'staff',
    foto_url: '/assets/IMG_6306 (Large).JPG',
    initials: 'HJ',
    urutan: 9,
  },
  {
    id: 'p-10',
    nama: 'Lunetta Az-Zahra Kayana Hidayat',
    role: 'Staff',
    kategori: 'staff',
    foto_url: '/assets/IMG_6296 (Large).JPG',
    initials: 'LK',
    urutan: 10,
  },
  {
    id: 'p-11',
    nama: 'Samuel Yosua Sahat',
    role: 'Internship',
    kategori: 'internship',
    foto_url: '/assets/Foto Samuel Yosua Sahat.JPG',
    initials: 'SY',
    urutan: 11,
  },
  {
    id: 'p-12',
    nama: 'Felysha Dwita Anindhya Putri',
    role: 'Internship',
    kategori: 'internship',
    foto_url: '/assets/Foto Felysha Dwita Anindhya Putri.JPG',
    initials: 'FD',
    urutan: 12,
  },
  {
    id: 'p-13',
    nama: 'Queena Salma Rizky Barnanda',
    role: 'Internship',
    kategori: 'internship',
    foto_url: '/assets/Foto Queena Salma Rizky Barnanda.JPG',
    initials: 'QS',
    urutan: 13,
  },
  {
    id: 'p-14',
    nama: 'Muhammad Rio Ferdinand',
    role: 'Internship',
    kategori: 'internship',
    foto_url: '/assets/Foto Muhammad Rio Ferdinand.JPG',
    initials: 'MR',
    urutan: 14,
  },
];

export const INITIAL_PEMINJAMAN: PeminjamanItem[] = [
  {
    id: 'loan-demo-1',
    nama_peminjam: 'Bagas Aditya',
    nim: 'H1D022045',
    jurusan: 'Informatika',
    nama_alat: 'Bola Futsal & Cone Latihan',
    jumlah: 2,
    tanggal_pinjam: '2026-09-20',
    tanggal_kembali: '2026-09-22',
    keperluan: 'Latihan tim futsal HMTI jelang POST 4.0',
    no_wa: '081234567890',
    status: 'disetujui',
    catatan_admin: 'Sudah diverifikasi dan disetujui BPH',
    created_at: '2026-09-15T08:30:00Z',
  },
  {
    id: 'loan-demo-2',
    nama_peminjam: 'Dinda Maharani',
    nim: 'H1A023012',
    jurusan: 'Teknik Sipil',
    nama_alat: 'Sound Portable & Mic Wireless',
    jumlah: 1,
    tanggal_pinjam: '2026-09-24',
    tanggal_kembali: '2026-09-25',
    keperluan: 'Acara sharing session komunitas seni teknik',
    no_wa: '085712349988',
    status: 'pending',
    created_at: '2026-09-16T11:15:00Z',
  },
];

export const INITIAL_DELEGASI: DelegasiItem[] = [
  {
    id: 'del-demo-1',
    nama_ketua: 'Rifki Pratama',
    nim: 'H1B022019',
    jurusan: 'Teknik Elektro',
    nama_lomba: 'KRI (Kontes Robot Indonesia) 2026 Tingkat Regional',
    penyelenggara: 'Balai Pengembangan Talenta Indonesia',
    kategori: 'berbayar',
    link_berkas: 'https://drive.google.com/drive/folders/example1',
    no_wa: '081399882211',
    status: 'diverifikasi',
    catatan_admin: 'Pakta integritas dan proposal lengkap',
    created_at: '2026-09-12T14:00:00Z',
  },
  {
    id: 'del-demo-2',
    nama_ketua: 'Citra Amelia',
    nim: 'H1C023004',
    jurusan: 'Teknik Geologi',
    nama_lomba: 'Kompetisi Solo Vokal Brawijaya Festival',
    penyelenggara: 'Universitas Brawijaya',
    kategori: 'tidak_berbayar',
    link_berkas: 'https://drive.google.com/drive/folders/example2',
    no_wa: '082155667788',
    status: 'menunggu_review',
    created_at: '2026-09-16T09:45:00Z',
  },
];
