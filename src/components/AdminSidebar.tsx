'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Award,
  CalendarDays,
  Users,
  ClipboardList,
  LogOut,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { logoutAdmin } from '@/lib/supabaseClient';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logoutAdmin();
    router.push('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Peminjaman Alat', href: '/admin/peminjaman', icon: Package },
    { label: 'Delegasi Lomba', href: '/admin/delegasi', icon: Award },
    { label: 'Program & Agenda', href: '/admin/proker', icon: CalendarDays },
    { label: 'Pengurus & Staf', href: '/admin/pengurus', icon: Users },
    { label: 'Audit Log', href: '/admin/audit-log', icon: ClipboardList },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-top">
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <ShieldCheck size={20} />
          </div>
          <div className="brand-text">
            <div style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '1px', fontWeight: 700 }}>
              ADMIN PANEL
            </div>
            <div style={{ fontFamily: 'Anton', fontSize: '16px', color: '#fff', letterSpacing: '.5px' }}>
              MIKAT BEM FT
            </div>
          </div>
        </Link>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span className="sidebar-text">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="admin-sidebar-bottom">
        <Link
          href="/"
          target="_blank"
          className="admin-nav-item"
          style={{ marginBottom: '8px', color: 'var(--gold-soft)' }}
        >
          <ExternalLink size={16} />
          <span className="sidebar-text">Lihat Website</span>
        </Link>

        <button
          onClick={handleLogout}
          className="admin-nav-item"
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: '#F87171' }}
        >
          <LogOut size={16} />
          <span className="sidebar-text">Keluar (Logout)</span>
        </button>
      </div>
    </aside>
  );
}
