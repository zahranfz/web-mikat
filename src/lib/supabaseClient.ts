import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  PeminjamanItem,
  DelegasiItem,
  ProkerItem,
  PengurusItem,
  InventoryItem,
  AchievementItem,
  INITIAL_PEMINJAMAN,
  INITIAL_DELEGASI,
  INITIAL_PROKER,
  INITIAL_PENGURUS,
  INITIAL_INVENTORY,
  INITIAL_ACHIEVEMENTS,
} from './initialData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const STORAGE_BUCKET_NAME = 'mikat-assets';
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'kementerianmikatbemft2026@gmail.com')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey &&
  supabaseAnonKey.length > 10
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function resolveAssetUrl(assetPath?: string | null): string {
  if (!assetPath) return '';

  if (assetPath.startsWith('http://') || assetPath.startsWith('https://')) {
    return assetPath;
  }

  if (assetPath.startsWith('/')) {
    return assetPath;
  }

  const normalized = assetPath.replace(/^public\//, '').replace(/^\/+/, '');

  if (!isSupabaseConfigured || !supabase || !supabaseUrl) {
    return `/${normalized}`;
  }

  if (!normalized || normalized.startsWith('assets/')) {
    return `/${normalized}`;
  }

  return `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET_NAME}/${normalized}`;
}

export async function fetchStorageFiles(
  folder: 'pengurus' | 'galeri' | 'dokumen' | 'brand' = 'galeri'
): Promise<string[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET_NAME)
    .list(folder, { limit: 100, offset: 0 });

  if (error || !data) {
    console.warn(`Bucket ${folder} unavailable:`, error?.message || 'Unknown error');
    return [];
  }

  return data
    .filter((item) => item.name && !item.name.startsWith('.'))
    .map((item) => resolveAssetUrl(`${folder}/${item.name}`));
}

// Helpers for Local Storage Fallback
const STORAGE_KEYS = {
  PEMINJAMAN: 'mikat_peminjaman_v1',
  DELEGASI: 'mikat_delegasi_v1',
  PROKER: 'mikat_proker_v1',
  PENGURUS: 'mikat_pengurus_v1',
  AUTH: 'mikat_admin_session_v1',
};

export interface AdminAuditLog {
  id: string;
  admin_id: string | null;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  table_name: string;
  record_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, val: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('LocalStorage error:', err);
  }
}

export async function fetchAdminAuditLogs(): Promise<AdminAuditLog[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from('admin_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Failed to fetch audit logs:', error.message);
    return [];
  }

  return (data || []) as AdminAuditLog[];
}

function validatePhoneNumber(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) {
    return 'Nomor WhatsApp harus berisi 10 sampai 15 digit.';
  }
  return null;
}

function validatePeminjamanInput(
  item: Omit<PeminjamanItem, 'id' | 'created_at' | 'status'>
): string | null {
  if (!item.nama_peminjam.trim() || item.nama_peminjam.trim().length > 120) return 'Nama peminjam tidak valid.';
  if (!item.nim.trim() || item.nim.trim().length > 30) return 'NIM tidak valid.';
  if (!item.nama_alat.trim() || item.nama_alat.trim().length > 200) return 'Nama alat tidak valid.';
  if (!Number.isInteger(item.jumlah) || item.jumlah < 1 || item.jumlah > 100) return 'Jumlah alat harus antara 1 dan 100.';
  if (!item.tanggal_pinjam || !item.tanggal_kembali || item.tanggal_kembali < item.tanggal_pinjam) {
    return 'Tanggal pengembalian harus sama atau setelah tanggal peminjaman.';
  }
  if (!item.keperluan.trim() || item.keperluan.trim().length > 1000) return 'Keperluan tidak valid.';
  return validatePhoneNumber(item.no_wa);
}

