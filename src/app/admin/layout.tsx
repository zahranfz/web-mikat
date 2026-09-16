'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import { getAdminSession, isSupabaseConfigured } from '@/lib/supabaseClient';
import { UserCheck, Database } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function verifySession() {
      if (pathname === '/admin/login') {
        setAuthenticated(true);
        return;
      }

      const session = await getAdminSession();
      if (!session) {
        router.push('/admin/login');
      } else {
        setAuthenticated(true);
      }
    }

    verifySession();
  }, [pathname, router]);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (authenticated === null) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F8F9FC',
          fontFamily: 'sans-serif',
          color: 'var(--navy)',
        }}
      >
        Memuat sesi admin...
      </div>
    );
  }

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-header">
          <div>
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.5px' }}>
              Kabinet Sagara Cakrawala
            </span>
            <div style={{ fontFamily: 'Anton', fontSize: '20px', color: 'var(--navy)', letterSpacing: '.3px' }}>
              Panel Administrasi Minat &amp; Bakat
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11.5px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '20px',
                background: isSupabaseConfigured ? '#D1FAE5' : '#FEF3C7',
                color: isSupabaseConfigured ? '#065F46' : '#92400E',
              }}
            >
              <Database size={12} />
              <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Local Storage Mode'}</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#F1F5F9',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--navy)',
              }}
            >
              <UserCheck size={16} color="var(--red)" />
              <span>Admin Mikat</span>
            </div>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
