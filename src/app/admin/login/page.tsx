'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { loginAdmin } from '@/lib/supabaseClient';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await loginAdmin(email, password);
      if (res.success) {
        router.push('/admin');
      } else {
        setErrorMsg(res.error || 'Gagal login. Periksa email dan password.');
      }
    } catch (err: any) {
      setErrorMsg('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--navy-deep)',
        padding: '24px',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--cream-soft)',
          border: '2px solid var(--line)',
          borderRadius: '16px',
          padding: '36px 28px',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--red)',
            marginBottom: '20px',
          }}
        >
          <ArrowLeft size={14} />
          <span>Kembali ke Web Publik</span>
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--navy)',
              color: 'var(--gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 0 0 4px var(--cream)',
            }}
          >
            <ShieldCheck size={32} />
          </div>
          <h1 style={{ fontFamily: 'Anton', fontSize: '24px', color: 'var(--navy)', letterSpacing: '.5px' }}>
            Portal Admin Pengurus
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--ink-soft)', marginTop: '4px' }}>
            Kementerian Minat dan Bakat BEM FT Unsoed
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              background: '#FEE2E2',
              color: '#991B1B',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              marginBottom: '18px',
              border: '1px solid #F87171',
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Pengurus</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                className="form-input"
                placeholder="admin@mikat.unsoed.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Kata Sandi</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-pill primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '12px', padding: '12px' }}
            disabled={loading}
          >
            {loading ? <Loader2 size={16} className="spin" /> : <Lock size={16} />}
            <span>{loading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
          </button>
        </form>

      </div>
    </div>
  );
}
