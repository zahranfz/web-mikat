import Link from 'next/link';
import { Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="kontak">
      <div className="container">
        <div className="foot-top">
          <div className="foot-brand">
            <div className="brand-text">
              <div className="l1">BEM FT UNSOED · KABINET SAGARA CAKRAWALA</div>
              <div className="l2">KEMENTERIAN MINAT &amp; BAKAT</div>
            </div>
            <p>
              Ruang untuk berlaga &amp; berkarya bagi seluruh Keluarga Besar Mahasiswa Fakultas Teknik Universitas Jenderal Soedirman.
            </p>
            <div style={{ marginTop: '16px', display: 'flex', gap: '14px', alignItems: 'center' }}>
              <a
                href="https://instagram.com/mikatftunsoed"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--gold)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
                <span>@mikatftunsoed</span>
              </a>
            </div>
          </div>

          <div className="foot-cols">
            <div className="foot-col">
              <h4>Navigasi Cepat</h4>
              <ul>
                <li><a href="/#profil">Profil Pengurus</a></li>
                <li><a href="/#tentang">Visi &amp; Misi</a></li>
                <li><a href="/#proker">Program &amp; Agenda</a></li>
                <li><a href="/#peminjaman">Peminjaman Inventaris</a></li>
                <li><a href="/#delegasi">Pengajuan Delegasi</a></li>
              </ul>
            </div>

            <div className="foot-col">
              <h4>Layanan Mahasiswa</h4>
              <ul>
                <li><a href="/peminjaman">Formulir Peminjaman Alat</a></li>
                <li><a href="/delegasi">Pendaftaran Delegasi Lomba</a></li>
                <li><a href="/admin">Portal Admin Pengurus</a></li>
              </ul>
            </div>

            <div className="foot-col">
              <h4>Sekretariat</h4>
              <p style={{ fontSize: '13px', lineHeight: '1.7', maxWidth: '240px', color: 'rgba(244,234,211,0.75)' }}>
                Gedung BEM Fakultas Teknik Unsoed, Kampus Blater, Purbalingga, Jawa Tengah 53371
              </p>
            </div>
          </div>
        </div>

        <div className="foot-bottom">
          &copy; {new Date().getFullYear()} Kementerian Minat dan Bakat BEM FT Unsoed. Dikembangkan dengan Next.js &amp; Supabase.
        </div>
      </div>
    </footer>
  );
}
