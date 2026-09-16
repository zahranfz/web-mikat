'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Clock,
  Award,
  CalendarDays,
  Users,
  CheckCircle,
  XCircle,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import {
  fetchPeminjaman,
  fetchDelegasi,
  fetchProker,
  fetchPengurus,
  updatePeminjamanStatus,
  updateDelegasiStatus,
} from '@/lib/supabaseClient';
import { PeminjamanItem, DelegasiItem } from '@/lib/initialData';

export default function AdminDashboardPage() {
  const [loans, setLoans] = useState<PeminjamanItem[]>([]);
  const [delegations, setDelegations] = useState<DelegasiItem[]>([]);
  const [prokerCount, setProkerCount] = useState(0);
  const [pengurusCount, setPengurusCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [loanData, delData, prokerData, pengurusData] = await Promise.all([
      fetchPeminjaman(),
      fetchDelegasi(),
      fetchProker(),
      fetchPengurus(),
    ]);
    setLoans(loanData);
    setDelegations(delData);
    setProkerCount(prokerData.length);
    setPengurusCount(pengurusData.length);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLoanStatus = async (id: string, status: PeminjamanItem['status']) => {
    const updated = await updatePeminjamanStatus(id, status);
    if (!updated) {
      alert('Status peminjaman gagal diperbarui.');
      return;
    }
    loadData();
  };

  const handleDelegationStatus = async (id: string, status: DelegasiItem['status']) => {
    const updated = await updateDelegasiStatus(id, status);
    if (!updated) {
      alert('Status delegasi gagal diperbarui.');
      return;
    }
    loadData();
  };

  const pendingLoans = loans.filter((l) => l.status === 'pending').length;
  const pendingDelegations = delegations.filter((d) => d.status === 'menunggu_review').length;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 className="admin-title">Ringkasan Sistem &amp; Statistik</h1>
        <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '4px' }}>
          Pantau status pengajuan mahasiswa dan konten aktif Kementerian Minat dan Bakat.
        </p>
      </div>

      {/* METRICS CARDS */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-card-title">Peminjaman Masuk</span>
          <div className="stat-card-num">{loans.length}</div>
          <span style={{ fontSize: '12px', color: '#64748B' }}>Total seluruh pengajuan</span>
        </div>

        <div className="stat-card gold">
          <span className="stat-card-title">Menunggu Persetujuan</span>
          <div className="stat-card-num">{pendingLoans}</div>
          <span style={{ fontSize: '12px', color: '#D97706' }}>Perlu segera diverifikasi</span>
        </div>

        <div className="stat-card red">
          <span className="stat-card-title">Delegasi Lomba</span>
          <div className="stat-card-num">{delegations.length}</div>
          <span style={{ fontSize: '12px', color: 'var(--red)' }}>{pendingDelegations} berkas baru</span>
        </div>

        <div className="stat-card green">
          <span className="stat-card-title">Konten Aktif</span>
          <div className="stat-card-num">{prokerCount}</div>
          <span style={{ fontSize: '12px', color: '#059669' }}>{pengurusCount} anggota pengurus</span>
        </div>
      </div>

      {/* RECENT PEMINJAMAN TABLE */}
      <div className="admin-card">
        <div className="admin-card-head">
          <div>
            <div className="admin-card-title">Pengajuan Peminjaman Alat Terbaru</div>
            <p style={{ fontSize: '12.5px', color: '#64748B' }}>Verifikasi pengajuan alat inventaris dari mahasiswa KBMFT</p>
          </div>
          <Link href="/admin/peminjaman" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: 'var(--red)' }}>
            <span>Kelola Semua Peminjaman</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Peminjam &amp; NIM</th>
                <th>Alat &amp; Jml</th>
                <th>Tgl Pinjam - Kembali</th>
                <th>Keperluan</th>
                <th>No WhatsApp</th>
                <th>Status</th>
                <th>Aksi Cepat</th>
              </tr>
            </thead>
            <tbody>
              {loans.slice(0, 4).map((loan) => (
                <tr key={loan.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{loan.nama_peminjam}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{loan.nim} · {loan.jurusan}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{loan.nama_alat}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>{loan.jumlah} unit</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px' }}>{loan.tanggal_pinjam} s/d</div>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>{loan.tanggal_kembali}</div>
                  </td>
                  <td style={{ maxWidth: '200px', fontSize: '12.5px' }}>{loan.keperluan}</td>
                  <td>
                    <a
                      href={`https://wa.me/${loan.no_wa.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#059669', fontWeight: 600, fontSize: '12.5px' }}
                    >
                      {loan.no_wa}
                    </a>
                  </td>
                  <td>
                    <span className={`badge-status ${loan.status}`}>{loan.status}</span>
                  </td>
                  <td>
                    <div className="action-btns">
                      {loan.status !== 'disetujui' && (
                        <button
                          className="btn-sm approve"
                          onClick={() => handleLoanStatus(loan.id, 'disetujui')}
                          title="Setujui Peminjaman"
                        >
                          <CheckCircle size={13} />
                          <span>Setujui</span>
                        </button>
                      )}
                      {loan.status !== 'ditolak' && (
                        <button
                          className="btn-sm reject"
                          onClick={() => handleLoanStatus(loan.id, 'ditolak')}
                          title="Tolak Peminjaman"
                        >
                          <XCircle size={13} />
                          <span>Tolak</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {loans.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>
                    Belum ada data peminjaman yang diajukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT DELEGASI TABLE */}
      <div className="admin-card">
        <div className="admin-card-head">
          <div>
            <div className="admin-card-title">Pengajuan Delegasi Lomba Terbaru</div>
            <p style={{ fontSize: '12.5px', color: '#64748B' }}>Review berkas proposal &amp; pakta integritas lomba</p>
          </div>
          <Link href="/admin/delegasi" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: 'var(--red)' }}>
            <span>Kelola Semua Delegasi</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Ketua &amp; NIM</th>
                <th>Nama Kompetisi</th>
                <th>Kategori</th>
                <th>Berkas Proposal</th>
                <th>WhatsApp</th>
                <th>Status</th>
                <th>Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody>
              {delegations.slice(0, 4).map((del) => (
                <tr key={del.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{del.nama_ketua}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{del.nim} · {del.jurusan}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{del.nama_lomba}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>{del.penyelenggara || 'Internal/Eksternal'}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '11.5px', textTransform: 'uppercase', fontWeight: 700, color: del.kategori === 'berbayar' ? 'var(--red)' : 'var(--navy)' }}>
                      {del.kategori}
                    </span>
                  </td>
                  <td>
                    <a
                      href={del.link_berkas}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563EB', fontWeight: 600, fontSize: '12.5px' }}
                    >
                      <span>Buka Drive</span>
                      <ExternalLink size={13} />
                    </a>
                  </td>
                  <td>
                    <a
                      href={`https://wa.me/${del.no_wa.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#059669', fontWeight: 600, fontSize: '12.5px' }}
                    >
                      {del.no_wa}
                    </a>
                  </td>
                  <td>
                    <span className={`badge-status ${del.status}`}>{del.status.replace('_', ' ')}</span>
                  </td>
                  <td>
                    <div className="action-btns">
                      {del.status !== 'diverifikasi' && (
                        <button
                          className="btn-sm approve"
                          onClick={() => handleDelegationStatus(del.id, 'diverifikasi')}
                        >
                          <CheckCircle size={13} />
                          <span>Verifikasi</span>
                        </button>
                      )}
                      {del.status !== 'ditolak' && (
                        <button
                          className="btn-sm reject"
                          onClick={() => handleDelegationStatus(del.id, 'ditolak')}
                        >
                          <XCircle size={13} />
                          <span>Tolak</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {delegations.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>
                    Belum ada pengajuan delegasi lomba.
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