function validateDelegasiInput(
  item: Omit<DelegasiItem, 'id' | 'created_at' | 'status'>
): string | null {
  if (!item.nama_ketua.trim() || item.nama_ketua.trim().length > 120) return 'Nama ketua tidak valid.';
  if (!item.nim.trim() || item.nim.trim().length > 30) return 'NIM tidak valid.';
  if (!item.nama_lomba.trim() || item.nama_lomba.trim().length > 200) return 'Nama lomba tidak valid.';
  if (item.penyelenggara && item.penyelenggara.trim().length > 200) return 'Nama penyelenggara terlalu panjang.';
  if (!item.link_berkas.trim()) return 'Link berkas wajib diisi.';
  try {
    const url = new URL(item.link_berkas);
    if (!['http:', 'https:'].includes(url.protocol)) return 'Link berkas harus berupa URL HTTP/HTTPS.';
  } catch {
    return 'Link berkas harus berupa URL yang valid.';
  }
  return validatePhoneNumber(item.no_wa);
}

async function verifyTurnstileToken(token?: string): Promise<string | null> {
  if (!TURNSTILE_SITE_KEY) return null;
  if (!token) return 'Silakan selesaikan verifikasi keamanan terlebih dahulu.';

  try {
    const response = await fetch('/api/turnstile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const result = await response.json();
    return result.success ? null : result.error || 'Verifikasi keamanan gagal.';
  } catch {
    return 'Layanan verifikasi keamanan tidak tersedia.';
  }
}

// -------------------------------------------------------------
// 1. PEMINJAMAN ALAT
// -------------------------------------------------------------
export async function fetchPeminjaman(): Promise<PeminjamanItem[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('peminjaman_alat')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch peminjaman:', error.message);
      return [];
    }
    return (data || []) as PeminjamanItem[];
  }
  return getLocal<PeminjamanItem[]>(STORAGE_KEYS.PEMINJAMAN, INITIAL_PEMINJAMAN);
}

export async function addPeminjaman(
  item: Omit<PeminjamanItem, 'id' | 'created_at' | 'status'>,
  turnstileToken?: string
): Promise<{ success: boolean; data?: PeminjamanItem; error?: string }> {
  const captchaError = await verifyTurnstileToken(turnstileToken);
  if (captchaError) return { success: false, error: captchaError };

  const validationError = validatePeminjamanInput(item);
  if (validationError) return { success: false, error: validationError };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('peminjaman_alat')
      .insert([item]);

    if (!error) {
      return { success: true };
    }

    return { success: false, error: error?.message || 'Pengajuan peminjaman gagal disimpan.' };
  }

  const newItem: PeminjamanItem = {
    ...item,
    id: 'loan-' + Date.now(),
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  const current = getLocal<PeminjamanItem[]>(STORAGE_KEYS.PEMINJAMAN, INITIAL_PEMINJAMAN);
  const updated = [newItem, ...current];
  setLocal(STORAGE_KEYS.PEMINJAMAN, updated);
  return { success: true, data: newItem };
}

export async function updatePeminjamanStatus(
  id: string,
  status: PeminjamanItem['status'],
  catatan?: string
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('peminjaman_alat')
      .update({ status, catatan_admin: catatan })
      .eq('id', id);

    if (!error) return true;
    return false;
  }

  const current = getLocal<PeminjamanItem[]>(STORAGE_KEYS.PEMINJAMAN, INITIAL_PEMINJAMAN);
  const updated = current.map((item) =>
    item.id === id ? { ...item, status, catatan_admin: catatan } : item
  );
  setLocal(STORAGE_KEYS.PEMINJAMAN, updated);
  return true;
}

export async function deletePeminjaman(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('peminjaman_alat').delete().eq('id', id);
    if (!error) return true;
    return false;
  }

  const current = getLocal<PeminjamanItem[]>(STORAGE_KEYS.PEMINJAMAN, INITIAL_PEMINJAMAN);
  const updated = current.filter((item) => item.id !== id);
  setLocal(STORAGE_KEYS.PEMINJAMAN, updated);
  return true;
}

