'use client';

import { useEffect, useState } from 'react';
import { ClipboardList, RefreshCw } from 'lucide-react';
import { AdminAuditLog, fetchAdminAuditLogs } from '@/lib/supabaseClient';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatDetails(details: Record<string, unknown> | null) {
  if (!details) return '-';
  return Object.entries(details)
    .filter(([key]) => !['created_at'].includes(key))
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${String(value ?? '-')}`)
    .join(' | ');
}

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    setLogs(await fetchAdminAuditLogs());
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div>
          <h1 className="admin-title">Audit Log Aktivitas</h1>
          <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '4px' }}>
            Riwayat perubahan data yang dilakukan oleh admin.
          </p>
        </div>
        <button className="btn-pill secondary" onClick={loadLogs} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>Segarkan</span>
        </button>
      </div>

      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Aksi</th>
                <th>Tabel</th>
                <th>ID Record</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '12px' }}>{formatDate(log.created_at)}</td>
                  <td>
                    <span className={`badge-status ${log.action.toLowerCase()}`}>{log.action}</span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{log.table_name}</td>
                  <td style={{ fontSize: '11px', color: '#64748B' }}>{log.record_id || '-'}</td>
                  <td style={{ maxWidth: '460px', fontSize: '12px', color: '#475569' }}>{formatDetails(log.details)}</td>
                </tr>
              ))}
              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    <ClipboardList size={28} style={{ margin: '0 auto 8px' }} />
                    Belum ada aktivitas admin.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                    Memuat audit log...
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
