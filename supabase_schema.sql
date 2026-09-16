-- ==========================================================
-- SKEMA DATABASE SUPABASE — MINAT DAN BAKAT BEM FT UNSOED
-- Jalankan kode SQL ini di Menu "SQL Editor" pada dashboard Supabase
-- ==========================================================

-- 1. TABEL PEMINJAMAN ALAT INVENTARIS
CREATE TABLE IF NOT EXISTS peminjaman_alat (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_peminjam TEXT NOT NULL,
  nim TEXT NOT NULL,
  jurusan TEXT NOT NULL,
  nama_alat TEXT NOT NULL,
  jumlah INT DEFAULT 1,
  tanggal_pinjam DATE NOT NULL,
  tanggal_kembali DATE NOT NULL,
  keperluan TEXT NOT NULL,
  no_wa TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'disetujui', 'ditolak', 'selesai')),
  catatan_admin TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TABEL PENGAJUAN DELEGASI LOMBA
CREATE TABLE IF NOT EXISTS delegasi_lomba (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama_ketua TEXT NOT NULL,
  nim TEXT NOT NULL,
  jurusan TEXT NOT NULL,
  nama_lomba TEXT NOT NULL,
  penyelenggara TEXT,
  kategori TEXT NOT NULL CHECK (kategori IN ('berbayar', 'tidak_berbayar')),
  link_berkas TEXT NOT NULL,
  no_wa TEXT NOT NULL,
  status TEXT DEFAULT 'menunggu_review' CHECK (status IN ('menunggu_review', 'diverifikasi', 'ditolak')),
  catatan_admin TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABEL PROGRAM KERJA & AGENDA KERJA
CREATE TABLE IF NOT EXISTS proker (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  nama TEXT NOT NULL,
  subtitle TEXT,
  kategori TEXT NOT NULL CHECK (kategori IN ('proker', 'agenda')),
  deskripsi TEXT NOT NULL,
  chips TEXT[] DEFAULT '{}',
  urutan INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. TABEL PENGURUS & STAF
CREATE TABLE IF NOT EXISTS pengurus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  role TEXT NOT NULL,
  kategori TEXT NOT NULL CHECK (kategori IN ('lead', 'staff', 'internship')),
  foto_url TEXT,
  initials TEXT,
  urutan INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS peminjaman_no_wa_created_at_idx
  ON peminjaman_alat (no_wa, created_at DESC);

CREATE INDEX IF NOT EXISTS peminjaman_status_created_at_idx
  ON peminjaman_alat (status, created_at DESC);

CREATE INDEX IF NOT EXISTS peminjaman_created_at_idx
  ON peminjaman_alat (created_at DESC);

CREATE INDEX IF NOT EXISTS delegasi_no_wa_created_at_idx
  ON delegasi_lomba (no_wa, created_at DESC);

CREATE INDEX IF NOT EXISTS delegasi_status_created_at_idx
  ON delegasi_lomba (status, created_at DESC);

CREATE INDEX IF NOT EXISTS delegasi_created_at_idx
  ON delegasi_lomba (created_at DESC);

CREATE OR REPLACE FUNCTION public.prevent_submission_spam()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
  normalized_phone TEXT := regexp_replace(NEW.no_wa, '[^0-9]', '', 'g');
BEGIN
  IF TG_TABLE_NAME = 'peminjaman_alat' THEN
    SELECT count(*) INTO recent_count
    FROM public.peminjaman_alat
    WHERE regexp_replace(no_wa, '[^0-9]', '', 'g') = normalized_phone
      AND created_at > now() - interval '10 minutes';
  ELSE
    SELECT count(*) INTO recent_count
    FROM public.delegasi_lomba
    WHERE regexp_replace(no_wa, '[^0-9]', '', 'g') = normalized_phone
      AND created_at > now() - interval '10 minutes';
  END IF;

  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'Terlalu banyak pengajuan dari nomor ini. Coba lagi setelah 10 menit.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_peminjaman_spam ON peminjaman_alat;
CREATE TRIGGER prevent_peminjaman_spam
BEFORE INSERT ON peminjaman_alat
FOR EACH ROW EXECUTE FUNCTION public.prevent_submission_spam();

DROP TRIGGER IF EXISTS prevent_delegasi_spam ON delegasi_lomba;
CREATE TRIGGER prevent_delegasi_spam
BEFORE INSERT ON delegasi_lomba
FOR EACH ROW EXECUTE FUNCTION public.prevent_submission_spam();

-- Validasi database sebagai lapisan terakhir setelah validasi frontend
DO $$
BEGIN
  ALTER TABLE peminjaman_alat
    ADD CONSTRAINT peminjaman_jumlah_valid CHECK (jumlah BETWEEN 1 AND 100);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE peminjaman_alat
    ADD CONSTRAINT peminjaman_tanggal_valid CHECK (tanggal_kembali >= tanggal_pinjam);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE peminjaman_alat
    ADD CONSTRAINT peminjaman_nama_terbatas CHECK (char_length(nama_peminjam) <= 120);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE delegasi_lomba
    ADD CONSTRAINT delegasi_nama_terbatas CHECK (char_length(nama_ketua) <= 120);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE delegasi_lomba
    ADD CONSTRAINT delegasi_lomba_terbatas CHECK (char_length(nama_lomba) <= 200);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ----------------------------------------------------------
-- PENGATURAN ROW LEVEL SECURITY (RLS) - SECURE & ROLE BASED
-- ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'staff', 'user')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  table_name TEXT NOT NULL,
  record_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE peminjaman_alat ENABLE ROW LEVEL SECURITY;
ALTER TABLE delegasi_lomba ENABLE ROW LEVEL SECURITY;
ALTER TABLE proker ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengurus ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.log_admin_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND public.is_admin() THEN
    INSERT INTO public.admin_audit_logs (admin_id, action, table_name, record_id, details)
    VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      CASE WHEN TG_OP = 'DELETE' THEN OLD.id ELSE NEW.id END,
      CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END
    );
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS audit_peminjaman_changes ON peminjaman_alat;
CREATE TRIGGER audit_peminjaman_changes
AFTER INSERT OR UPDATE OR DELETE ON peminjaman_alat
FOR EACH ROW EXECUTE FUNCTION public.log_admin_change();

