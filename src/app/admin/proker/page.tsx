'use client';

import { useState, useEffect } from 'react';
import {
  fetchProker,
  saveProkerItem,
  deleteProkerItem,
} from '@/lib/supabaseClient';
import { ProkerItem } from '@/lib/initialData';
import {
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
} from 'lucide-react';

export default function AdminProkerPage() {
  const [prokers, setProkers] = useState<ProkerItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProkerItem | null>(null);

  const [form, setForm] = useState({
    code: '',
    nama: '',
    subtitle: '',
    kategori: 'proker' as 'proker' | 'agenda',
    deskripsi: '',
    chipsString: '',
    urutan: 1,
  });

  const loadData = async () => {
    const data = await fetchProker();
    setProkers(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAdd = () => {
    setEditingItem(null);
    setForm({
      code: `PROKER · ${(prokers.length + 1).toString().padStart(2, '0')}`,
      nama: '',
      subtitle: '',
      kategori: 'proker',
      deskripsi: '',
      chipsString: '',
      urutan: prokers.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEdit = (item: ProkerItem) => {
    setEditingItem(item);
    setForm({
      code: item.code,
      nama: item.nama,
      subtitle: item.subtitle || '',
      kategori: item.kategori,
      deskripsi: item.deskripsi,
      chipsString: item.chips.join(', '),
      urutan: item.urutan,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, nama: string) => {
    if (confirm(`Hapus "${nama}" dari daftar program/agenda kerja?`)) {
      const deleted = await deleteProkerItem(id);
      if (!deleted) {
        alert('Program/agenda gagal dihapus.');
        return;
      }
      loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const chips = form.chipsString
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const payload: ProkerItem = {
      id: editingItem ? editingItem.id : 'proker-' + Date.now(),
      code: form.code,
      nama: form.nama,
      subtitle: form.subtitle || undefined,
      kategori: form.kategori,
      deskripsi: form.deskripsi,
      chips,
      urutan: form.urutan,
    };

    const saved = await saveProkerItem(payload);
    if (!saved) {
      alert('Data gagal disimpan. Pastikan akun admin memiliki role admin di Supabase.');
      return;
    }

    setIsModalOpen(false);
    loadData();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="admin-title">Program Kerja &amp; Agenda Kerja</h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '4px' }}>
            Kelola data kegiatan yang ditampilkan di accordion halaman beranda.
          </p>
        </div>

        <button className="btn-pill primary" onClick={openAdd}>
          <Plus size={16} />
          <span>Tambah Program / Agenda</span>
        </button>
      </div>

      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Kode &amp; Kategori</th>
                <th>Nama Program</th>
                <th>Subtitle / Deskripsi Lengkap</th>
                <th>Kategori Tag (Chips)</th>
                <th>Urutan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {prokers.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--red)', fontSize: '12.5px' }}>{item.code}</div>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: item.kategori === 'proker' ? '#DBEAFE' : '#FEF3C7',
                        color: item.kategori === 'proker' ? '#1E40AF' : '#92400E',
                        marginTop: '4px',
                      }}
                    >
                      {item.kategori}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '15px' }}>{item.nama}</div>
                    {item.subtitle && <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#64748B' }}>{item.subtitle}</div>}
                  </td>
                  <td style={{ maxWidth: '300px', fontSize: '12.5px', color: '#334155' }}>
                    {item.deskripsi}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {item.chips.map((chip, idx) => (
                        <span key={idx} className="chip" style={{ fontSize: '10.5px', padding: '3px 8px' }}>
                          {chip}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{item.urutan}</td>
                  <td>
                    <div className="action-btns">
                      <button className="btn-sm edit" onClick={() => openEdit(item)} title="Edit">
                        <Pencil size={13} />
                        <span>Edit</span>
                      </button>
                      <button className="btn-sm danger" onClick={() => handleDelete(item.id, item.nama)} title="Hapus">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL FORM TAMBAH / EDIT */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{editingItem ? 'Edit Program / Agenda' : 'Tambah Program / Agenda'}</h3>
                <p className="modal-sub">Data langsung terupdate di halaman depan</p>
              </div>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Kode Singkat *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="PROKER · 01 atau AGENDA · 01"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Kategori *</label>
                  <select
                    className="form-select"
                    value={form.kategori}
                    onChange={(e) => setForm({ ...form, kategori: e.target.value as any })}
                  >
                    <option value="proker">Program Kerja (Proker)</option>
                    <option value="agenda">Agenda Kerja</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Nama Kegiatan *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Contoh: POST 4.0"
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Kepanjangan / Subtitle (Opsional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: Pekan Olahraga Seni Teknik"
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  />
                </div>
                <div className="form-group full">
                  <label className="form-label">Tag / Chips (Pisahkan dengan koma)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Olahraga, Seni, Antar Jurusan"
                    value={form.chipsString}
                    onChange={(e) => setForm({ ...form, chipsString: e.target.value })}
                  />
                </div>
                <div className="form-group full">
                  <label className="form-label">Deskripsi Lengkap *</label>
                  <textarea
                    required
                    rows={4}
                    className="form-textarea"
                    placeholder="Jelaskan tujuan dan mekanisme kegiatan..."
                    value={form.deskripsi}
                    onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Nomor Urutan Tampil</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={form.urutan}
                    onChange={(e) => setForm({ ...form, urutan: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-pill secondary" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-pill primary">
                  {editingItem ? 'Simpan Perubahan' : 'Tambahkan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
