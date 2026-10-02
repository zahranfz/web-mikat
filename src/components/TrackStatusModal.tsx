'use client';

import { useState } from 'react';
import { X, Search, Loader2, Package, Trophy } from 'lucide-react';
import { fetchPeminjaman, fetchDelegasi } from '@/lib/supabaseClient';

interface TrackStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TrackStatusModal({ isOpen, onClose }: TrackStatusModalProps) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'peminjaman' | 'delegasi'>('peminjaman');
  const [identifier, setIdentifier] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      if (type === 'peminjaman') {
        const data = await fetchPeminjaman();
        const found = data.find((d) => d.nim.toLowerCase() === identifier.toLowerCase());
        if (found) setResult(found);
        else setError('Data peminjaman tidak ditemukan untuk NIM tersebut.');
      } else {
        const data = await fetchDelegasi();
        const found = data.find((d) => d.nim.toLowerCase() === identifier.toLowerCase());
        if (found) setResult(found);
        else setError('Data delegasi tidak ditemukan untuk NIM tersebut.');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mencari data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Lacak Pengajuan</h3>
            <p className="modal-sub">Cek status peminjaman alat atau delegasi lomba Anda.</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Tutup pelacakan">
            <X size={20} />
          </button>
        </div>

        <div className="flow-tabs" role="tablist" style={{ marginBottom: '20px', width: '100%' }}>
          <button
            className={`flow-tab-btn ${type === 'peminjaman' ? 'active' : ''}`}
            onClick={() => { setType('peminjaman'); setResult(null); setError(''); }}
            style={{ flex: 1, textAlign: 'center' }}
          >
            Peminjaman
          </button>
          <button
            className={`flow-tab-btn ${type === 'delegasi' ? 'active' : ''}`}
            onClick={() => { setType('delegasi'); setResult(null); setError(''); }}
            style={{ flex: 1, textAlign: 'center' }}
          >
            Delegasi Lomba
          </button>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Masukkan NIM (contoh: H1B022019)"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-pill primary" disabled={loading || !identifier}>
            {loading ? <Loader2 size={16} className="spin" /> : <Search size={16} />}
            <span>Cari</span>
          </button>
        </form>

        {error && (
          <div style={{ padding: '12px', background: '#FEE2E2', color: '#991B1B', borderRadius: '8px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ border: '1.5px solid var(--line)', borderRadius: '12px', padding: '20px', background: 'var(--cream)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--navy)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-soft)' }}>
                {type === 'peminjaman' ? <Package size={20} /> : <Trophy size={20} />}
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>
                  {new Date(result.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                </div>
                <div style={{ fontWeight: 700, color: 'var(--navy)' }}>
                  {type === 'peminjaman' ? result.nama_alat : result.nama_lomba}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>Nama Lengkap</div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{type === 'peminjaman' ? result.nama_peminjam : result.nama_ketua}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--ink-soft)' }}>Jurusan</div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{result.jurusan}</div>
              </div>
            </div>

            <div style={{ paddingTop: '16px', borderTop: '1px dashed var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)' }}>Status Saat Ini:</span>
              <span style={{ 
                padding: '6px 14px', 
                borderRadius: '20px', 
                fontSize: '12px', 
                fontWeight: 700,
                background: result.status === 'disetujui' || result.status === 'diverifikasi' || result.status === 'selesai' ? '#D1FAE5' : result.status.includes('tolak') ? '#FEE2E2' : '#FEF3C7',
                color: result.status === 'disetujui' || result.status === 'diverifikasi' || result.status === 'selesai' ? '#065F46' : result.status.includes('tolak') ? '#991B1B' : '#92400E',
                textTransform: 'capitalize'
              }}>
                {result.status.replace('_', ' ')}
              </span>
            </div>
            
            {result.catatan_admin && (
              <div style={{ marginTop: '12px', padding: '12px', background: '#F1F5F9', borderRadius: '8px', fontSize: '12.5px', color: '#334155' }}>
                <strong>Catatan Admin:</strong> {result.catatan_admin}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
