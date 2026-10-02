'use client';

import { useState, useEffect } from 'react';
import {
  fetchDelegasi,
  addDelegasi,
  updateDelegasiStatus,
  deleteDelegasi,
} from '@/lib/supabaseClient';
import { DelegasiItem } from '@/lib/initialData';
import {
  Award,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  ExternalLink,
  Search,
  X,
  Download,
  Eye,
} from 'lucide-react';

export default function AdminDelegasiPage() {
  const [delegations, setDelegations] = useState<DelegasiItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDel, setNewDel] = useState({
    nama_ketua: '',
    nim: '',
    jurusan: 'Teknik Informatika',
    nama_lomba: '',
    penyelenggara: '',
    kategori: 'berbayar' as 'berbayar' | 'tidak_berbayar',
    link_berkas: '',
    no_wa: '',
  });

  const loadData = async () => {
    const data = await fetchDelegasi();
    setDelegations(data);
  };

  const generateReport = () => {
    const headers = ['Nama Ketua', 'NIM', 'Jurusan', 'Nama Lomba', 'Penyelenggara', 'Kategori', 'Status', 'Nomor WA', 'Tanggal'];
    const csvContent = delegations.map(d => 
      [
        `"${d.nama_ketua}"`, `"${d.nim}"`, `"${d.jurusan}"`, `"${d.nama_lomba}"`, 
        `"${d.penyelenggara || ''}"`, `"${d.kategori}"`, `"${d.status}"`, 
        `"${d.no_wa}"`, `"${d.created_at}"`
      ].join(',')
    );
    const csvStr = [headers.join(','), ...csvContent].join('\n');
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Delegasi_Mikat_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openPreview = (url: string) => {
    let embedUrl = url;
    if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/d\/(.*?)\//);
      if (match && match[1]) {
        embedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    setPreviewDocUrl(embedUrl);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: string, status: DelegasiItem['status']) => {
    const updated = await updateDelegasiStatus(id, status);
    if (!updated) {
      alert('Status delegasi gagal diperbarui.');
      return;
    }
    loadData();
  };

  const handleDelete = async (id: string, nama: string, link_berkas: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data delegasi "${nama}"?`)) {
      // 1. Coba hapus file di Google Drive
      if (link_berkas && link_berkas.includes('drive.google.com')) {
        const match = link_berkas.match(/\/d\/(.*?)\//);
        const fileId = match ? match[1] : null;
        if (fileId) {
          const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
          if (scriptUrl) {
            try {
              await fetch(scriptUrl, {
                method: 'POST',
                body: JSON.stringify({ action: 'delete', fileId })
              });
            } catch (err) {
              console.error("Gagal menghapus file dari Drive", err);
            }
          }
        }
      }

      // 2. Hapus data dari Supabase
      const deleted = await deleteDelegasi(id);
      if (!deleted) {
        alert('Data delegasi gagal dihapus.');
        return;
      }
      loadData();
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addDelegasi(newDel);
    if (!result.success) {
      alert(result.error || 'Data delegasi gagal disimpan.');
      return;
    }

    setIsAddModalOpen(false);
    setNewDel({
      nama_ketua: '',
      nim: '',
      jurusan: 'Teknik Informatika',
      nama_lomba: '',
      penyelenggara: '',
      kategori: 'berbayar',
      link_berkas: '',
      no_wa: '',
    });
    loadData();
  };

  const filtered = delegations.filter((item) => {
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchSearch =
      item.nama_ketua.toLowerCase().includes(search.toLowerCase()) ||
      item.nim.toLowerCase().includes(search.toLowerCase()) ||
      item.nama_lomba.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="admin-title">Manajemen Delegasi Lomba</h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '4px' }}>
            Verifikasi kelayakan berkas, pakta integritas, dan penerbitan rekomendasi delegasi.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-pill outline" onClick={generateReport} style={{ borderColor: '#CBD5E1', color: 'var(--navy)' }}>
            <Download size={16} />
            <span style={{ fontSize: '13px' }}>Generate Laporan</span>
          </button>
          <button className="btn-pill primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} />
            <span style={{ fontSize: '13px' }}>Input Manual</span>
          </button>
        </div>
      </div>

      <div className="admin-card">
        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['all', 'menunggu_review', 'diverifikasi', 'ditolak'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  border: '1px solid #CBD5E1',
                  background: filterStatus === st ? 'var(--navy)' : '#fff',
                  color: filterStatus === st ? '#fff' : '#475569',
                  cursor: 'pointer',
                }}
              >
                {st === 'all' ? 'Semua' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', minWidth: '240px' }}>
            <input
              type="text"
              placeholder="Cari ketua, NIM, atau lomba..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '32px', fontSize: '13px' }}
            />
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ketua Delegasi</th>
                <th>Nama Kompetisi &amp; Instansi</th>
                <th>Kategori</th>
                <th>Berkas Google Drive</th>
                <th>WhatsApp</th>
                <th>Status</th>
                <th>Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{item.nama_ketua}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{item.nim} · {item.jurusan}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.nama_lomba}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{item.penyelenggara || '-'}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '11.5px', textTransform: 'uppercase', fontWeight: 700, color: item.kategori === 'berbayar' ? 'var(--red)' : 'var(--navy)' }}>
                      {item.kategori}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => openPreview(item.link_berkas)}
                        className="btn-sm"
                        style={{ background: '#F1F5F9', color: '#334155', border: '1px solid #E2E8F0' }}
                        title="Preview Berkas"
                      >
                        <Eye size={13} />
                        <span>Preview</span>
                      </button>
                      <a
                        href={item.link_berkas}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-sm"
                        style={{ background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' }}
                        title="Buka Tab Baru"
                      >
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  </td>
                  <td>
                    <a
                      href={`https://wa.me/${item.no_wa.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#059669', fontWeight: 600, fontSize: '12.5px' }}
                    >
                      {item.no_wa}
                    </a>
                  </td>
                  <td>
                    <span className={`badge-status ${item.status}`}>{item.status.replace('_', ' ')}</span>
                  </td>
                  <td>
                    <div className="action-btns">
                      {item.status !== 'diverifikasi' && (
                        <button
                          className="btn-sm approve"
                          onClick={() => handleStatusChange(item.id, 'diverifikasi')}
                          title="Verifikasi Pengajuan"
                        >
                          <CheckCircle size={13} />
                          <span>Verifikasi</span>
                        </button>
                      )}
                      {item.status !== 'ditolak' && (
                        <button
                          className="btn-sm reject"
                          onClick={() => handleStatusChange(item.id, 'ditolak')}
                          title="Tolak Pengajuan"
                        >
                          <XCircle size={13} />
                          <span>Tolak</span>
                        </button>
                      )}
                      <button
                        className="btn-sm danger"
                        onClick={() => handleDelete(item.id, item.nama_ketua, item.link_berkas)}
                        title="Hapus"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    Tidak ada data delegasi lomba yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL INPUT MANUAL */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Pendaftaran Delegasi Baru</h3>
                <p className="modal-sub">Input delegasi manual oleh pengurus</p>
              </div>
              <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nama Ketua Tim *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={newDel.nama_ketua}
                    onChange={(e) => setNewDel({ ...newDel, nama_ketua: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">NIM Ketua *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={newDel.nim}
                    onChange={(e) => setNewDel({ ...newDel, nim: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Jurusan *</label>
                  <select
                    className="form-select"
                    value={newDel.jurusan}
                    onChange={(e) => setNewDel({ ...newDel, jurusan: e.target.value })}
                  >
                    <option value="Teknik Informatika">Teknik Informatika</option>
                    <option value="Teknik Elektro">Teknik Elektro</option>
                    <option value="Teknik Sipil">Teknik Sipil</option>
                    <option value="Teknik Geologi">Teknik Geologi</option>
                    <option value="Teknik Industri">Teknik Industri</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Nomor WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    value={newDel.no_wa}
                    onChange={(e) => setNewDel({ ...newDel, no_wa: e.target.value })}
                  />
                </div>
                <div className="form-group full">
                  <label className="form-label">Nama Lomba / Kompetisi *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={newDel.nama_lomba}
                    onChange={(e) => setNewDel({ ...newDel, nama_lomba: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Institusi Penyelenggara</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newDel.penyelenggara}
                    onChange={(e) => setNewDel({ ...newDel, penyelenggara: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Kategori *</label>
                  <select
                    className="form-select"
                    value={newDel.kategori}
                    onChange={(e) => setNewDel({ ...newDel, kategori: e.target.value as any })}
                  >
                    <option value="berbayar">Berbayar</option>
                    <option value="tidak_berbayar">Gratis</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label className="form-label">Link Berkas (Google Drive) *</label>
                  <input
                    type="url"
                    required
                    className="form-input"
                    placeholder="https://drive.google.com/..."
                    value={newDel.link_berkas}
                    onChange={(e) => setNewDel({ ...newDel, link_berkas: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-pill secondary" onClick={() => setIsAddModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-pill primary">
                  Simpan Delegasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDocUrl && (
        <div className="modal-overlay" onClick={() => setPreviewDocUrl(null)} style={{ zIndex: 9999 }}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()} style={{ width: '90%', maxWidth: '900px', height: '85vh', padding: '0', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header" style={{ padding: '16px 24px', borderBottom: '1px solid #E2E8F0' }}>
              <h3 className="modal-title" style={{ fontSize: '18px' }}>Preview Berkas</h3>
              <button className="modal-close" onClick={() => setPreviewDocUrl(null)}>
                <X size={20} />
              </button>
            </div>
            <div style={{ flex: 1, width: '100%', background: '#F8FAFC' }}>
              <iframe
                src={previewDocUrl}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="autoplay"
                title="Document Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
