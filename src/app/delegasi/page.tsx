'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft, CheckCircle2, Send, Loader2, Award, FileDown, ArrowUpRight } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { addDelegasi } from '@/lib/supabaseClient';

export default function DelegasiPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [activeFlow, setActiveFlow] = useState<'berbayar' | 'gratis'>('berbayar');
  const [formData, setFormData] = useState({
    nama_ketua: '',
    nim: '',
    jurusan: 'Informatika',
    nama_lomba: '',
    penyelenggara: '',
    kategori: 'berbayar' as 'berbayar' | 'tidak_berbayar',
    link_berkas: '',
    no_wa: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await addDelegasi(formData, turnstileToken);
      if (res.success) {
        setSubmitted(true);
      } else {
        alert(res.error || 'Pengajuan delegasi gagal disimpan.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat memproses pendaftaran.');
    } finally {
      setLoading(false);
    }
  };

  const waLink = `https://wa.me/6282241183747?text=Halo%20Kak%20Callista%2C%20saya%20sudah%20mengajukan%20delegasi%20lomba%20atas%20nama%20${encodeURIComponent(formData.nama_ketua)}%20(${encodeURIComponent(formData.nim)})%20untuk%20lomba%20${encodeURIComponent(formData.nama_lomba)}.%20Berikut%20tautan%20berkasnya%3A%20${encodeURIComponent(formData.link_berkas)}`;

  return (
    <>
      <Navbar />

      <main style={{ paddingTop: 'calc(var(--nav-h) + 40px)', paddingBottom: '80px' }}>
        <div className="container" style={{ maxWidth: '780px' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--red)',
              marginBottom: '20px',
            }}
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Beranda</span>
          </Link>

          {/* Unduh Template Panduan */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--ink-soft)', fontWeight: 700, marginBottom: '10px' }}>
              Unduh Dokumen Panduan &amp; Template
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              <a
                href="https://docs.google.com/document/d/10wMGx-vd7AxC_5esO0XshWET2pjqe8Wx/edit"
                target="_blank"
                rel="noopener noreferrer"
                className="doc-card"
                style={{ padding: '12px 14px' }}
              >
                <FileDown size={18} color="var(--red)" />
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--navy)' }}>Pakta Integritas Berbayar</span>
              </a>
              <a
                href="https://docs.google.com/document/d/1zPtnpGNhIFodnuU5Q8unc4zTwRIBcoyK/edit"
                target="_blank"
                rel="noopener noreferrer"
                className="doc-card"
                style={{ padding: '12px 14px' }}
              >
                <FileDown size={18} color="var(--navy)" />
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--navy)' }}>Pakta Non-Berbayar</span>
              </a>
              <a
                href="https://docs.google.com/document/d/1eww9J7NlwP_jDJ5rt8Us5rLXvPFVetIO/edit"
                target="_blank"
                rel="noopener noreferrer"
                className="doc-card"
                style={{ padding: '12px 14px' }}
              >
                <FileDown size={18} color="var(--gold)" />
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--navy)' }}>Template Proposal</span>
              </a>
            </div>
          </div>

          {/* ====== ALUR DELEGASI ====== */}
          <div style={{ marginBottom: '32px' }}>
            <h2
              style={{
                fontFamily: 'Anton',
                fontSize: '24px',
                color: 'var(--navy)',
                letterSpacing: '.3px',
                marginBottom: '6px',
              }}
            >
              Alur Pengajuan Delegasi Lomba
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: '20px' }}>
              Pilih kategori lomba yang kamu ikuti, lalu ikuti langkah-langkahnya.
            </p>

            {/* Tab Switch */}
            <div style={{ marginBottom: '24px' }}>
              <div className="flow-tabs" role="tablist" aria-label="Kategori delegasi lomba">
                <button
                  className={`flow-tab-btn${activeFlow === 'berbayar' ? ' active' : ''}`}
                  onClick={() => setActiveFlow('berbayar')}
                  role="tab"
                  aria-selected={activeFlow === 'berbayar'}
                >
                  Lomba Berbayar<span className="cnt">06</span>
                </button>
                <button
                  className={`flow-tab-btn${activeFlow === 'gratis' ? ' active' : ''}`}
                  onClick={() => setActiveFlow('gratis')}
                  role="tab"
                  aria-selected={activeFlow === 'gratis'}
                >
                  Lomba Tidak Berbayar<span className="cnt">03</span>
                </button>
              </div>
            </div>

            {/* BERBAYAR Panel */}
            <div
              className={`flow-panel${activeFlow === 'berbayar' ? ' active' : ''}`}
              role="tabpanel"
            >
              <div className="flow-steps">
                <div className="flow-step">
                  <div className="flow-dot">1</div>
                  <div className="flow-content">
                    <div className="flow-title">Membaca syarat dan ketentuan</div>
                  </div>
                </div>
                <div className="flow-step">
                  <div className="flow-dot">2</div>
                  <div className="flow-content">
                    <div className="flow-title">Mengunduh template Pakta Integritas kategori berbayar</div>
                    <a
                      className="flow-link"
                      href="https://docs.google.com/document/d/10wMGx-vd7AxC_5esO0XshWET2pjqe8Wx/edit"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Buka Template Pakta Integritas
                      <ArrowUpRight size={13} />
                    </a>
                  </div>
                </div>
                <div className="flow-step">
                  <div className="flow-dot">3</div>
                  <div className="flow-content">
                    <div className="flow-title">Mengunduh template proposal pengajuan</div>
                    <a
                      className="flow-link"
                      href="https://docs.google.com/document/d/1eww9J7NlwP_jDJ5rt8Us5rLXvPFVetIO/edit"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Buka Template Proposal
                      <ArrowUpRight size={13} />
                    </a>
                  </div>
                </div>
                <div className="flow-step">
                  <div className="flow-dot">4</div>
                  <div className="flow-content">
                    <div className="flow-title">Menyusun proposal dan melengkapi Pakta Integritas</div>
                  </div>
                </div>
                <div className="flow-step">
                  <div className="flow-dot">5</div>
                  <div className="flow-content">
                    <div className="flow-title">Mengirim proposal dan Pakta Integritas kepada CP yang tertera pada proposal</div>
                  </div>
                </div>
                <div className="flow-step">
                  <div className="flow-dot">6</div>
                  <div className="flow-content">
                    <div className="flow-title">Melakukan revisi apabila terdapat masukan dari PJ lomba</div>
                  </div>
                </div>
              </div>
            </div>

            {/* TIDAK BERBAYAR Panel */}
            <div
              className={`flow-panel${activeFlow === 'gratis' ? ' active' : ''}`}
              role="tabpanel"
            >
              <div className="flow-steps">
                <div className="flow-step">
                  <div className="flow-dot">1</div>
                  <div className="flow-content">
                    <div className="flow-title">Membaca syarat dan ketentuan</div>
                  </div>
                </div>
                <div className="flow-step">
                  <div className="flow-dot">2</div>
                  <div className="flow-content">
                    <div className="flow-title">Mengunduh template Pakta Integritas kategori tidak berbayar</div>
                    <a
                      className="flow-link"
                      href="https://docs.google.com/document/d/1zPtnpGNhIFodnuU5Q8unc4zTwRIBcoyK/edit"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Buka Template Pakta Integritas
                      <ArrowUpRight size={13} />
                    </a>
                  </div>
                </div>
                <div className="flow-step">
                  <div className="flow-dot">3</div>
                  <div className="flow-content">
                    <div className="flow-title">Mengisi dan melengkapi Pakta Integritas sesuai ketentuan yang berlaku</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="delegasi-card"
            style={{
              background: 'var(--cream-soft)',
              border: '2px solid var(--line)',
              borderRadius: '16px',
              padding: '36px 32px',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'var(--red)',
                  color: 'var(--cream)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Award size={24} />
              </div>
              <div>
                <h1 style={{ fontFamily: 'Anton', fontSize: '28px', color: 'var(--navy)', letterSpacing: '.3px' }}>
                  Pengajuan Delegasi Lomba
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                  Pendataan &amp; Dukungan Prestasi Mahasiswa FT Unsoed
                </p>
              </div>
            </div>

            <hr style={{ border: 'none', height: '1px', background: 'var(--line)', margin: '20px 0 24px' }} />

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 10px' }}>
                <CheckCircle2 size={64} color="#059669" style={{ margin: '0 auto 16px' }} />
                <h2 style={{ fontFamily: 'Anton', fontSize: '26px', color: 'var(--navy)', marginBottom: '10px' }}>
                  Pendaftaran Delegasi Berhasil!
                </h2>
                <p style={{ fontSize: '15px', color: 'var(--ink-soft)', lineHeight: '1.7', maxWidth: '480px', margin: '0 auto 28px' }}>
                  Berkas Anda telah berhasil dicatat ke sistem database pengurus. Silakan konfirmasikan melalui WhatsApp.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-pill primary">
                    <Send size={15} />
                    <span>Konfirmasi via WhatsApp</span>
                  </a>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-pill secondary"
                  >
                    Daftar Delegasi Lain
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Nama Ketua Tim / Perwakilan *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="Nama lengkap"
                      value={formData.nama_ketua}
                      onChange={(e) => setFormData({ ...formData, nama_ketua: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">NIM Ketua *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="H1..."
                      value={formData.nim}
                      onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jurusan *</label>
                    <select
                      className="form-select"
                      value={formData.jurusan}
                      onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                    >
                      <option value="Teknik Elektro">Teknik Elektro</option>
                      <option value="Teknik Sipil">Teknik Sipil</option>
                      <option value="Teknik Geologi">Teknik Geologi</option>
                      <option value="Teknik Informatika">Informatika</option>
                      <option value="Teknik Industri">Teknik Industri</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nomor WhatsApp Aktif *</label>
                    <input
                      type="tel"
                      required
                      className="form-input"
                      placeholder="08xxxxxxxxxx"
                      value={formData.no_wa}
                      onChange={(e) => setFormData({ ...formData, no_wa: e.target.value })}
                    />
                  </div>

                  <div className="form-group full">
                    <label className="form-label">Nama Lomba / Kompetisi *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="Contoh: Kompetisi Paduan Suara Mahasiswa Nasional 2026"
                      value={formData.nama_lomba}
                      onChange={(e) => setFormData({ ...formData, nama_lomba: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Institusi Penyelenggara</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: Universitas Gadjah Mada"
                      value={formData.penyelenggara}
                      onChange={(e) => setFormData({ ...formData, penyelenggara: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Kategori Lomba *</label>
                    <select
                      className="form-select"
                      value={formData.kategori}
                      onChange={(e) => setFormData({ ...formData, kategori: e.target.value as any })}
                    >
                      <option value="berbayar">Berbayar</option>
                      <option value="tidak_berbayar">Gratis / Non-Berbayar</option>
                    </select>
                  </div>

                  <div className="form-group full">
                    <label className="form-label">
                      Tautan Google Drive (Berkas Proposal &amp; Pakta Integritas) *
                    </label>
                    <input
                      type="url"
                      required
                      className="form-input"
                      placeholder="https://drive.google.com/drive/folders/..."
                      value={formData.link_berkas}
                      onChange={(e) => setFormData({ ...formData, link_berkas: e.target.value })}
                    />
                    <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                      * Pastikan folder Google Drive dapat diakses ("Anyone with the link can view").
                    </span>
                  </div>
                </div>

                {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                    onSuccess={setTurnstileToken}
                    onExpire={() => setTurnstileToken('')}
                    onError={() => setTurnstileToken('')}
                    options={{ theme: 'light' }}
                  />
                )}

                <div className="form-actions">
                  <button type="submit" className="btn-pill primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                    {loading ? <Loader2 size={16} className="spin" /> : <Send size={15} />}
                    <span>{loading ? 'Menyimpan Pendaftaran...' : 'Kirim Berkas Pengajuan'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
