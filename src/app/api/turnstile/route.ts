import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return NextResponse.json(
      { success: false, error: 'Turnstile belum dikonfigurasi di server.' },
      { status: 503 }
    );
  }

  let token = '';
  try {
    const body = await request.json();
    token = typeof body.token === 'string' ? body.token : '';
  } catch {
    return NextResponse.json(
      { success: false, error: 'Token Turnstile tidak valid.' },
      { status: 400 }
    );
  }

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Silakan selesaikan verifikasi keamanan.' },
      { status: 400 }
    );
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  const remoteip = forwardedFor?.split(',')[0]?.trim();
  const formData = new URLSearchParams({ secret, response: token });
  if (remoteip) formData.set('remoteip', remoteip);

  const verificationResponse = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
      cache: 'no-store',
    }
  );

  if (!verificationResponse.ok) {
    return NextResponse.json(
      { success: false, error: 'Layanan verifikasi keamanan tidak tersedia.' },
      { status: 502 }
    );
  }

  const result = await verificationResponse.json();
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: 'Verifikasi keamanan gagal. Silakan coba lagi.' },
      { status: 403 }
    );
  }

  return NextResponse.json({ success: true });
}
