'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Scoreboard from '@/components/Scoreboard';
import AccordionProker from '@/components/AccordionProker';
import LoanFormModal from '@/components/LoanFormModal';
import DelegationFormModal from '@/components/DelegationFormModal';
import {
  fetchProker,
  fetchPengurus,
  fetchPeminjaman,
  fetchDelegasi,
  fetchStorageFiles,
} from '@/lib/supabaseClient';
import { ProkerItem, PengurusItem } from '@/lib/initialData';
import {
  FileText,
  FileDown,
  ArrowUpRight,
  Send,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  X,
} from 'lucide-react';

export default function HomePage() {
  const [prokers, setProkers] = useState<ProkerItem[]>([]);
  const [pengurus, setPengurus] = useState<PengurusItem[]>([]);
  const [galleryImages, setGalleryImages] = useState<Array<{ url: string; label: string }>>([]);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isDelegationModalOpen, setIsDelegationModalOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{
    name: string;
    role: string;
    photoUrl: string;
  } | null>(null);

  const galleryCatalog = [
    { file: 'Galeripost-4.0-1.jpg', label: 'POST 4.0' },
    { file: 'Galeritechart-3.0-1.jpg', label: 'Techart 3.0' },
    { file: 'Galerifortuna-1.jpg', label: 'FORTUNA' },
    { file: 'Galeritechno-afterhours-1.jpg', label: 'Techno Afterhours' },
    { file: 'Galeridelegasi-lomba-1.jpg', label: 'Delegasi Lomba' },
    { file: 'Galerilingkar-mikat-1.jpg', label: 'Lingkar Mikat X Sinema' },
  ];

  useEffect(() => {
    async function loadData() {
      const [prokerData, pengurusData, storageGallery] = await Promise.all([
        fetchProker(),
        fetchPengurus(),
        fetchStorageFiles('galeri'),
      ]);

      const storageGalleryMap = new Map(
        storageGallery.map((url) => [url.split('/').pop() || '', url])
      );

      const orderedGallery = galleryCatalog.map(({ file, label }) => ({
        url: storageGalleryMap.get(file) || `/assets/${file}`,
        label,
      }));

      setProkers(prokerData);
      setPengurus(pengurusData);
      setGalleryImages(orderedGallery);
    }
    loadData();
  }, []);

  const leadPengurus = pengurus.filter((p) => p.kategori === 'lead');
  const staffPengurus = pengurus.filter((p) => p.kategori === 'staff');
  const internshipPengurus = pengurus.filter((p) => p.kategori === 'internship');

  const prokerCount = prokers.filter((p) => p.kategori === 'proker').length;
  const agendaCount = prokers.filter((p) => p.kategori === 'agenda').length;

  return (
    <>
      <Navbar />

      <main id="top">
        {/* ================= HERO ================= */}
        <section className="hero">
          <div className="ball-field" aria-hidden="true">
            <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#F4EAD3" stroke="#16214A" strokeWidth="3"/><path d="M20 15 Q50 50 20 85" stroke="#A32330" strokeWidth="3" fill="none"/><path d="M80 15 Q50 50 80 85" stroke="#A32330" strokeWidth="3" fill="none"/></svg>
            <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#F4EAD3" stroke="#16214A" strokeWidth="3"/><path d="M20 15 Q50 50 20 85" stroke="#A32330" strokeWidth="3" fill="none"/><path d="M80 15 Q50 50 80 85" stroke="#A32330" strokeWidth="3" fill="none"/></svg>
            <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#F4EAD3" stroke="#16214A" strokeWidth="3"/><path d="M20 15 Q50 50 20 85" stroke="#A32330" strokeWidth="3" fill="none"/><path d="M80 15 Q50 50 80 85" stroke="#A32330" strokeWidth="3" fill="none"/></svg>
          </div>

          <div className="hero-stars">
            <span>★</span> <span>★</span> <span>★</span>
          </div>

          <h1>
            Ruang untuk
            <span className="script">berlaga &amp; berkarya</span>
          </h1>

          <p className="hero-sub">
            Kementerian Minat dan Bakat BEM FT Unsoed — Kabinet Sagara Cakrawala. Wadah pengembangan potensi mahasiswa dalam bidang seni, olahraga, dan prestasi non-akademik.
          </p>

          <div className="hero-strip">
            <Scoreboard
              prokerCount={prokerCount || 2}
              agendaCount={agendaCount || 6}
              memberCount={pengurus.length || 14}
            />
          </div>

          <div style={{ marginTop: '30px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsLoanModalOpen(true)}
              className="btn-pill primary"
            >
              Pinjam Alat Inventaris
            </button>
            <button
              onClick={() => setIsDelegationModalOpen(true)}
              className="btn-pill secondary"
            >
              Daftar Delegasi Lomba
            </button>
          </div>
        </section>

        {/* ================= MARQUEE TICKER ================= */}
        <div className="marquee-band" aria-hidden="true">
          <div className="marquee-track">
            <span>POST 4.0</span><span className="mq-dot">★</span>
            <span>Techart 3.0</span><span className="mq-dot">★</span>
            <span>FORTUNA</span><span className="mq-dot">★</span>
            <span>Techno Afterhours</span><span className="mq-dot">★</span>
            <span>Techno Talent Hub</span><span className="mq-dot">★</span>
            <span>Delegasi Lomba</span><span className="mq-dot">★</span>
            <span>Lingkar Mikat X Lingkar Sinema</span><span className="mq-dot">★</span>
            <span>POST 4.0</span><span className="mq-dot">★</span>
            <span>Techart 3.0</span><span className="mq-dot">★</span>
            <span>FORTUNA</span><span className="mq-dot">★</span>
            <span>Peminjaman Alat</span><span className="mq-dot">★</span>
          </div>
        </div>

        <div className="stitch"></div>

        {/* ================= PROFIL PENGURUS ================= */}
        <section id="profil" className="sec">
          <div className="container">
            <div className="sec-head">
              <div>
                <div className="eyebrow">
                  <span className="stars"><span>★</span><span>★</span><span>★</span></span>
                  Profil Pengurus
                </div>
                <h2 className="sec-title">Siapa Kami</h2>
              </div>
              <p className="sec-desc">
                Wadah pengembangan prestasi mahasiswa Fakultas Teknik di bidang olahraga dan seni. Ketuk foto pengurus untuk melihat detail.
              </p>
            </div>

            <div className="about-lead">
              <p>
                Kementerian Minat dan Bakat BEM FT Unsoed hadir untuk mewujudkan optimalisasi aktivitas mahasiswa Teknik berdasarkan potensi minat dan bakat yang berkembang di lingkungan fakultas — dari lapangan olahraga hingga panggung kreasi seni.
              </p>
            </div>

            <div className="profile-divider"><span></span></div>

            <h3 className="team-heading">Struktur Kementerian</h3>

            {/* Menteri & Wamen */}
            <div className="tim-caption">Menteri &amp; Wakil Menteri</div>
            <div className="org-lead">
              {leadPengurus.map((item) => (
                <div
                  key={item.id}
                  className="person lead"
                  onClick={() =>
                    setSelectedPhoto({
                      name: item.nama,
                      role: item.role,
                      photoUrl: item.foto_url || '',
                    })
                  }
                >
                  <div className="photo-frame">
                    {item.foto_url ? (
                      <img src={item.foto_url} alt={item.nama} />
                    ) : (
                      <span className="avatar-fallback">{item.initials}</span>
                    )}
                  </div>
                  <div className="pname">{item.nama}</div>
                  <div className="prole">{item.role}</div>
                </div>
              ))}
            </div>

            <div className="org-connector"></div>

            {/* Staff */}
            <div className="tim-caption staff-caption">Staff Minat dan Bakat</div>
            <div className="staff-grid">
              {staffPengurus.map((item) => (
                <div
                  key={item.id}
                  className="person"
                  onClick={() =>
                    setSelectedPhoto({
                      name: item.nama,
                      role: item.role,
                      photoUrl: item.foto_url || '',
                    })
                  }
                >
                  <div className="photo-frame">
                    {item.foto_url ? (
                      <img src={item.foto_url} alt={item.nama} />
                    ) : (
                      <span className="avatar-fallback">{item.initials}</span>
                    )}
                  </div>
                  <div className="pname">{item.nama}</div>
                  <div className="prole">{item.role}</div>
                </div>
              ))}
            </div>

            {/* Internship */}
            {internshipPengurus.length > 0 && (
              <>
                <div className="tim-caption staff-caption">Internship Minat dan Bakat</div>
                <div className="staff-grid">
                  {internshipPengurus.map((item) => (
                    <div
                      key={item.id}
                      className="person"
                      onClick={() =>
                        setSelectedPhoto({
                          name: item.nama,
                          role: item.role,
                          photoUrl: item.foto_url || '',
                        })
                      }
                    >
                      <div className="photo-frame">
                        {item.foto_url ? (
                          <img src={item.foto_url} alt={item.nama} />
                        ) : (
                          <span className="avatar-fallback">{item.initials}</span>
                        )}
                      </div>
                      <div className="pname">{item.nama}</div>
                      <div className="prole">{item.role}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        <div className="stitch"></div>

        {/* ================= GALERI ================= */}
        <section id="galeri" className="sec">
          <div className="container">
            <div className="sec-head">
              <div>
                <div className="eyebrow">
                  <span className="stars"><span>★</span><span>★</span><span>★</span></span>
                  Dokumentasi
                </div>
                <h2 className="sec-title">Galeri Kegiatan</h2>
              </div>
              <p className="sec-desc">Cuplikan kilas balik kegiatan Kementerian Minat dan Bakat BEM FT Unsoed.</p>
            </div>

            <div className="gallery-grid">
              {galleryImages.map((item, index) => (
                <div className="gallery-item" key={`${item.url}-${index}`}>
                  <div className="gallery-frame">
                    <img src={item.url} alt={item.label} />
                  </div>
                  <div className="gallery-cap">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="stitch navy"></div>

        {/* ================= VISI & MISI ================= */}
        <section id="tentang" className="sec visi-sec">
          <div className="container">
            <div className="vm-head">
              <div className="eyebrow" style={{ justifyContent: 'center', color: 'var(--gold)' }}>
                <span className="stars"><span>★</span><span>★</span><span>★</span></span>
              </div>
              <div className="varsity vm-title">Visi</div>
            </div>

            <p className="visi-card">
              Kementerian Minat dan Bakat berperan sebagai ruang yang terbuka dan inovatif bagi seluruh Keluarga Besar Mahasiswa Fakultas Teknik. Kementerian ini mendorong setiap individu untuk menggali, mengasah, dan mengoptimalkan potensi di bidang olahraga, seni, kreativitas, dan inovasi. Melalui arah kerja yang lebih fokus dan strategi yang terstruktur, kementerian ini mendukung berkembangnya beragam potensi mahasiswa secara maksimal.
            </p>

            <div className="vm-head" style={{ marginTop: '64px' }}>
              <div className="varsity vm-title">Misi</div>
            </div>

            <div className="misi-grid">
              <div className="misi-card">
                <div className="mtag">Inklusivitas</div>
                <p>Membuka peluang bagi seluruh KBMFT untuk mewakili, bergabung, dan berpartisipasi dalam berbagai kegiatan olahraga dan seni.</p>
              </div>
              <div className="misi-card">
                <div className="mtag">Pengembangan Prestasi</div>
                <p>Mendorong partisipasi aktif dalam perlombaan tingkat regional, nasional, dan internasional dengan pendataan potensi berkala.</p>
              </div>
              <div className="misi-card">
                <div className="mtag">Pemberdayaan Potensi</div>
                <p>Menyelenggarakan program kerja inovatif yang mendukung KBMFT untuk menyalurkan bakat yang mereka miliki.</p>
              </div>
              <div className="misi-card">
                <div className="mtag">Pendekatan Holistik</div>
                <p>Mengembangkan kegiatan yang tidak hanya berfokus pada prestasi, tetapi juga pembentukan karakter, solidaritas, dan sportivitas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= PROKER & AGENDA ================= */}
        <section id="proker" className="sec" style={{ background: 'var(--cream-soft)' }}>
          <div className="container">
            <div className="sec-head">
              <div>
                <div className="eyebrow">
                  <span className="stars"><span>★</span><span>★</span><span>★</span></span>
                  Minat &amp; Bakat
                </div>
                <h2 className="sec-title">Program &amp; Agenda Kerja</h2>
              </div>
              <p className="sec-desc">
                Klik pada masing-masing program kerja atau agenda kerja untuk membaca rincian lengkapnya.
              </p>
            </div>

            <AccordionProker items={prokers} />
          </div>
        </section>

        <div className="stitch navy"></div>

        {/* ================= PEMINJAMAN ALAT ================= */}
        <section id="peminjaman" className="sec">
          <div className="container">
            <div className="sec-head">
              <div>
                <div className="eyebrow">
                  <span className="stars"><span>★</span><span>★</span><span>★</span></span>
                  Fasilitas
                </div>
                <h2 className="sec-title">Alur Peminjaman Inventaris</h2>
              </div>
              <p className="sec-desc">
                5 langkah mudah meminjam alat dan perlengkapan olahraga/seni Kementerian Minat dan Bakat.
              </p>
            </div>

            <div className="loan-flow">
              <div className="loan-step">
                <div className="loan-num">1</div>
                <div className="loan-body">
                  <div className="loan-title">Ajukan H-1 Sebelum Peminjaman</div>
                  <p>Pengajuan formulir peminjaman maksimal dilakukan 1 hari sebelum barang digunakan.</p>
                </div>
              </div>

              <div className="loan-step">
                <div className="loan-num">2</div>
                <div className="loan-body">
                  <div className="loan-title">Isi Formulir Online</div>
                  <p>Isi formulir peminjaman secara langsung di website ini dengan data yang valid.</p>
                </div>
              </div>

              <div className="loan-step">
                <div className="loan-num">3</div>
                <div className="loan-body">
                  <div className="loan-title">Konfirmasi via WhatsApp</div>
                  <p>Lakukan konfirmasi cepat ke narahubung Kementerian Mikat untuk verifikasi ketersediaan alat.</p>
                </div>
              </div>

              <div className="loan-step">
                <div className="loan-num">4</div>
                <div className="loan-body">
                  <div className="loan-title">Kembalikan Tepat Waktu</div>
                  <p>Barang wajib dikembalikan dalam kondisi bersih dan utuh sesuai tanggal kesepakatan.</p>
                </div>
              </div>

              <div className="loan-step" style={{ gridColumn: '1 / -1' }}>
                <div className="loan-num">5</div>
                <div className="loan-body">
                  <div className="loan-title">Perlu Perpanjangan?</div>
                  <p>Jika masa peminjaman perlu diperpanjang, hubungi narahubung minimal beberapa jam sebelum jadwal pengembalian berakhir.</p>
                </div>
              </div>
            </div>

            <div className="loan-cta">
              <div>
                <div className="loan-cta-title">Siap Meminjam Alat?</div>
                <p>Formulir kini langsung terhubung ke database pengurus Mikat untuk proses verifikasi yang lebih cepat.</p>
              </div>

              <div className="loan-cta-actions">
                <button
                  onClick={() => setIsLoanModalOpen(true)}
                  className="btn-pill primary"
                >
                  <FileText size={16} />
                  <span>Isi Formulir Peminjaman</span>
                </button>
                <a
                  href="https://wa.me/6282241183747?text=Halo%20Kak%20Callista%2C%20saya%20ingin%20bertanya%20mengenai%20ketersediaan%20alat%20inventaris%20Mikat."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pill outline"
                >
                  <Send size={15} />
                  <span>Tanya Narahubung via WA</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="stitch"></div>

        {/* ================= DELEGASI LOMBA ================= */}
        <section id="delegasi" className="sec">
          <div className="container">
            <div className="sec-head">
              <div>
                <div className="eyebrow">
                  <span className="stars"><span>★</span><span>★</span><span>★</span></span>
                  Prestasi Mahasiswa
                </div>
                <h2 className="sec-title">Alur Delegasi Lomba</h2>
              </div>
              <p className="sec-desc">
                Dukungan administrasi dan pendataan bagi mahasiswa Fakultas Teknik yang berlaga di berbagai kompetisi seni dan olahraga.
              </p>
            </div>

            {/* TEMPLATES */}
            <div className="doc-grid">
              <a
                className="doc-card"
                href="https://docs.google.com/document/d/10wMGx-vd7AxC_5esO0XshWET2pjqe8Wx/edit"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="doc-icon"><FileDown size={20} /></div>
                <div>
                  <div className="doc-tag">Berbayar</div>
                  <div className="doc-name">Pakta Integritas Berbayar</div>
                </div>
                <ArrowUpRight size={16} style={{ marginLeft: 'auto', color: 'var(--navy)' }} />
              </a>

              <a
                className="doc-card"
                href="https://docs.google.com/document/d/1zPtnpGNhIFodnuU5Q8unc4zTwRIBcoyK/edit"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="doc-icon"><FileDown size={20} /></div>
                <div>
                  <div className="doc-tag">Gratis / Tidak Berbayar</div>
                  <div className="doc-name">Pakta Integritas Non-Berbayar</div>
                </div>
                <ArrowUpRight size={16} style={{ marginLeft: 'auto', color: 'var(--navy)' }} />
              </a>

              <a
                className="doc-card"
                href="https://docs.google.com/document/d/1eww9J7NlwP_jDJ5rt8Us5rLXvPFVetIO/edit"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="doc-icon"><FileDown size={20} /></div>
                <div>
                  <div className="doc-tag">Proposal</div>
                  <div className="doc-name">Template Pengajuan Delegasi</div>
                </div>
                <ArrowUpRight size={16} style={{ marginLeft: 'auto', color: 'var(--navy)' }} />
              </a>
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                onClick={() => setIsDelegationModalOpen(true)}
                className="btn-pill primary"
                style={{ padding: '14px 28px', fontSize: '14px' }}
              >
                <FileText size={17} />
                <span>Kirim Berkas Pengajuan Delegasi Sekarang</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="lightbox open" onClick={() => setSelectedPhoto(null)}>
          <div className="lightbox-backdrop"></div>
          <div className="lightbox-panel" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setSelectedPhoto(null)}>
              <X size={18} />
            </button>
            <div className="lightbox-photo">
              {selectedPhoto.photoUrl ? (
                <img src={selectedPhoto.photoUrl} alt={selectedPhoto.name} />
              ) : null}
            </div>
            <div className="lightbox-info">
              <div className="lightbox-name">{selectedPhoto.name}</div>
              <div className="lightbox-role">{selectedPhoto.role}</div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Form Modals */}
      <LoanFormModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
      />
      <DelegationFormModal
        isOpen={isDelegationModalOpen}
        onClose={() => setIsDelegationModalOpen(false)}
      />
    </>
  );
}