// -------------------------------------------------------------
// 2. DELEGASI LOMBA
// -------------------------------------------------------------
export async function fetchDelegasi(): Promise<DelegasiItem[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('delegasi_lomba')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch delegasi:', error.message);
      return [];
    }
    return (data || []) as DelegasiItem[];
  }
  return getLocal<DelegasiItem[]>(STORAGE_KEYS.DELEGASI, INITIAL_DELEGASI);
}

export async function addDelegasi(
  item: Omit<DelegasiItem, 'id' | 'created_at' | 'status'>,
  turnstileToken?: string
): Promise<{ success: boolean; data?: DelegasiItem; error?: string }> {
  const captchaError = await verifyTurnstileToken(turnstileToken);
  if (captchaError) return { success: false, error: captchaError };

  const validationError = validateDelegasiInput(item);
  if (validationError) return { success: false, error: validationError };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('delegasi_lomba')
      .insert([item]);

    if (!error) {
      return { success: true };
    }

    return { success: false, error: error?.message || 'Pengajuan delegasi gagal disimpan.' };
  }

  const newItem: DelegasiItem = {
    ...item,
    id: 'del-' + Date.now(),
    status: 'menunggu_review',
    created_at: new Date().toISOString(),
  };
  const current = getLocal<DelegasiItem[]>(STORAGE_KEYS.DELEGASI, INITIAL_DELEGASI);
  const updated = [newItem, ...current];
  setLocal(STORAGE_KEYS.DELEGASI, updated);
  return { success: true, data: newItem };
}

export async function updateDelegasiStatus(
  id: string,
  status: DelegasiItem['status'],
  catatan?: string
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('delegasi_lomba')
      .update({ status, catatan_admin: catatan })
      .eq('id', id);

    if (!error) return true;
    return false;
  }

  const current = getLocal<DelegasiItem[]>(STORAGE_KEYS.DELEGASI, INITIAL_DELEGASI);
  const updated = current.map((item) =>
    item.id === id ? { ...item, status, catatan_admin: catatan } : item
  );
  setLocal(STORAGE_KEYS.DELEGASI, updated);
  return true;
}

export async function deleteDelegasi(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('delegasi_lomba').delete().eq('id', id);
    if (!error) return true;
    return false;
  }

  const current = getLocal<DelegasiItem[]>(STORAGE_KEYS.DELEGASI, INITIAL_DELEGASI);
  const updated = current.filter((item) => item.id !== id);
  setLocal(STORAGE_KEYS.DELEGASI, updated);
  return true;
}

// -------------------------------------------------------------
// 3. PROGRAM KERJA (PROKER)
// -------------------------------------------------------------
export async function fetchProker(): Promise<ProkerItem[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('proker')
      .select('*')
      .order('urutan', { ascending: true });

    if (error) {
      console.error('Failed to fetch proker:', error.message);
      return [];
    }
    return (data || []) as ProkerItem[];
  }
  return getLocal<ProkerItem[]>(STORAGE_KEYS.PROKER, INITIAL_PROKER);
}

export async function saveProkerItem(item: ProkerItem): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.id);
    const payload = isUuid ? item : (({ id, ...withoutId }) => withoutId)(item);
    const { error } = await supabase.from('proker').upsert(payload);
    if (!error) return true;
    return false;
  }

  const current = getLocal<ProkerItem[]>(STORAGE_KEYS.PROKER, INITIAL_PROKER);
  const exists = current.some((p) => p.id === item.id);
  const updated = exists ? current.map((p) => (p.id === item.id ? item : p)) : [...current, item];
  setLocal(STORAGE_KEYS.PROKER, updated);
  return true;
}

export async function deleteProkerItem(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('proker').delete().eq('id', id);
    if (!error) return true;
    return false;
  }

  const current = getLocal<ProkerItem[]>(STORAGE_KEYS.PROKER, INITIAL_PROKER);
  const updated = current.filter((p) => p.id !== id);
  setLocal(STORAGE_KEYS.PROKER, updated);
  return true;
}

