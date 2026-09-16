'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Shield, PhoneCall } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('top');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    const sections = ['profil', 'galeri', 'tentang', 'proker', 'peminjaman', 'delegasi']
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: [0.1, 0.3, 0.6] }
    );
    sections.forEach((section) => observer.observe(section));

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleEscape);
      observer.disconnect();
    };
  }, []);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const isActive = (section: string) => activeSection === section;

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
            <li><a className={isActive('profil') ? 'active' : ''} href="/#profil">Profil</a></li>
            <li><a className={isActive('galeri') ? 'active' : ''} href="/#galeri">Galeri</a></li>
            <li><a className={isActive('tentang') ? 'active' : ''} href="/#tentang">Visi &amp; Misi</a></li>
            <li><a className={isActive('proker') ? 'active' : ''} href="/#proker">Proker</a></li>
            <li><a className={isActive('peminjaman') ? 'active' : ''} href="/#peminjaman">Peminjaman</a></li>
            <li><a className={isActive('delegasi') ? 'active' : ''} href="/#delegasi">Delegasi</a></li>
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
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} color="#16214A" /> : <Menu size={22} color="#16214A" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu open">
          <a href="/#profil" onClick={closeMobileMenu}>Profil</a>
          <a href="/#galeri" onClick={closeMobileMenu}>Galeri</a>
          <a href="/#tentang" onClick={closeMobileMenu}>Visi &amp; Misi</a>
          <a href="/#proker" onClick={closeMobileMenu}>Program &amp; Agenda</a>
          <a href="/#peminjaman" onClick={closeMobileMenu}>Peminjaman Alat</a>
          <a href="/#delegasi" onClick={closeMobileMenu}>Delegasi Lomba</a>
          <Link href="/admin" onClick={closeMobileMenu} style={{ color: 'var(--gold)' }}>
            Panel Admin
          </Link>
        </div>
      )}
    </nav>
  );
}
