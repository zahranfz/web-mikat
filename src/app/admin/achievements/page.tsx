'use client';

import { useState, useEffect } from 'react';
import {
  fetchAchievements,
  addAchievement,
  updateAchievement,
  deleteAchievement,
} from '@/lib/supabaseClient';
import { AchievementItem } from '@/lib/initialData';
import { Trophy, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

export default function AdminAchievementsPage() {
  const [items, setItems] = useState<AchievementItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AchievementItem | null>(null);

  const [form, setForm] = useState({
    nama_mahasiswa: '',
    jurusan: '',
    nama_lomba: '',
    prestasi: '',
    tahun: new Date().getFullYear().toString(),
  });

  const loadData = async () => {
    const data = await fetchAchievements();
    setItems(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAdd = () => {
    setEditingItem(null);
    setForm({
      nama_mahasiswa: '',
      jurusan: '',
      nama_lomba: '',
      prestasi: '',
      tahun: new Date().getFullYear().toString(),
    });
    setIsModalOpen(true);
  };

  const openEdit = (item: AchievementItem) => {
    setEditingItem(item);
    setForm({
      nama_mahasiswa: item.nama_mahasiswa,
      jurusan: item.jurusan,
      nama_lomba: item.nama_lomba,
      prestasi: item.prestasi,
      tahun: item.tahun,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, nama: string) => {
    if (confirm(`Hapus prestasi "${nama}"?`)) {
      const { error } = await deleteAchievement(id);
      if (error) {
        alert('Gagal dihapus: ' + error);
        return;
      }
      loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItem) {
      const { error } = await updateAchievement(editingItem.id, form);
      if (error) alert('Gagal memperbarui: ' + error);
    } else {
      const { error } = await addAchievement({
        nama_mahasiswa: form.nama_mahasiswa,
        jurusan: form.jurusan,
        nama_lomba: form.nama_lomba,
        prestasi: form.prestasi,
        tahun: form.tahun,
      });
      if (error) alert('Gagal menambah: ' + error);
    }

    setIsModalOpen(false);
    loadData();
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Prestasi Mahasiswa</h1>
          <p className="admin-desc">Kelola data Hall of Fame prestasi KBMFT.</p>
        </div>
        <button className="btn-pill primary" onClick={openAdd}>
          <Plus size={16} />
          <span>Tambah Prestasi</span>
        </button>
      </div>

      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tahun</th>
                <th>Nama Mahasiswa</th>
                <th>Jurusan</th>
                <th>Lomba</th>
                <th>Prestasi</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--ink-soft)' }}>
                    Belum ada data prestasi.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td><span style={{ fontWeight: 700, color: 'var(--navy)' }}>{item.tahun}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{item.nama_mahasiswa}</td>
                    <td>{item.jurusan}</td>
                    <td>{item.nama_lomba}</td>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: '#FEF3C7', color: '#92400E', borderRadius: '4px', fontSize: '12px', fontWeight: 600 }}>
                        <Trophy size={12} />
                        {item.prestasi}
                      </div>
                    </td>
                    <td>
                      <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn-sm edit" onClick={() => openEdit(item)} title="Edit">
                          <Pencil size={13} />
                        </button>
                        <button className="btn-sm danger" onClick={() => handleDelete(item.id, item.nama_mahasiswa)} title="Hapus">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingItem ? 'Edit Prestasi' : 'Tambah Prestasi'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Mahasiswa / Tim</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={form.nama_mahasiswa}
                  onChange={(e) => setForm({ ...form, nama_mahasiswa: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Jurusan</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Contoh: Teknik Elektro"
                    value={form.jurusan}
                    onChange={(e) => setForm({ ...form, jurusan: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tahun</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={form.tahun}
                    onChange={(e) => setForm({ ...form, tahun: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nama Lomba</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={form.nama_lomba}
                  onChange={(e) => setForm({ ...form, nama_lomba: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prestasi / Juara</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Contoh: Juara 1 Nasional"
                  value={form.prestasi}
                  onChange={(e) => setForm({ ...form, prestasi: e.target.value })}
                />
              </div>

              <div className="form-actions" style={{ marginTop: '24px' }}>
                <button type="button" className="btn-pill secondary" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-pill primary">
                  <Check size={16} />
                  <span>{editingItem ? 'Simpan Perubahan' : 'Tambah'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
