'use client';

import { useState } from 'react';
import { X, CheckCircle2, Send, Loader2, Link2 } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { addDelegasi } from '@/lib/supabaseClient';

interface DelegationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DelegationFormModal({ isOpen, onClose, onSuccess }: DelegationFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [formData, setFormData] = useState({
    nama_ketua: '',
    nim: '',
    jurusan: 'Teknik Informatika',
    nama_lomba: '',
    penyelenggara: '',
    kategori: 'berbayar' as 'berbayar' | 'tidak_berbayar',
    link_berkas: '',
    no_wa: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await addDelegasi(formData, turnstileToken);
      if (res.success) {
        setSubmitted(true);
        if (onSuccess) onSuccess();
      } else {
        alert(res.error || 'Pengajuan delegasi gagal disimpan.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengirim berkas delegasi.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      nama_ketua: '',
      nim: '',
      jurusan: 'Teknik Informatika',
      nama_lomba: '',
      penyelenggara: '',
      kategori: 'berbayar',
      link_berkas: '',
      no_wa: '',
    });
    onClose();
  };

  const waLink = `https://wa.me/6282241183747?text=Halo%20Kak%20Callista%2C%20saya%20sudah%20mengajukan%20delegasi%20lomba%20atas%20nama%20${encodeURIComponent(formData.nama_ketua)}%20(${encodeURIComponent(formData.nim)})%20untuk%20lomba%20${encodeURIComponent(formData.nama_lomba)}.%20Berikut%20tautan%20berkasnya%3A%20${encodeURIComponent(formData.link_berkas)}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Formulir Pengajuan Delegasi Lomba</h3>
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
              Pengajuan Delegasi Berhasil!
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--ink-soft)', lineHeight: '1.6', maxWidth: '440px', margin: '0 auto 24px' }}>
              Data pendaftaran delegasi Anda telah tercatat di sistem. Silakan lakukan konfirmasi ke narahubung Kementerian Minat dan Bakat.
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
                Selesai &amp; Tutup
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Nama Ketua Delegasi *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Contoh: Rifki Pratama"
                  value={formData.nama_ketua}
                  onChange={(e) => setFormData({ ...formData, nama_ketua: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">NIM *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Contoh: H1B022019"
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
                  placeholder="0813xxxxxxxx"
                  value={formData.no_wa}
                  onChange={(e) => setFormData({ ...formData, no_wa: e.target.value })}
                />
              </div>

              <div className="form-group full">
                <label className="form-label">Nama Kegiatan Perlombaan *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Contoh: Kontes Robot Indonesia (KRI) 2026"
                  value={formData.nama_lomba}
                  onChange={(e) => setFormData({ ...formData, nama_lomba: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Institusi Penyelenggara</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: BPTI Kemendikbudristek"
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
                  <option value="berbayar">Berbayar (Dengan Uang Pendaftaran)</option>
                  <option value="tidak_berbayar">Tidak Berbayar (Gratis)</option>
                </select>
              </div>

              <div className="form-group full">
                <label className="form-label">
                  Link Google Drive Berkas (Proposal / Pakta Integritas) *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="url"
                    required
                    className="form-input"
                    placeholder="https://drive.google.com/..."
                    value={formData.link_berkas}
                    onChange={(e) => setFormData({ ...formData, link_berkas: e.target.value })}
                  />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>
                  * Pastikan hak akses link Google Drive telah disetel ke "Siapa saja yang memiliki link".
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
              <button type="button" className="btn-pill secondary" onClick={onClose} disabled={loading}>
                Batal
              </button>
              <button type="submit" className="btn-pill primary" disabled={loading}>
                {loading ? <Loader2 size={16} className="spin" /> : <Send size={15} />}
                <span>{loading ? 'Mengirim Berkas...' : 'Kirim Pengajuan'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
