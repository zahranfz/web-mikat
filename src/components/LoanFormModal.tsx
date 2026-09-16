'use client';

import { useState } from 'react';
import { X, CheckCircle2, Send, Loader2 } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { addPeminjaman } from '@/lib/supabaseClient';

interface LoanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoanFormModal({ isOpen, onClose, onSuccess }: LoanFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [formData, setFormData] = useState({
    nama_peminjam: '',
    nim: '',
    jurusan: 'Teknik Informatika',
    nama_alat: '',
    jumlah: 1,
    tanggal_pinjam: '',
    tanggal_kembali: '',
    keperluan: '',
    no_wa: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await addPeminjaman(formData, turnstileToken);
      if (res.success) {
        setSubmitted(true);
        if (onSuccess) onSuccess();
      } else {
        alert(res.error || 'Pengajuan peminjaman gagal disimpan.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengirim pengajuan.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      nama_peminjam: '',
      nim: '',
      jurusan: 'Teknik Informatika',
      nama_alat: '',
      jumlah: 1,
      tanggal_pinjam: '',
      tanggal_kembali: '',
      keperluan: '',
      no_wa: '',
    });
    onClose();
  };

  const waLink = `https://wa.me/6282241183747?text=Halo%20Kak%20Callista%2C%20saya%20sudah%20mengisi%20formulir%20peminjaman%20alat%20atas%20nama%20${encodeURIComponent(formData.nama_peminjam)}%20(${encodeURIComponent(formData.nim)})%20untuk%20alat%20${encodeURIComponent(formData.nama_alat)}.%20Mohon%20konfirmasinya.`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Formulir Peminjaman Alat</h3>
            <p className="modal-sub">Kementerian Minat dan Bakat BEM FT Unsoed</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Tutup formulir">
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <CheckCircle2 size={56} color="#059669" style={{ margin: '0 auto 16px' }} />
            <h4 style={{ fontFamily: 'Anton', fontSize: '22px', color: 'var(--navy)', marginBottom: '8px' }}>
              Pengajuan Berhasil Disimpan!
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: '1.6', maxWidth: '440px', margin: '0 auto 24px' }}>
              Data peminjaman Anda telah masuk ke database Kementerian Mikat. Langkah selanjutnya, silakan konfirmasi ke narahubung melalui WhatsApp.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-pill primary"
              >
                <Send size={15} />
                <span>Konfirmasi via WhatsApp</span>
              </a>
              <button className="btn-pill secondary" onClick={handleReset}>
                Tutup Formulir
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Nama Lengkap Peminjam *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Contoh: Bagas Aditya"
                  value={formData.nama_peminjam}
                  onChange={(e) => setFormData({ ...formData, nama_peminjam: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">NIM *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Contoh: H1D022045"
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
                  <option value="Teknik Informatika">Teknik Informatika</option>
                  <option value="Teknik Elektro">Teknik Elektro</option>
                  <option value="Teknik Sipil">Teknik Sipil</option>
                  <option value="Teknik Geologi">Teknik Geologi</option>
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
                <label className="form-label">Nama Alat / Inventaris *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Contoh: Bola Futsal, Rompi, Mic"
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
                <label className="form-label">Tanggal Rencana Kembali *</label>
                <input
                  type="date"
                  required
                  className="form-input"
                  value={formData.tanggal_kembali}
                  onChange={(e) => setFormData({ ...formData, tanggal_kembali: e.target.value })}
                />
              </div>

              <div className="form-group full">
                <label className="form-label">Keperluan / Keterangan Kegiatan *</label>
                <textarea
                  required
                  className="form-textarea"
                  rows={3}
                  placeholder="Jelaskan secara singkat tujuan peminjaman alat..."
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
              <button type="button" className="btn-pill secondary" onClick={onClose} disabled={loading}>
                Batal
              </button>
              <button type="submit" className="btn-pill primary" disabled={loading}>
                {loading ? <Loader2 size={16} className="spin" /> : <Send size={15} />}
                <span>{loading ? 'Mengirim Data...' : 'Kirim Pengajuan'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