// -------------------------------------------------------------
// 4. PENGURUS & STAF
// -------------------------------------------------------------
export async function fetchPengurus(): Promise<PengurusItem[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('pengurus')
      .select('*')
      .order('urutan', { ascending: true });

    if (error) {
      console.error('Failed to fetch pengurus:', error.message);
      return [];
    }
    return (data || []).map((item) => ({
      ...(item as PengurusItem),
      foto_url: resolveAssetUrl(item.foto_url),
    }));
  }
  return getLocal<PengurusItem[]>(STORAGE_KEYS.PENGURUS, INITIAL_PENGURUS);
}

export async function savePengurusItem(item: PengurusItem): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.id);
    const payload = isUuid ? item : (({ id, ...withoutId }) => withoutId)(item);
    const { error } = await supabase.from('pengurus').upsert(payload);
    if (!error) return true;
    return false;
  }

  const current = getLocal<PengurusItem[]>(STORAGE_KEYS.PENGURUS, INITIAL_PENGURUS);
  const exists = current.some((p) => p.id === item.id);
  const updated = exists ? current.map((p) => (p.id === item.id ? item : p)) : [...current, item];
  setLocal(STORAGE_KEYS.PENGURUS, updated);
  return true;
}

export async function deletePengurusItem(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('pengurus').delete().eq('id', id);
    if (!error) return true;
    return false;
  }

  const current = getLocal<PengurusItem[]>(STORAGE_KEYS.PENGURUS, INITIAL_PENGURUS);
  const updated = current.filter((p) => p.id !== id);
  setLocal(STORAGE_KEYS.PENGURUS, updated);
  return true;
}

// -------------------------------------------------------------
// 5. ADMIN AUTH
// -------------------------------------------------------------
export function getAllowedAdminEmails(): string[] {
  return ADMIN_EMAILS;
}

async function getUserRole(userId: string): Promise<'admin' | 'staff' | 'user' | null> {
  if (!supabase) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error || !profile?.role) return null;
  return profile.role as 'admin' | 'staff' | 'user';
}

export async function loginAdmin(email: string, pass: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase belum dikonfigurasi.' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });

  if (error || !data.user) {
    return { success: false, error: error?.message || 'Email atau kata sandi tidak cocok.' };
  }

  const role = await getUserRole(data.user.id);
  if (role !== 'admin') {
    await supabase.auth.signOut();
    return { success: false, error: 'Akun ini tidak memiliki akses admin.' };
  }

  return { success: true };
}

export async function getAdminSession(): Promise<{ email: string; role: 'admin' | 'user' } | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.email) return null;

  const role = await getUserRole(user.id);
  if (role !== 'admin') return null;

  return { email: user.email, role };
}

export async function logoutAdmin() {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
}

export async function uploadAsset(
  file: File,
  folder: 'pengurus' | 'galeri' | 'dokumen' = 'pengurus'
): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase belum dikonfigurasi' };

  // Buat nama file unik
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  // Dapatkan Public URL
  const { data } = supabase.storage.from(STORAGE_BUCKET_NAME).getPublicUrl(filePath);

  return { success: true, url: data.publicUrl };
}

// -------------------------------------------------------------
// 7. KATALOG INVENTARIS
// -------------------------------------------------------------
export async function fetchInventory(): Promise<InventoryItem[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('inventory').select('*').order('nama', { ascending: true });
    if (error) {
      console.error('Failed to fetch inventory:', error.message);
      return INITIAL_INVENTORY;
    }
    if (data) return data as InventoryItem[];
  }
  return INITIAL_INVENTORY;
}

export async function addInventory(item: Omit<InventoryItem, 'id'>) {
  if (!isSupabaseConfigured || !supabase) return { error: 'Supabase tidak terkonfigurasi' };
  const { data, error } = await supabase.from('inventory').insert([{ ...item }]);
  return { data, error: error?.message };
}