DROP TRIGGER IF EXISTS audit_delegasi_changes ON delegasi_lomba;
CREATE TRIGGER audit_delegasi_changes
AFTER INSERT OR UPDATE OR DELETE ON delegasi_lomba
FOR EACH ROW EXECUTE FUNCTION public.log_admin_change();

DROP TRIGGER IF EXISTS audit_proker_changes ON proker;
CREATE TRIGGER audit_proker_changes
AFTER INSERT OR UPDATE OR DELETE ON proker
FOR EACH ROW EXECUTE FUNCTION public.log_admin_change();

DROP TRIGGER IF EXISTS audit_pengurus_changes ON pengurus;
CREATE TRIGGER audit_pengurus_changes
AFTER INSERT OR UPDATE OR DELETE ON pengurus
FOR EACH ROW EXECUTE FUNCTION public.log_admin_change();

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;

CREATE POLICY "Users can read own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" ON profiles
FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update profiles" ON profiles
FOR UPDATE USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can read audit logs" ON admin_audit_logs;
CREATE POLICY "Admins can read audit logs" ON admin_audit_logs
FOR SELECT USING (public.is_admin());

-- Profile auto seed untuk admin yang terdaftar di env
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER AS $$
DECLARE
  admin_emails TEXT[] := ARRAY['kementerianmikatbemft2026@gmail.com'];
  email_lower TEXT;
