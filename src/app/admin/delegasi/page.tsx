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
} from 'lucide-react';

export default function AdminDelegasiPage() {
  const [delegations, setDelegations] = useState<DelegasiItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
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

  const handleDelete = async (id: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data delegasi "${nama}"?`)) {
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

        <button className="btn-pill primary" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          <span>Input Delegasi Manual</span>
        </button>
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
                    <a
                      href={item.link_berkas}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563EB', fontWeight: 600, fontSize: '12.5px' }}
                    >
                      <span>Lihat Berkas</span>
                      <ExternalLink size={13} />
                    </a>
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
                        onClick={() => handleDelete(item.id, item.nama_ketua)}
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
    </div>
  );
}
