'use client';

import { useState, useEffect } from 'react';
import {
  fetchPengurus,
  savePengurusItem,
  deletePengurusItem,
} from '@/lib/supabaseClient';
import { PengurusItem } from '@/lib/initialData';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
} from 'lucide-react';

export default function AdminPengurusPage() {
  const [pengurus, setPengurus] = useState<PengurusItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PengurusItem | null>(null);

  const [form, setForm] = useState({
    nama: '',
    role: 'Staff',
    kategori: 'staff' as 'lead' | 'staff' | 'internship',
    foto_url: '',
    initials: '',
    urutan: 1,
  });

  const loadData = async () => {
    const data = await fetchPengurus();
    setPengurus(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAdd = () => {
    setEditingItem(null);
    setForm({
      nama: '',
      role: 'Staff',
      kategori: 'staff',
      foto_url: '',
      initials: '',
      urutan: pengurus.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEdit = (item: PengurusItem) => {
    setEditingItem(item);
    setForm({
      nama: item.nama,
      role: item.role,
      kategori: item.kategori,
      foto_url: item.foto_url || '',
      initials: item.initials,
      urutan: item.urutan,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, nama: string) => {
    if (confirm(`Hapus anggota "${nama}" dari daftar pengurus?`)) {
      const deleted = await deletePengurusItem(id);
      if (!deleted) {
        alert('Anggota pengurus gagal dihapus.');
        return;
      }
      loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const initials =
      form.initials ||
      form.nama
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const payload: PengurusItem = {
      id: editingItem ? editingItem.id : 'p-' + Date.now(),
      nama: form.nama,
      role: form.role,
      kategori: form.kategori,
      foto_url: form.foto_url || undefined,
      initials,
      urutan: form.urutan,
    };

    const saved = await savePengurusItem(payload);
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
          <h1 className="admin-title">Pengurus &amp; Staf Mikat</h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '4px' }}>
            Kelola struktur pengurus, foto profil, dan jabatan Kementerian Minat dan Bakat.
          </p>
        </div>

        <button className="btn-pill primary" onClick={openAdd}>
          <Plus size={16} />
          <span>Tambah Anggota Pengurus</span>
        </button>
      </div>

      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Foto Profil</th>
                <th>Nama Lengkap</th>
                <th>Jabatan / Role</th>
                <th>Kategori Divisi</th>
                <th>Urutan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pengurus.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div
                      style={{
                        width: '42px',
                        height: '50px',
                        borderRadius: '8px',
                        background: 'var(--navy)',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--gold)',
                        fontWeight: 700,
                        fontSize: '14px',
                      }}
                    >
                      {item.foto_url ? (
                        <img
                          src={item.foto_url}
                          alt={item.nama}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        item.initials
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '14.5px' }}>{item.nama}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--red)' }}>{item.role}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background:
                          item.kategori === 'lead'
                            ? '#FEF3C7'
                            : item.kategori === 'staff'
                            ? '#DBEAFE'
                            : '#E0E7FF',
                        color:
                          item.kategori === 'lead'
                            ? '#92400E'
                            : item.kategori === 'staff'
                            ? '#1E40AF'
                            : '#3730A3',
                      }}
                    >
                      {item.kategori}
                    </span>
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
                <h3 className="modal-title">{editingItem ? 'Edit Anggota' : 'Tambah Anggota'}</h3>
                <p className="modal-sub">Data profil pengurus Minat &amp; Bakat</p>
              </div>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full">
                  <label className="form-label">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Contoh: Zahran Febrian Nugraha"
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Jabatan (Role) *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Menteri / Staff / Internship"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Kategori *</label>
                  <select
                    className="form-select"
                    value={form.kategori}
                    onChange={(e) => setForm({ ...form, kategori: e.target.value as any })}
                  >
                    <option value="lead">Pimpinan (Menteri/Wamen)</option>
                    <option value="staff">Staff Kementerian</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Inisial Avatar (Opsional)</label>
                  <input
                    type="text"
                    maxLength={3}
                    className="form-input"
                    placeholder="ZF"
                    value={form.initials}
                    onChange={(e) => setForm({ ...form, initials: e.target.value.toUpperCase() })}
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
                <div className="form-group full">
                  <label className="form-label">Path Foto (/assets/...) atau URL</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="/assets/foto.jpg atau https://..."
                    value={form.foto_url}
                    onChange={(e) => setForm({ ...form, foto_url: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-pill secondary" onClick={() => setIsModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-pill primary">
                  {editingItem ? 'Simpan Data' : 'Tambah Anggota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
