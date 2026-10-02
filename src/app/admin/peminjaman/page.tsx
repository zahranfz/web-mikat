'use client';

import { useState, useEffect } from 'react';
import {
  fetchPeminjaman,
  addPeminjaman,
  updatePeminjamanStatus,
  deletePeminjaman,
} from '@/lib/supabaseClient';
import { PeminjamanItem } from '@/lib/initialData';
import {
  Package,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  CheckCheck,
  X,
  Download,
} from 'lucide-react';

export default function AdminPeminjamanPage() {
  const [loans, setLoans] = useState<PeminjamanItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLoan, setNewLoan] = useState({
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

  const loadData = async () => {
    const data = await fetchPeminjaman();
    setLoans(data);
  };

  const generateReport = () => {
    const headers = ['Nama Peminjam', 'NIM', 'Jurusan', 'Nama Alat', 'Jumlah', 'Keperluan', 'Status', 'Nomor WA', 'Tanggal Pinjam', 'Tanggal Kembali'];
    const csvContent = loans.map(d => 
      [
        `"${d.nama_peminjam}"`, `"${d.nim}"`, `"${d.jurusan}"`, `"${d.nama_alat}"`, 
        `"${d.jumlah}"`, `"${d.keperluan}"`, `"${d.status}"`, 
        `"${d.no_wa}"`, `"${d.tanggal_pinjam}"`, `"${d.tanggal_kembali}"`
      ].join(',')
    );
    const csvStr = [headers.join(','), ...csvContent].join('\n');
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Laporan_Peminjaman_Mikat_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: string, status: PeminjamanItem['status']) => {
    const updated = await updatePeminjamanStatus(id, status);
    if (!updated) {
      alert('Status peminjaman gagal diperbarui.');
      return;
    }
    loadData();
  };

  const handleDelete = async (id: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data peminjaman oleh "${nama}"?`)) {
      const deleted = await deletePeminjaman(id);
      if (!deleted) {
        alert('Data peminjaman gagal dihapus.');
        return;
      }
      loadData();
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await addPeminjaman(newLoan);
    if (!result.success) {
      alert(result.error || 'Data peminjaman gagal disimpan.');
      return;
    }

    setIsAddModalOpen(false);
    setNewLoan({
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
    loadData();
  };

  const filtered = loans.filter((item) => {
    const matchStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchSearch =
      item.nama_peminjam.toLowerCase().includes(search.toLowerCase()) ||
      item.nim.toLowerCase().includes(search.toLowerCase()) ||
      item.nama_alat.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="admin-title">Manajemen Peminjaman Inventaris</h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '4px' }}>
            Kelola persetujuan, pantau masa pinjam, dan arsipkan pengembalian alat.
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
        {/* Filters */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['all', 'pending', 'disetujui', 'selesai', 'ditolak'].map((st) => (
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
                {st === 'all' ? 'Semua' : st}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', minWidth: '240px' }}>
            <input
              type="text"
              placeholder="Cari nama, NIM, atau alat..."
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
                <th>Peminjam</th>
                <th>Alat &amp; Unit</th>
                <th>Tgl Pinjam - Kembali</th>
                <th>Keperluan</th>
                <th>WhatsApp</th>
                <th>Status</th>
                <th>Aksi Kelola</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{item.nama_peminjam}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{item.nim} · {item.jurusan}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.nama_alat}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>{item.jumlah} unit</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px' }}>{item.tanggal_pinjam}</div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--red)' }}>s/d {item.tanggal_kembali}</div>
                  </td>
                  <td style={{ maxWidth: '180px', fontSize: '12.5px' }}>{item.keperluan}</td>
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
                    <span className={`badge-status ${item.status}`}>{item.status}</span>
                  </td>
                  <td>
                    <div className="action-btns">
                      {item.status === 'pending' && (
                        <>
                          <button
                            className="btn-sm approve"
                            onClick={() => handleStatusChange(item.id, 'disetujui')}
                            title="Setujui"
                          >
                            <CheckCircle size={13} />
                            <span>Setujui</span>
                          </button>
                          <button
                            className="btn-sm reject"
                            onClick={() => handleStatusChange(item.id, 'ditolak')}
                            title="Tolak"
                          >
                            <XCircle size={13} />
                            <span>Tolak</span>
                          </button>
                        </>
                      )}
                      {item.status === 'disetujui' && (
                        <button
                          className="btn-sm complete"
                          onClick={() => handleStatusChange(item.id, 'selesai')}
                          title="Tandai Sudah Dikembalikan"
                        >
                          <CheckCheck size={13} />
                          <span>Selesai</span>
                        </button>
                      )}
                      <button
                        className="btn-sm danger"
                        onClick={() => handleDelete(item.id, item.nama_peminjam)}
                        title="Hapus Data"
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
                    Tidak ada data peminjaman yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH MANUAL */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Input Peminjaman Baru</h3>
                <p className="modal-sub">Pencatatan langsung oleh pengurus Mikat</p>
              </div>
              <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nama Peminjam *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={newLoan.nama_peminjam}
                    onChange={(e) => setNewLoan({ ...newLoan, nama_peminjam: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">NIM *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={newLoan.nim}
                    onChange={(e) => setNewLoan({ ...newLoan, nim: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Jurusan *</label>
                  <select
                    className="form-select"
                    value={newLoan.jurusan}
                    onChange={(e) => setNewLoan({ ...newLoan, jurusan: e.target.value })}
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
                    value={newLoan.no_wa}
                    onChange={(e) => setNewLoan({ ...newLoan, no_wa: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nama Alat *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={newLoan.nama_alat}
                    onChange={(e) => setNewLoan({ ...newLoan, nama_alat: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Jumlah *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="form-input"
                    value={newLoan.jumlah}
                    onChange={(e) => setNewLoan({ ...newLoan, jumlah: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tanggal Pinjam *</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={newLoan.tanggal_pinjam}
                    onChange={(e) => setNewLoan({ ...newLoan, tanggal_pinjam: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tanggal Kembali *</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={newLoan.tanggal_kembali}
                    onChange={(e) => setNewLoan({ ...newLoan, tanggal_kembali: e.target.value })}
                  />
                </div>
                <div className="form-group full">
                  <label className="form-label">Keperluan *</label>
                  <textarea
                    required
                    rows={2}
                    className="form-textarea"
                    value={newLoan.keperluan}
                    onChange={(e) => setNewLoan({ ...newLoan, keperluan: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-pill secondary" onClick={() => setIsAddModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-pill primary">
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
