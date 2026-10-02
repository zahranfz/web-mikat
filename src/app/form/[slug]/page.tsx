'use client';

import { useState, useEffect } from 'react';
import { fetchFormBySlug, submitFormResponse } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';
import { Send, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import NextLink from 'next/link';

export default function PublicFormPage() {
  const { slug } = useParams();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (slug) {
        const data = await fetchFormBySlug(slug as string);
        setForm(data);
      }
      setLoading(false);
    };
    loadData();
  }, [slug]);

  const handleChange = (id: string, val: any) => {
    setAnswers(prev => ({ ...prev, [id]: val }));
  };

  const handleCheckboxChange = (id: string, val: string, checked: boolean) => {
    setAnswers(prev => {
      const current = prev[id] ? prev[id].split(', ') : [];
      if (checked) {
        return { ...prev, [id]: [...current, val].join(', ') };
      } else {
        return { ...prev, [id]: current.filter((item: string) => item !== val).join(', ') };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !form.is_active) return;
    
    setSubmitting(true);
    setErrorMsg('');

    const finalAnswers = { ...answers };
    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

    // Helper to get Base64
    const getBase64 = (file: File) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });

    for (const field of form.fields) {
      if (field.type === 'file' && answers[field.id] instanceof File) {
        if (!scriptUrl) {
          setErrorMsg('URL Upload Drive belum dikonfigurasi oleh Admin.');
          setSubmitting(false);
          return;
        }

        const file = answers[field.id] as File;
        try {
          const base64Data = await getBase64(file);
          const driveUploadRes = await fetch(scriptUrl, {
            method: 'POST',
            body: JSON.stringify({
              filename: file.name,
              mimeType: file.type,
              base64: base64Data
            })
          });
          const responseData = await driveUploadRes.json();
          if (responseData.status === 'success') {
            finalAnswers[field.id] = responseData.url; // Simpan URL ke database
          } else {
            throw new Error(responseData.message);
          }
        } catch (err: any) {
          setErrorMsg('Gagal mengunggah file: ' + err.message);
          setSubmitting(false);
          return;
        }
      }
    }
    
    const res = await submitFormResponse(form.id, finalAnswers);
    if (res.error) {
      setErrorMsg('Gagal mengirim jawaban: ' + res.error);
    } else {
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#F8FAFC' }}>
        <Loader2 className="spinner" size={40} color="var(--primary)" />
      </div>
    );
  }

  if (!form) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#F8FAFC', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', fontFamily: 'Anton', color: 'var(--navy)', marginBottom: '8px' }}>FORMULIR TIDAK DITEMUKAN</h1>
        <p style={{ color: '#64748B', marginBottom: '24px' }}>Tautan pendaftaran mungkin salah atau formulir telah dihapus.</p>
        <NextLink href="/">
          <button className="btn-pill primary">Kembali ke Beranda</button>
        </NextLink>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9', padding: '40px 20px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <NextLink href="/">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#64748B', fontWeight: 600, fontSize: '14px', marginBottom: '24px', cursor: 'pointer' }}>
            <ArrowLeft size={16} />
            <span>Kembali ke Beranda</span>
          </div>
        </NextLink>

        {submitted ? (
          <div className="card" style={{ padding: '40px 20px', textAlign: 'center', background: '#fff', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <CheckCircle2 size={64} color="#059669" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontFamily: 'Anton', fontSize: '24px', color: 'var(--navy)', marginBottom: '12px' }}>Pendaftaran Berhasil!</h2>
            <p style={{ color: '#64748B', lineHeight: '1.6', marginBottom: '32px' }}>
              Terima kasih telah mengisi formulir <strong>{form.title}</strong>. Jawaban Anda telah kami terima dan akan segera diproses oleh Kementerian Minat dan Bakat.
            </p>
            <NextLink href="/">
              <button className="btn-pill primary" style={{ margin: '0 auto' }}>Selesai</button>
            </NextLink>
          </div>
        ) : (
          <div className="card" style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            {/* Header Form */}
            {form.cover_image ? (
              <div style={{ width: '100%', height: '180px', background: `url(${form.cover_image}) center/cover` }}></div>
            ) : (
              <div style={{ background: 'var(--primary)', height: '12px', width: '100%' }}></div>
            )}
            
            <div style={{ padding: '32px' }}>
              <h1 style={{ fontFamily: 'Anton', fontSize: '28px', color: 'var(--navy)', marginBottom: '12px' }}>{form.title}</h1>
              {form.description && (
                <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {form.description}
                </p>
              )}
              
              {!form.is_active && (
                <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '12px 16px', borderRadius: '8px', marginTop: '20px', fontWeight: 600, fontSize: '14px' }}>
                  Mohon maaf, formulir pendaftaran ini sudah ditutup.
                </div>
              )}
            </div>

            {/* Body Form */}
            {form.is_active && (
              <form onSubmit={handleSubmit} style={{ padding: '0 32px 32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {form.fields.map((f: any) => (
                    <div key={f.id} style={{ background: '#F8FAFC', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <label style={{ display: 'block', fontWeight: 700, color: 'var(--navy)', marginBottom: '12px', fontSize: '15px' }}>
                        {f.label} {f.required && <span style={{ color: '#E11D48' }}>*</span>}
                      </label>
                      
                      {f.type === 'textarea' ? (
                        <textarea
                          required={f.required}
                          className="form-input"
                          rows={4}
                          placeholder="Ketik jawaban Anda..."
                          value={answers[f.id] || ''}
                          onChange={e => handleChange(f.id, e.target.value)}
                        />
                      ) : f.type === 'select' ? (
                        <select
                          required={f.required}
                          className="form-select"
                          value={answers[f.id] || ''}
                          onChange={e => handleChange(f.id, e.target.value)}
                        >
                          <option value="" disabled>Pilih salah satu</option>
                          {(f.options || []).map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : f.type === 'radio' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {(f.options || []).map((opt: string) => (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px' }}>
                              <input
                                type="radio"
                                name={f.id}
                                required={f.required && !answers[f.id]}
                                value={opt}
                                checked={answers[f.id] === opt}
                                onChange={e => handleChange(f.id, e.target.value)}
                                style={{ width: '18px', height: '18px', accentColor: 'var(--navy)' }}
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      ) : f.type === 'checkbox' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {(f.options || []).map((opt: string) => {
                            const isChecked = answers[f.id]?.includes(opt);
                            return (
                              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '15px' }}>
                                <input
                                  type="checkbox"
                                  value={opt}
                                  checked={isChecked || false}
                                  onChange={e => handleCheckboxChange(f.id, e.target.value, e.target.checked)}
                                  style={{ width: '18px', height: '18px', accentColor: 'var(--navy)' }}
                                />
                                <span>{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      ) : f.type === 'file' ? (
                        <input
                          type="file"
                          required={f.required}
                          className="form-input"
                          onChange={e => handleChange(f.id, e.target.files ? e.target.files[0] : null)}
                          style={{ padding: '12px' }}
                        />
                      ) : (
                        <input
                          type={f.type || 'text'}
                          required={f.required}
                          className="form-input"
                          placeholder="Ketik jawaban Anda..."
                          value={answers[f.id] || ''}
                          onChange={e => handleChange(f.id, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {errorMsg && (
                  <div style={{ color: '#E11D48', background: '#FFE4E6', padding: '12px', borderRadius: '8px', marginTop: '24px', fontSize: '14px', fontWeight: 500 }}>
                    {errorMsg}
                  </div>
                )}

                <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn-pill primary" disabled={submitting}>
                    {submitting ? <Loader2 className="spinner" size={18} /> : <Send size={18} />}
                    <span>Kirim Jawaban</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
