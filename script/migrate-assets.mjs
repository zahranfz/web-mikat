import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Baca .env.local secara manual
function loadEnv() {
  const envPath = path.join(rootDir, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ File .env.local tidak ditemukan di:', envPath);
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      env[key] = val;
    }
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum disetel di .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET_NAME = 'mikat-assets';

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    case '.pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}

// Data Pengurus Awal untuk Sinkronisasi DB
const INITIAL_PENGURUS = [
  { id: 'p-1', nama: 'Callista Okta Livia', role: 'Menteri', kategori: 'lead', localFile: 'IMG_6272 (Large).JPG', initials: 'CO', urutan: 1 },
  { id: 'p-2', nama: 'Muhammad Raihan Nabil', role: 'Wakil Menteri', kategori: 'lead', localFile: 'IMG_6317 (Large).JPG', initials: 'MR', urutan: 2 },
  { id: 'p-3', nama: 'Satria Nugraha Surya Putra', role: 'Staff', kategori: 'staff', localFile: 'IMG_6309 (Large).JPG', initials: 'SN', urutan: 3 },
  { id: 'p-4', nama: 'Lionny Amanda Karubaba', role: 'Staff', kategori: 'staff', localFile: 'IMG_6302 (Large).JPG', initials: 'LA', urutan: 4 },
  { id: 'p-5', nama: 'Khaneswari Putri Pradipta', role: 'Staff', kategori: 'staff', localFile: 'IMG_6299 (Large).JPG', initials: 'KP', urutan: 5 },
  { id: 'p-6', nama: 'Zahran Febrian Nugraha', role: 'Staff', kategori: 'staff', localFile: 'IMG_6281 (Large).JPG', initials: 'ZF', urutan: 6 },
  { id: 'p-7', nama: 'Ratu Alya Al Ghaniyy Susanto', role: 'Staff', kategori: 'staff', localFile: 'IMG_6320 (Large).JPG', initials: 'RA', urutan: 7 },
  { id: 'p-8', nama: 'Alya Levia Putri', role: 'Staff', kategori: 'staff', localFile: 'IMG_6291 (Large).JPG', initials: 'AL', urutan: 8 },
  { id: 'p-9', nama: 'Hafiz Juninda', role: 'Staff', kategori: 'staff', localFile: 'IMG_6306 (Large).JPG', initials: 'HJ', urutan: 9 },
  { id: 'p-10', nama: 'Lunetta Az-Zahra Kayana Hidayat', role: 'Staff', kategori: 'staff', localFile: 'IMG_6296 (Large).JPG', initials: 'LK', urutan: 10 },
  { id: 'p-11', nama: 'Samuel Yosua Sahat', role: 'Internship', kategori: 'internship', localFile: 'Foto Samuel Yosua Sahat.JPG', initials: 'SY', urutan: 11 },
  { id: 'p-12', nama: 'Felysha Dwita Anindhya Putri', role: 'Internship', kategori: 'internship', localFile: 'Foto Felysha Dwita Anindhya Putri.JPG', initials: 'FD', urutan: 12 },
  { id: 'p-13', nama: 'Queena Salma Rizky Barnanda', role: 'Internship', kategori: 'internship', localFile: 'Foto Queena Salma Rizky Barnanda.JPG', initials: 'QS', urutan: 13 },
  { id: 'p-14', nama: 'Muhammad Rio Ferdinand', role: 'Internship', kategori: 'internship', localFile: 'Foto Muhammad Rio Ferdinand.JPG', initials: 'MR', urutan: 14 },
];

const INITIAL_PROKER = [
  { id: 'pr-1', code: 'PK-01', nama: 'Pekan Olahraga & Seni Teknik (POST 4.0)', subtitle: 'Pentas Kompetisi Akbar Mahasiswa Teknik Unsoed', kategori: 'proker', deskripsi: 'Ajang kompetisi olahraga dan seni terbesar bagi seluruh mahasiswa Fakultas Teknik Unsoed. Mempertandingkan cabang olahraga futsal, basket, bulutangkis, e-sports, serta penampilan bakat seni musik dan fotografi.', chips: ['Kompetisi Olahraga', 'Pentas Seni', 'Fakultas Teknik'], urutan: 1 },
  { id: 'pr-2', code: 'PK-02', nama: 'Techart 3.0', subtitle: 'Pameran Karya Inovasi & Eksibisi Seni Digital', kategori: 'proker', deskripsi: 'Eksibisi karya teknologi dan seni hasil kreasi mahasiswa FT Unsoed. Menampilkan karya robotika, software showcase, UI/UX exhibition, pameran seni instalasi visual, serta talkshow bersama pakar industri kreatif.', chips: ['Pameran Karya', 'Teknologi Kreatif', 'Talkshow'], urutan: 2 },
  { id: 'pr-3', code: 'PK-03', nama: 'FORTUNA (Forum Diskusi & Apresiasi Seni)', subtitle: 'Wadah Apresiasi Minat Seni Mahasiswa Teknik', kategori: 'proker', deskripsi: 'Program kolaborasi komunitas seni Fakultas Teknik untuk bertukar ide, jamming session, dan apresiasi karya mahasiswa di bidang musik, sastra, tari, dan seni rupa.', chips: ['Komunitas Seni', 'Jamming Session', 'Apresiasi Karya'], urutan: 3 },
  { id: 'ag-1', code: 'AG-01', nama: 'Techno Afterhours', subtitle: 'Latihan Rutin Olahraga & Fun Games Sore', kategori: 'agenda', deskripsi: 'Agenda rutin mingguan untuk menjaga kebugaran, kesehatan jasmani, dan mempererat tali silaturahmi antar civitas akademika FT Unsoed melalui fun match badminton, futsal, dan basket santai.', chips: ['Olahraga Rutin', 'Fun Games', 'Komunitas'], urutan: 4 },
  { id: 'ag-2', code: 'AG-02', nama: 'Fasilitasi Delegasi Lomba', subtitle: 'Dukungan Administratif & Finansial Kompetisi Luar Kampus', kategori: 'agenda', deskripsi: 'Pendampingan, inventarisasi data, penerbitan surat rekomendasi, serta fasilitasi bantuan dana delegasi bagi mahasiswa berprestasi yang membawa nama Fakultas Teknik di kancah regional maupun nasional.', chips: ['Delegasi Prestasi', 'Bantuan Dana', 'Rekomendasi'], urutan: 5 },
  { id: 'ag-3', code: 'AG-03', nama: 'Lingkar Mikat', subtitle: 'Koordinasi Internal & Monitoring Perkembangan Anggota', kategori: 'agenda', deskripsi: 'Forum pertemuan rutin seluruh pengurus dan staf magang Kementerian Minat dan Bakat untuk evaluasi berkala, sharing session, dan penguatan internal organisasi.', chips: ['Internal Mikat', 'Evaluasi', 'Upgrading'], urutan: 6 },
];

async function main() {
  console.log('🚀 Memulai migrasi assets ke Supabase Storage & Sinkronisasi DB...\n');
  console.log(`📡 URL Target: ${supabaseUrl}`);
  console.log(`📦 Bucket Target: ${BUCKET_NAME}\n`);

  // Coba buat bucket jika belum ada
  const { data: bucketData, error: bucketError } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
  });
  if (bucketError) {
    if (bucketError.message.includes('already exists')) {
      console.log(`Bucket '${BUCKET_NAME}' sudah ada.`);
    } else {
      console.warn(`Perhatian pembuatan bucket: ${bucketError.message}`);
      console.warn(`Jika bucket '${BUCKET_NAME}' belum ada, silakan buat di menu Storage dashboard Supabase dan centang "Public bucket".\n`);
    }
  } else {
    console.log(` Bucket '${BUCKET_NAME}' berhasil dibuat secara otomatis!`);
  }

  const assetsDir = path.join(rootDir, 'public', 'assets');
  if (!fs.existsSync(assetsDir)) {
    console.error(' Direktori public/assets tidak ditemukan!');
    process.exit(1);
  }

  const files = fs.readdirSync(assetsDir);
  console.log(` Ditemukan ${files.length} file di public/assets.\n`);

  const uploadedUrls = {}; // localFileName -> publicUrl

  for (const file of files) {
    const filePath = path.join(assetsDir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) continue;

    // Tentukan folder penyimpanan di Supabase
    let targetFolder = 'galeri';
    if (file.startsWith('IMG_') || file.startsWith('Foto')) {
      targetFolder = 'pengurus';
    } else if (file.toLowerCase().includes('logo')) {
      targetFolder = 'brand';
    }

    // Bersihkan nama file untuk storage path (ganti spasi atau kurung agar URL rapi)
    const safeName = file.replace(/\s+/g, '_').replace(/[()]/g, '');
    const storagePath = `${targetFolder}/${safeName}`;
    const contentType = getMimeType(file);
    const fileBuffer = fs.readFileSync(filePath);

    process.stdout.write(`⏳ Mengunggah [${targetFolder}] ${file} ... `);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType,
        upsert: true, // Timpa jika sudah ada
      });

    if (error) {
      console.log(`Gagal: ${error.message}`);
    } else {
      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
      uploadedUrls[file] = data.publicUrl;
      console.log(`✅ Berhasil!`);
      console.log(`   🔗 ${data.publicUrl}`);
    }
  }

  console.log('\n======================================================');
  console.log('📊 SINKRONISASI KE DATABASE SUPABASE');
  console.log('======================================================\n');

  // 1. SINKRONISASI PENGURUS
  console.log('👥 Memperbarui data tabel `pengurus`...');
  for (const item of INITIAL_PENGURUS) {
    const publicUrl = uploadedUrls[item.localFile] || `/assets/${item.localFile}`;
    const pengurusRow = {
      nama: item.nama,
      role: item.role,
      kategori: item.kategori,
      foto_url: publicUrl,
      initials: item.initials,
      urutan: item.urutan,
    };

    // Cek apakah pengurus dengan nama ini sudah ada
    const { data: existing } = await supabase
      .from('pengurus')
      .select('id')
      .eq('nama', item.nama)
      .maybeSingle();

    if (existing) {
      const { error: updateErr } = await supabase
        .from('pengurus')
        .update({ foto_url: publicUrl, role: item.role, kategori: item.kategori, urutan: item.urutan })
        .eq('id', existing.id);
      if (updateErr) console.warn(`   ⚠️ Update ${item.nama} gagal:`, updateErr.message);
      else console.log(`   ✅ Diperbarui: ${item.nama} -> ${publicUrl.slice(0, 50)}...`);
    } else {
      // Biarkan Postgres menghasilkan UUID secara otomatis
      const { error: insertErr } = await supabase
        .from('pengurus')
        .insert([pengurusRow]);
      if (insertErr) console.warn(`   ⚠️ Insert ${item.nama} gagal:`, insertErr.message);
      else console.log(`   ✨ Ditambahkan: ${item.nama}`);
    }
  }

  // 2. SINKRONISASI PROKER & AGENDA
  console.log('\n📋 Memeriksa data tabel `proker`...');
  const { data: existingProker } = await supabase.from('proker').select('id');
  if (!existingProker || existingProker.length === 0) {
    console.log('   Data proker masih kosong, melakukan seeding awal...');
    // Buang id custom string 'pr-1' agar Postgres generate UUID
    const prokerDataWithoutCustomId = INITIAL_PROKER.map(({ id, ...rest }) => rest);
    const { error: prokerErr } = await supabase.from('proker').insert(prokerDataWithoutCustomId);
    if (prokerErr) console.warn('   ⚠️ Seeding proker gagal:', prokerErr.message);
    else console.log('   ✅ 6 Program & Agenda Kerja berhasil di-seed ke database!');
  } else {
    console.log(`   ℹ️ Tabel proker sudah memiliki ${existingProker.length} item.`);
  }

  // Simpan mapping URL ke file lokal sebagai cadangan
  const mappingPath = path.join(rootDir, 'src', 'lib', 'supabaseAssets.json');
  fs.writeFileSync(mappingPath, JSON.stringify(uploadedUrls, null, 2));
  console.log(`\n💾 Pemetaan URL tersimpan di: src/lib/supabaseAssets.json`);

  console.log('\n🎉 SEMUA PROSES SELESAI!');
}

main().catch((err) => {
  console.error('\n❌ Terjadi error:', err);
  process.exit(1);
});
