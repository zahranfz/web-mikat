'use client';

import { useState } from 'react';
import { X, CheckCircle2, Send, Loader2, Link2, UploadCloud } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { addDelegasi, uploadAsset } from '@/lib/supabaseClient';

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
    jurusan: 'Informatika',
    nama_lomba: '',
    penyelenggara: '',
    kategori: 'berbayar' as 'berbayar' | 'tidak_berbayar',
    link_berkas: '',
    no_wa: '',
  });
  const [file, setFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Harap unggah berkas (Proposal / Pakta Integritas) terlebih dahulu.');
      return;
    }
    
    setLoading(true);

    try {
      // ====== BERALIH KE GOOGLE DRIVE UPLOAD VIA GOOGLE APPS SCRIPT ======
      const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
      
      if (!scriptUrl) {
        alert('NEXT_PUBLIC_GOOGLE_SCRIPT_URL belum di-setting di .env.local!');
        setLoading(false);
        return;
      }

      // 1. Convert file ke Base64
      const getBase64 = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]); // Ambil base64-nya saja
        reader.onerror = error => reject(error);
      });

      const base64Data = await getBase64(file);

      // 2. Kirim ke Google Apps Script
      const driveUploadRes = await fetch(scriptUrl, {
        method: 'POST',
        // JANGAN pakai headers 'Content-Type': 'application/json' karena kadang kena block CORS dari GAS, 
        // fetch dengan text/plain body akan di-parse otomatis oleh GAS.
        body: JSON.stringify({
          filename: file.name,
          mimeType: file.type,
          base64: base64Data
        })
      });

      const responseData = await driveUploadRes.json();
      
      if (responseData.status !== 'success') {
        alert('Gagal mengunggah ke Google Drive: ' + responseData.message);
        setLoading(false);
        return;
      }

      // 3. Masukkan link Google Drive ke formData
      const finalFormData = { ...formData, link_berkas: responseData.url };
      
      const res = await addDelegasi(finalFormData, turnstileToken);
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
      jurusan: 'Informatika',
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
                  placeholder="Masukkan nama anda"
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
                  placeholder="Masukkan NIM anda"
                  value={formData.nim}
                  onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Program Studi *</label>
                <select
                  className="form-select"
                  value={formData.jurusan}
                  onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                >
                  <option value="Teknik Elektro">Teknik Elektro</option>
                  <option value="Teknik Sipil">Teknik Sipil</option>
                  <option value="Teknik Geologi">Teknik Geologi</option>
                  <option value="Informatika">Informatika</option>
                  <option value="Teknik Industri">Teknik Industri</option>
                  <option value="Teknik Mesin">Teknik Mesin</option>
                  <option value="Teknik Komputer">Teknik Komputer</option>
                  <option value="Arsitektur">Arsitektur</option>
                  <option value="Teknik Pertambangan">Teknik Pertambangan</option>
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
                  Unggah Berkas (Proposal / Pakta Integritas) *
                </label>
                <div 
                  style={{ 
                    position: 'relative', 
                    border: '1.5px dashed var(--line)', 
                    padding: '16px', 
                    borderRadius: '8px', 
                    textAlign: 'center',
                    background: 'var(--cream-soft)',
                    cursor: 'pointer'
                  }}
                  onClick={() => document.getElementById('berkas-upload')?.click()}
                >
                  <input
                    id="berkas-upload"
                    type="file"
                    required
                    style={{ display: 'none' }}
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    accept=".pdf,.doc,.docx,.zip,.rar"
                  />
                  <UploadCloud size={24} color="var(--navy)" style={{ marginBottom: '8px' }} />
                  {file ? (
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy)' }}>
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy)', marginBottom: '4px' }}>
                        Pilih file atau tarik ke sini
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>
                        Mendukung .PDF, .DOC, .DOCX, .ZIP maksimal 10MB.
                      </div>
                    </>
                  )}
                </div>
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
