'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft, CheckCircle2, Send, Loader2, PackageCheck } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { addPeminjaman } from '@/lib/supabaseClient';

export default function PeminjamanPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [formData, setFormData] = useState({
    nama_peminjam: '',
    nim: '',
    jurusan: 'Informatika',
    nama_alat: '',
    jumlah: 1,
    tanggal_pinjam: '',
    tanggal_kembali: '',
    keperluan: '',
    no_wa: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await addPeminjaman(formData, turnstileToken);
      if (res.success) {
        setSubmitted(true);
      } else {
        alert(res.error || 'Pengajuan peminjaman gagal disimpan.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat memproses data.');
    } finally {
      setLoading(false);
    }
  };

  const waLink = `https://wa.me/6282241183747?text=Halo%20Kak%20Callista%2C%20saya%20sudah%20mengisi%20formulir%20peminjaman%20alat%20atas%20nama%20${encodeURIComponent(formData.nama_peminjam)}%20(${encodeURIComponent(formData.nim)})%20untuk%20alat%20${encodeURIComponent(formData.nama_alat)}.%20Mohon%20konfirmasinya.`;

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

          <div
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
                  background: 'var(--navy)',
                  color: 'var(--gold-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PackageCheck size={24} />
              </div>
              <div>
                <h1 style={{ fontFamily: 'Anton', fontSize: '28px', color: 'var(--navy)', letterSpacing: '.3px' }}>
                  Peminjaman Inventaris Alat
                </h1>
                <p style={{ fontSize: '13px', color: 'var(--ink-soft)' }}>
                  Kementerian Minat dan Bakat BEM FT Unsoed
                </p>
              </div>
            </div>

            <hr style={{ border: 'none', height: '1px', background: 'var(--line)', margin: '20px 0 24px' }} />

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 10px' }}>
                <CheckCircle2 size={64} color="#059669" style={{ margin: '0 auto 16px' }} />
                <h2 style={{ fontFamily: 'Anton', fontSize: '26px', color: 'var(--navy)', marginBottom: '10px' }}>
                  Formulir Berhasil Terkirim!
                </h2>
                <p style={{ fontSize: '15px', color: 'var(--ink-soft)', lineHeight: '1.7', maxWidth: '480px', margin: '0 auto 28px' }}>
                  Data Anda telah masuk ke sistem database. Harap hubungi narahubung via WhatsApp untuk verifikasi pengambilan barang.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-pill primary">
                    <Send size={15} />
                    <span>Konfirmasi Sekarang ke WhatsApp</span>
                  </a>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-pill secondary"
                  >
                    Ajukan Lagi
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="Nama Anda"
                      value={formData.nama_peminjam}
                      onChange={(e) => setFormData({ ...formData, nama_peminjam: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">NIM Mahasiswa *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="H1D0..."
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
                      placeholder="0812xxxxxxxx"
                      value={formData.no_wa}
                      onChange={(e) => setFormData({ ...formData, no_wa: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nama Alat yang Dipinjam *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="Bola Futsal, Rompi, Sound Portable"
                      value={formData.nama_alat}
                      onChange={(e) => setFormData({ ...formData, nama_alat: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Jumlah Unit *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      className="form-input"
                      value={formData.jumlah}
                      onChange={(e) => setFormData({ ...formData, jumlah: parseInt(e.target.value) || 1 })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tanggal Mulai Pinjam *</label>
                    <input
                      type="date"
                      required
                      className="form-input"
                      value={formData.tanggal_pinjam}
                      onChange={(e) => setFormData({ ...formData, tanggal_pinjam: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tanggal Selesai / Pengembalian *</label>
                    <input
                      type="date"
                      required
                      className="form-input"
                      value={formData.tanggal_kembali}
                      onChange={(e) => setFormData({ ...formData, tanggal_kembali: e.target.value })}
                    />
                  </div>

                  <div className="form-group full">
                    <label className="form-label">Keperluan Penggunaan *</label>
                    <textarea
                      required
                      rows={3}
                      className="form-textarea"
                      placeholder="Jelaskan secara ringkas kegiatan yang diselenggarakan..."
                      value={formData.keperluan}
                      onChange={(e) => setFormData({ ...formData, keperluan: e.target.value })}
                    />
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
                    <span>{loading ? 'Menyimpan ke Database...' : 'Kirim Formulir Peminjaman'}</span>
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
