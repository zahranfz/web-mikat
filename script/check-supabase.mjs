import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(__filename), '..');
const envPath = path.join(rootDir, '.env.local');

function loadEnv() {
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local tidak ditemukan.');
  }

  const env = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    env[trimmed.slice(0, separator).trim()] = trimmed.slice(separator + 1).trim();
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = 'kementerianmikatbemft2026@gmail.com';
const requiredTables = ['profiles', 'peminjaman_alat', 'delegasi_lomba', 'proker', 'pengurus'];

if (!url || !serviceRoleKey || serviceRoleKey === 'replace-with-a-new-service-role-key') {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY belum siap.');
}

const supabase = createClient(url, serviceRoleKey);
let failed = false;

async function check(label, callback) {
  try {
    const result = await callback();
    console.log(`OK  ${label}${result ? `: ${result}` : ''}`);
  } catch (error) {
    failed = true;
    console.error(`ERR ${label}: ${error.message}`);
  }
}

for (const table of requiredTables) {
  await check(`table ${table}`, async () => {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return `${count ?? 0} row(s)`;
  });
}

await check('bucket mikat-assets', async () => {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) throw error;
  const bucket = data.find((item) => item.name === 'mikat-assets');
  if (!bucket) throw new Error('bucket tidak ditemukan');
  return bucket.public ? 'public' : 'private';
});

await check('admin auth user', async () => {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  const user = data.users.find((item) => item.email?.toLowerCase() === adminEmail);
  if (!user) throw new Error(`${adminEmail} tidak ditemukan`);
  return user.id;
});

await check('admin profile', async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('email', adminEmail)
    .maybeSingle();
  if (error) throw error;
  if (!data || data.role !== 'admin') throw new Error('profile admin tidak ditemukan atau role bukan admin');
  return 'role=admin';
});

if (failed) {
  console.error('\nSupabase belum siap sepenuhnya.');
  process.exit(1);
}

console.log('\nSupabase backend siap digunakan.');
