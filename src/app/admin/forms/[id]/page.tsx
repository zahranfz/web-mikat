'use client';

import { useState, useEffect } from 'react';
import { fetchForms, fetchFormResponses } from '@/lib/supabaseClient';
import { ArrowLeft, Download, FileText, Calendar } from 'lucide-react';
import NextLink from 'next/link';
import { useParams } from 'next/navigation';

export default function AdminFormResponsesPage() {
  const { id } = useParams();
  const [form, setForm] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      // 1. Ambil data form
      const formsData = await fetchForms();
      const currentForm = formsData.find((f: any) => f.id === id);
      if (currentForm) {
        setForm(currentForm);
      }

      // 2. Ambil responses
      if (id) {
        const respData = await fetchFormResponses(id as string);
        setResponses(respData);
      }
    };
    loadData();
  }, [id]);

  const generateCSV = () => {
    if (!form || responses.length === 0) return;

    // Ambil header dari struktur fields
    const headers = form.fields.map((f: any) => f.label);
    headers.push('Waktu Submit');

    const csvContent = responses.map(r => {
      const row = form.fields.map((f: any) => `"${r.answers[f.id] || ''}"`);
      row.push(`"${new Date(r.created_at).toLocaleString('id-ID')}"`);
      return row.join(',');
    });

    const csvStr = [headers.join(','), ...csvContent].join('\n');
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Responses_${form.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!form) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading form data...</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <NextLink href="/admin/forms">
          <button className="btn-sm outline" style={{ padding: '10px', aspectRatio: '1/1', justifyContent: 'center' }}>
            <ArrowLeft size={16} />
          </button>
        </NextLink>
        <div>
          <h1 className="admin-title">{form.title}</h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '4px' }}>
            Daftar respons peserta untuk formulir <strong>/{form.slug}</strong>
          </p>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Total Pendaftar</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy)' }}>{responses.length}</div>
          </div>
        </div>
        <button className="btn-pill outline" onClick={generateCSV} style={{ borderColor: '#059669', color: '#059669' }} disabled={responses.length === 0}>
          <Download size={16} />
          <span>Export Excel (CSV)</span>
        </button>
      </div>

      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                {form.fields.map((f: any) => (
                  <th key={f.id}>{f.label}</th>
                ))}
                <th>Waktu Submit</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((resp: any) => (
                <tr key={resp.id}>
                  {form.fields.map((f: any) => (
                    <td key={f.id}>
                      {f.type === 'textarea' ? (
                        <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={resp.answers[f.id]}>
                          {resp.answers[f.id] || '-'}
                        </div>
                      ) : (
                        <span style={{ fontWeight: f.id === 'nama' ? 600 : 400 }}>{resp.answers[f.id] || '-'}</span>
                      )}
                    </td>
                  ))}
                  <td>
                    <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {new Date(resp.created_at).toLocaleDateString('id-ID')}
                    </div>
                  </td>
                </tr>
              ))}
              {responses.length === 0 && (
                <tr>
                  <td colSpan={form.fields.length + 1} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    <FileText size={32} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
                    Belum ada pendaftar yang mengisi form ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