export async function updateInventory(id: string, updates: Partial<InventoryItem>) {
  if (!isSupabaseConfigured || !supabase) return { error: 'Supabase tidak terkonfigurasi' };
  const { error } = await supabase.from('inventory').update(updates).eq('id', id);
  return { error: error?.message };
}

export async function deleteInventory(id: string) {
  if (!isSupabaseConfigured || !supabase) return { error: 'Supabase tidak terkonfigurasi' };
  const { error } = await supabase.from('inventory').delete().eq('id', id);
  return { error: error?.message };
}

// -------------------------------------------------------------
// 8. HALL OF FAME (PRESTASI)
// -------------------------------------------------------------
export async function fetchAchievements(): Promise<AchievementItem[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('achievements').select('*').order('tahun', { ascending: false });
    if (error) {
      console.error('Failed to fetch achievements:', error.message);
      return INITIAL_ACHIEVEMENTS;
    }
    if (data) return data as AchievementItem[];
  }
  return INITIAL_ACHIEVEMENTS;
}

export async function addAchievement(item: Omit<AchievementItem, 'id'>) {
  if (!isSupabaseConfigured || !supabase) return { error: 'Supabase tidak terkonfigurasi' };
  const { data, error } = await supabase.from('achievements').insert([{ ...item }]);
  return { data, error: error?.message };
}

export async function updateAchievement(id: string, updates: Partial<AchievementItem>) {
  if (!isSupabaseConfigured || !supabase) return { error: 'Supabase tidak terkonfigurasi' };
  const { error } = await supabase.from('achievements').update(updates).eq('id', id);
  return { error: error?.message };
}

export async function deleteAchievement(id: string) {
  if (!isSupabaseConfigured || !supabase) return { error: 'Supabase tidak terkonfigurasi' };
  const { error } = await supabase.from('achievements').delete().eq('id', id);
  return { error: error?.message };
}

// -------------------------------------------------------------
// 8. FORM BUILDER
// -------------------------------------------------------------
export async function fetchForms() {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase.from('forms').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Failed to fetch forms:', error.message);
    return [];
  }
  return data || [];
}

export async function fetchFormBySlug(slug: string) {
  if (!isSupabaseConfigured || !supabase) return null;
  const { data, error } = await supabase.from('forms').select('*').eq('slug', slug).single();
  if (error) {
    console.error('Failed to fetch form by slug:', error.message);
    return null;
  }
  return data;
}

export async function addForm(form: any) {
  if (!isSupabaseConfigured || !supabase) return { error: 'Supabase tidak terkonfigurasi' };
  const { data, error } = await supabase.from('forms').insert([form]);
  return { data, error: error?.message };
}

export async function submitFormResponse(formId: string, answers: any) {
  if (!isSupabaseConfigured || !supabase) return { error: 'Supabase tidak terkonfigurasi' };
  const { data, error } = await supabase.from('form_responses').insert([{ form_id: formId, answers }]);
  return { data, error: error?.message };
}

export async function fetchFormResponses(formId: string) {
  if (!isSupabaseConfigured || !supabase) return [];
  const { data, error } = await supabase.from('form_responses').select('*').eq('form_id', formId).order('created_at', { ascending: false });
  if (error) {
    console.error('Failed to fetch responses:', error.message);
    return [];
  }
  return data || [];
}


export async function deleteForm(id: string) {
  if (!isSupabaseConfigured || !supabase) return false;
  const { error } = await supabase.from('forms').delete().eq('id', id);
  if (error) {
    console.error('Failed to delete form:', error.message);
    return false;
  }
  return true;
}


export async function uploadImageToSupabase(file: File): Promise<string | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `headers/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('mikat_images').upload(filePath, file);
    if (uploadError) {
      console.error('Error uploading image:', uploadError.message);
      return null;
    }
    const { data } = supabase.storage.from('mikat_images').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.error('Error:', err);
    return null;
  }
}