BEGIN
  email_lower := lower(NEW.email);

  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE
      WHEN email_lower = ANY (ARRAY(SELECT lower(trim(value)) FROM unnest(admin_emails) AS value WHERE trim(value) <> '')) THEN 'admin'
      ELSE 'user'
    END
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_profile();

-- Backfill admin yang sudah dibuat sebelum trigger dipasang
INSERT INTO public.profiles (id, email, role)
SELECT id, lower(email), 'admin'
FROM auth.users
WHERE lower(email) = 'kementerianmikatbemft2026@gmail.com'
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    role = 'admin';

-- 1. Policies untuk peminjaman_alat (public form submission only)
DROP POLICY IF EXISTS "Public read peminjaman" ON peminjaman_alat;
DROP POLICY IF EXISTS "Public insert peminjaman" ON peminjaman_alat;
DROP POLICY IF EXISTS "Admins read peminjaman" ON peminjaman_alat;
DROP POLICY IF EXISTS "Admins update peminjaman" ON peminjaman_alat;
DROP POLICY IF EXISTS "Admins delete peminjaman" ON peminjaman_alat;

CREATE POLICY "Public insert peminjaman" ON peminjaman_alat FOR INSERT WITH CHECK (
  status = 'pending'
  AND catatan_admin IS NULL
);
CREATE POLICY "Admins read peminjaman" ON peminjaman_alat FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins update peminjaman" ON peminjaman_alat FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete peminjaman" ON peminjaman_alat FOR DELETE USING (public.is_admin());

-- 2. Policies untuk delegasi_lomba
DROP POLICY IF EXISTS "Public read delegasi" ON delegasi_lomba;
DROP POLICY IF EXISTS "Public insert delegasi" ON delegasi_lomba;
DROP POLICY IF EXISTS "Admins read delegasi" ON delegasi_lomba;
DROP POLICY IF EXISTS "Admins update delegasi" ON delegasi_lomba;
DROP POLICY IF EXISTS "Admins delete delegasi" ON delegasi_lomba;

CREATE POLICY "Public insert delegasi" ON delegasi_lomba FOR INSERT WITH CHECK (
  status = 'menunggu_review'
  AND catatan_admin IS NULL
);
CREATE POLICY "Admins read delegasi" ON delegasi_lomba FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins update delegasi" ON delegasi_lomba FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins delete delegasi" ON delegasi_lomba FOR DELETE USING (public.is_admin());

-- 3. Policies untuk proker
DROP POLICY IF EXISTS "Public read proker" ON proker;
DROP POLICY IF EXISTS "Public write proker" ON proker;
DROP POLICY IF EXISTS "Public all proker" ON proker;
DROP POLICY IF EXISTS "Admins write proker" ON proker;

CREATE POLICY "Public read proker" ON proker FOR SELECT USING (true);
CREATE POLICY "Admins write proker" ON proker FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. Policies untuk pengurus
DROP POLICY IF EXISTS "Public read pengurus" ON pengurus;
DROP POLICY IF EXISTS "Public write pengurus" ON pengurus;
DROP POLICY IF EXISTS "Public all pengurus" ON pengurus;
DROP POLICY IF EXISTS "Admins write pengurus" ON pengurus;

CREATE POLICY "Public read pengurus" ON pengurus FOR SELECT USING (true);
CREATE POLICY "Admins write pengurus" ON pengurus FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. Storage policies: public read, admin-only upload/update/delete
DROP POLICY IF EXISTS "Public Read Access mikat-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow Upload to mikat-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow Update mikat-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow Delete mikat-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload to mikat-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update mikat-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete mikat-assets" ON storage.objects;

CREATE POLICY "Public Read Access mikat-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'mikat-assets');

CREATE POLICY "Admin Upload to mikat-assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'mikat-assets'
  AND public.is_admin()
);

CREATE POLICY "Admin Update mikat-assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'mikat-assets'
  AND public.is_admin()
);

CREATE POLICY "Admin Delete mikat-assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'mikat-assets'
  AND public.is_admin()
);

