'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Shield, PhoneCall } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav id="siteNav" className={isScrolled ? 'scrolled' : ''}>
      <div className="nav-bars">
        <span className="b1"></span>
        <span className="b2"></span>
        <span className="b3"></span>
      </div>

      <div className="nav-body">
        <div className="nav-inner">
          <Link href="/" className="brand">
            <div className="brand-mark">
              <img
                src="/assets/Mikat Logo Preview 1.png"
                alt="Logo Mikat"
                className="brand-logo"
              />
            </div>
            <div className="brand-text">
              <div className="l1">BEM FT Unsoed</div>
              <div className="l2">MINAT &amp; BAKAT</div>
            </div>
          </Link>

          <ul className="nav-links">
            <li><a href="/#profil">Profil</a></li>
            <li><a href="/#galeri">Galeri</a></li>
            <li><a href="/#tentang">Visi &amp; Misi</a></li>
            <li><a href="/#proker">Proker</a></li>
            <li><a href="/#peminjaman">Peminjaman</a></li>
            <li><a href="/#delegasi">Delegasi</a></li>
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/admin" className="nav-admin-btn" title="Panel Khusus Pengurus">
              <Shield size={14} />
              <span>Admin</span>
            </Link>
            <a href="/#kontak" className="nav-cta">
              <PhoneCall size={13} />
              <span>Kontak</span>
            </a>
            <button
              className="menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu navigasi"
            >
              {mobileMenuOpen ? <X size={22} color="#16214A" /> : <Menu size={22} color="#16214A" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu open">
          <a href="/#profil" onClick={() => setMobileMenuOpen(false)}>Profil</a>
          <a href="/#galeri" onClick={() => setMobileMenuOpen(false)}>Galeri</a>
          <a href="/#tentang" onClick={() => setMobileMenuOpen(false)}>Visi &amp; Misi</a>
          <a href="/#proker" onClick={() => setMobileMenuOpen(false)}>Program &amp; Agenda</a>
          <a href="/#peminjaman" onClick={() => setMobileMenuOpen(false)}>Peminjaman Alat</a>
          <a href="/#delegasi" onClick={() => setMobileMenuOpen(false)}>Delegasi Lomba</a>
          <Link href="/admin" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--gold)' }}>
            Panel Admin
          </Link>
        </div>
      )}
    </nav>
  );
}
