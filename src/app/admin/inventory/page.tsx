'use client';

import { useState, useEffect } from 'react';
import {
  fetchInventory,
  addInventory,
  updateInventory,
  deleteInventory,
} from '@/lib/supabaseClient';
import { InventoryItem } from '@/lib/initialData';
import { Box, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [form, setForm] = useState({
    nama: '',
    total: 0,
    tersedia: 0,
    kategori: 'Olahraga',
  });

  const loadData = async () => {
    const data = await fetchInventory();
    setItems(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAdd = () => {
    setEditingItem(null);
    setForm({
      nama: '',
      total: 1,
      tersedia: 1,
      kategori: 'Olahraga',
    });
    setIsModalOpen(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setForm({
      nama: item.nama,
      total: item.total,
      tersedia: item.tersedia,
      kategori: item.kategori,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, nama: string) => {
    if (confirm(`Hapus "${nama}" dari katalog inventaris?`)) {
      const { error } = await deleteInventory(id);
      if (error) {
        alert('Gagal dihapus: ' + error);
        return;
      }
      loadData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.tersedia > form.total) {
      alert('Barang tersedia tidak boleh lebih dari total barang.');
      return;
    }

    if (editingItem) {
      const { error } = await updateInventory(editingItem.id, form);
      if (error) alert('Gagal memperbarui: ' + error);
    } else {
      const { error } = await addInventory({
        nama: form.nama,
        total: form.total,
        tersedia: form.tersedia,
        kategori: form.kategori,
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
          <h1 className="admin-title">Katalog Inventaris</h1>
          <p className="admin-desc">Kelola ketersediaan barang peminjaman.</p>
        </div>
        <button className="btn-pill primary" onClick={openAdd}>
          <Plus size={16} />
          <span>Tambah Barang</span>
        </button>
      </div>

      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nama Barang</th>
                <th>Kategori</th>
                <th>Total</th>
                <th>Tersedia</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--ink-soft)' }}>
                    Belum ada data inventaris.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Box size={16} color="var(--red)" />
                        {item.nama}
                      </div>
                    </td>
                    <td>{item.kategori}</td>
                    <td>{item.total}</td>
                    <td>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 700,
                          background: item.tersedia > 0 ? '#D1FAE5' : '#FEE2E2',
                          color: item.tersedia > 0 ? '#065F46' : '#991B1B',
                        }}
                      >
                        {item.tersedia}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn-sm edit" onClick={() => openEdit(item)} title="Edit">
                          <Pencil size={13} />
                        </button>
                        <button className="btn-sm danger" onClick={() => handleDelete(item.id, item.nama)} title="Hapus">
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
              <h3 className="modal-title">{editingItem ? 'Edit Barang' : 'Tambah Barang'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Barang</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select
                  className="form-input"
                  value={form.kategori}
                  onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                >
                  <option value="Olahraga">Olahraga</option>
                  <option value="Seni">Seni</option>
                  <option value="Elektronik">Elektronik</option>
                  <option value="Outdoor">Outdoor</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Total Barang</label>
                  <input
                    type="number"
                    required
                    min={0}
                    className="form-input"
                    value={form.total}
                    onChange={(e) => setForm({ ...form, total: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tersedia</label>
                  <input
                    type="number"
                    required
                    min={0}
                    className="form-input"
                    value={form.tersedia}
                    onChange={(e) => setForm({ ...form, tersedia: parseInt(e.target.value) || 0 })}
                  />
                </div>
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
