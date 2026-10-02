'use client';

import { useState, useEffect } from 'react';
import { fetchForms, addForm, deleteForm } from '@/lib/supabaseClient';
import { Plus, ListChecks, Link, X, Settings2, ArrowRight, Trash2, GripVertical, Type, AlignLeft, ChevronDown, CheckSquare, Image as ImageIcon } from 'lucide-react';
import NextLink from 'next/link';

export default function AdminFormsPage() {
  const [forms, setForms] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const defaultField = () => ({ id: 'f_' + Math.random().toString(36).substr(2, 9), label: 'Pertanyaan Tanpa Judul', type: 'text', required: false, options: ['Opsi 1'] });
  
  const [newForm, setNewForm] = useState({
    title: 'Formulir Tanpa Judul',
    description: '',
    slug: '',
    cover_image: '',
    fields: [
      { id: 'nama', label: 'Nama Lengkap', type: 'text', required: true, options: [] },
      { id: 'nim', label: 'NIM', type: 'text', required: true, options: [] },
      { id: 'prodi', label: 'Program Studi', type: 'text', required: true, options: [] },
      { id: 'wa', label: 'Nomor WhatsApp', type: 'text', required: true, options: [] }
    ] as any[]
  });

  const loadData = async () => {
    const data = await fetchForms();
    setForms(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.slug) { alert("Custom URL (Slug) harus diisi!"); return; }
    
    const result = await addForm({ ...newForm });
    if (result.error) {
      alert('Gagal membuat form: ' + result.error);
    } else {
      setIsModalOpen(false);
      setNewForm({ title: 'Formulir Tanpa Judul', description: '', slug: '', cover_image: '', fields: [] });
      loadData();
    }
  };

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/form/${slug}`;
    navigator.clipboard.writeText(url);
    alert('Link berhasil disalin: ' + url);
  };

  const handleDeleteForm = async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus form "${title}"? Semua data pendaftar juga akan terhapus.`)) {
      const success = await deleteForm(id);
      if (success) {
        loadData();
      } else {
        alert('Gagal menghapus form.');
      }
    }
  };

  // Field Builder Handlers
  const addField = () => {
    setNewForm({ ...newForm, fields: [...newForm.fields, defaultField()] });
  };

  const removeField = (id: string) => {
    setNewForm({ ...newForm, fields: newForm.fields.filter(f => f.id !== id) });
  };

  const updateField = (id: string, updates: any) => {
    setNewForm({
      ...newForm,
      fields: newForm.fields.map(f => f.id === id ? { ...f, ...updates } : f)
    });
  };

  const updateOption = (fieldId: string, index: number, val: string) => {
    setNewForm({
      ...newForm,
      fields: newForm.fields.map(f => {
        if (f.id === fieldId) {
          const newOptions = [...f.options];
          newOptions[index] = val;
          return { ...f, options: newOptions };
        }
        return f;
      })
    });
  };

  const addOption = (fieldId: string) => {
    setNewForm({
      ...newForm,
      fields: newForm.fields.map(f => {
        if (f.id === fieldId) {
          return { ...f, options: [...f.options, `Opsi ${f.options.length + 1}`] };
        }
        return f;
      })
    });
  };

  const removeOption = (fieldId: string, index: number) => {
    setNewForm({
      ...newForm,
      fields: newForm.fields.map(f => {
        if (f.id === fieldId) {
          const newOptions = f.options.filter((_:any, i:number) => i !== index);
          return { ...f, options: newOptions };
        }
        return f;
      })
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="admin-title">Pusat Pendaftaran & Rekrutmen (Forms)</h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '4px' }}>
            Buat formulir pendaftaran interaktif bergaya Google Forms.
          </p>
        </div>

        <button className="btn-pill primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>Buat Form Baru</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {forms.map(form => (
          <div key={form.id} className="admin-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            {form.cover_image && (
              <div style={{ height: '100px', borderRadius: '8px', marginBottom: '16px', background: `url(${form.cover_image}) center/cover` }}></div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: form.is_active ? '#059669' : '#94A3B8', background: form.is_active ? '#D1FAE5' : '#F1F5F9', padding: '4px 8px', borderRadius: '12px' }}>
                  {form.is_active ? 'Aktif' : 'Tutup'}
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--navy)', marginTop: '12px', marginBottom: '6px' }}>
                  {form.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {form.description}
                </p>
              </div>
            </div>

            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#475569', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Link size={14} color="#94A3B8" />
                <span style={{ fontWeight: 600 }}>/form/{form.slug}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ListChecks size={14} color="#94A3B8" />
                <span>{form.fields?.length || 4} Pertanyaan</span>
              </div>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
              <NextLink href={`/admin/forms/${form.id}`} style={{ flex: 1 }}>
                <button className="btn-sm primary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
                  <span>Lihat Pendaftar</span>
                  <ArrowRight size={14} />
                </button>
              </NextLink>
              <button 
                className="btn-sm outline" 
                onClick={() => copyLink(form.slug)}
                title="Copy Link Pendaftaran"
                style={{ padding: '10px', aspectRatio: '1/1', justifyContent: 'center' }}
              >
                <Link size={14} />
              </button>
              <button 
                className="btn-sm danger" 
                onClick={() => handleDeleteForm(form.id, form.title)}
                title="Hapus Form"
                style={{ padding: '10px', aspectRatio: '1/1', justifyContent: 'center' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {forms.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <Settings2 size={48} color="#CBD5E1" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--navy)', marginBottom: '8px' }}>Belum Ada Form</h3>
            <p style={{ color: '#64748B', fontSize: '14px' }}>Buat formulir pendaftaran pertama Anda dengan menekan tombol "Buat Form Baru".</p>
          </div>
        )}
      </div>

      {/* Modal Form Builder Penuh */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ background: '#F1F5F9' }}>
          <div style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '40px 20px' }}>
            <div style={{ maxWidth: '768px', margin: '0 auto' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontFamily: 'Anton', color: 'var(--navy)' }}>Form Builder Mikat</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn-pill secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
                  <button type="button" className="btn-pill primary" onClick={handleCreate}>Simpan & Terbitkan</button>
                </div>
              </div>

              {/* URL & Cover Settings */}
              <div className="admin-card" style={{ marginBottom: '24px' }}>
                <div className="form-group full" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Custom URL Link (Slug) *</label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ padding: '12px 16px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRight: 'none', borderRadius: '8px 0 0 8px', color: '#64748B', fontSize: '13px' }}>
                      /form/
                    </span>
                    <input
                      type="text"
                      required
                      className="form-input"
                      style={{ borderRadius: '0 8px 8px 0', borderColor: !newForm.slug ? 'var(--red)' : '' }}
                      placeholder="contoh: oprec-techart-26"
                      value={newForm.slug}
                      onChange={e => setNewForm({ ...newForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    />
                  </div>
                </div>
                <div className="form-group full" style={{ marginBottom: '0' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={14} /> Link Header Gambar (Opsional)
                  </label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://gdrive/..."
                    value={newForm.cover_image}
                    onChange={e => setNewForm({ ...newForm, cover_image: e.target.value })}
                  />
                </div>
              </div>

              {/* Form Header (Google Form Style) */}
              <div className="admin-card" style={{ borderTop: '10px solid var(--primary)', marginBottom: '24px', padding: '32px' }}>
                <input
                  type="text"
                  value={newForm.title}
                  onChange={e => setNewForm({ ...newForm, title: e.target.value })}
                  style={{ width: '100%', fontSize: '32px', fontWeight: 700, border: 'none', outline: 'none', borderBottom: '1px solid transparent', marginBottom: '8px', transition: '0.2s' }}
                  placeholder="Formulir Tanpa Judul"
                  onFocus={e => e.target.style.borderBottom = '1px solid #CBD5E1'}
                  onBlur={e => e.target.style.borderBottom = '1px solid transparent'}
                />
                <textarea
                  value={newForm.description}
                  onChange={e => setNewForm({ ...newForm, description: e.target.value })}
                  style={{ width: '100%', fontSize: '14px', color: '#475569', border: 'none', outline: 'none', borderBottom: '1px solid transparent', transition: '0.2s', resize: 'none' }}
                  rows={2}
                  placeholder="Deskripsi formulir"
                  onFocus={e => e.target.style.borderBottom = '1px solid #CBD5E1'}
                  onBlur={e => e.target.style.borderBottom = '1px solid transparent'}
                />
              </div>

              {/* Form Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
                {newForm.fields.map((field, idx) => (
                  <div key={field.id} className="admin-card" style={{ padding: '24px', position: 'relative', borderLeft: '4px solid var(--blue)' }}>
                    
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        value={field.label}
                        onChange={e => updateField(field.id, { label: e.target.value })}
                        style={{ flex: 1, padding: '12px', fontSize: '15px', fontWeight: 600, background: '#F8FAFC', border: 'none', borderBottom: '2px solid #CBD5E1', outline: 'none' }}
                        placeholder="Pertanyaan"
                        onFocus={e => e.target.style.borderBottomColor = 'var(--navy)'}
                        onBlur={e => e.target.style.borderBottomColor = '#CBD5E1'}
                      />
                      <select 
                        value={field.type}
                        onChange={e => updateField(field.id, { type: e.target.value })}
                        style={{ padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none', background: '#fff', fontSize: '14px', width: '200px' }}
                      >
                        <option value="text">Jawaban Singkat (Teks)</option>
                        <option value="textarea">Paragraf (Teks Panjang)</option>
                        <option value="select">Dropdown (Pilihan)</option>
                        <option value="radio">Pilihan Ganda (Satu Pilihan)</option>
                        <option value="checkbox">Kotak Centang (Banyak Pilihan)</option>
                        <option value="file">Upload Berkas (Google Drive)</option>
                      </select>
                    </div>

                    {/* Options Builder for Select, Radio, Checkbox */}
                    {['select', 'radio', 'checkbox'].includes(field.type) && (
                      <div style={{ marginLeft: '12px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                        {field.options?.map((opt: string, optIdx: number) => (
                          <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {field.type === 'radio' ? <div style={{width:'16px', height:'16px', borderRadius:'50%', border:'2px solid #CBD5E1'}}></div> 
                             : field.type === 'checkbox' ? <div style={{width:'16px', height:'16px', borderRadius:'4px', border:'2px solid #CBD5E1'}}></div>
                             : <span style={{color:'#94A3B8', fontSize:'14px'}}>{optIdx + 1}.</span>}
                            
                            <input
                              type="text"
                              value={opt}
                              onChange={e => updateOption(field.id, optIdx, e.target.value)}
                              style={{ border: 'none', outline: 'none', borderBottom: '1px solid transparent', fontSize: '14px', flex: 1 }}
                              onFocus={e => e.target.style.borderBottom = '1px solid #CBD5E1'}
                              onBlur={e => e.target.style.borderBottom = '1px solid transparent'}
                            />
                            {field.options.length > 1 && (
                              <button onClick={() => removeOption(field.id, optIdx)} style={{ color: '#94A3B8', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                          <button onClick={() => addOption(field.id)} style={{ color: '#2563EB', fontSize: '13px', fontWeight: 600, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                            + Tambahkan Opsi
                          </button>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                      <button onClick={() => removeField(field.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }} title="Hapus Pertanyaan">
                        <Trash2 size={18} />
                      </button>
                      <div style={{ width: '1px', height: '24px', background: '#E2E8F0' }}></div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                        <span>Wajib diisi</span>
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={e => updateField(field.id, { required: e.target.checked })}
                          style={{ width: '16px', height: '16px', accentColor: 'var(--navy)' }}
                        />
                      </label>
                    </div>

                  </div>
                ))}

                <button 
                  onClick={addField}
                  style={{ padding: '16px', borderRadius: '12px', border: '2px dashed #CBD5E1', background: '#fff', color: 'var(--navy)', fontWeight: 600, fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <Plus size={18} />
                  <span>Tambahkan Pertanyaan</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
