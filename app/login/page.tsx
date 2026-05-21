/**
 * app/(auth)/login/page.tsx — Pagina di login.
 * Email/password + OAuth Google. Server Action per il submit.
 */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { Logo } from '@/components/brand/Logo';
import { createClient } from '@/lib/supabase/server';

interface PageProps {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const redirectTo = params.redirect ?? '/';

  // ─── Server Action: login email/password ───
  async function loginAction(formData: FormData) {
    'use server';

    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    if (!email || !password) {
      redirect('/login?error=campi_mancanti');
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      redirect(`/login?error=${encodeURIComponent('credenziali_errate')}`);
    }
    redirect(redirectTo);
  }

  // ─── Server Action: login Google ───
  async function googleAction() {
    'use server';

    const hdrs = await headers();
    const host = hdrs.get('host')!;
    const proto = hdrs.get('x-forwarded-proto') ?? 'https';
    const origin = `${proto}://${host}`;

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (error || !data.url) redirect('/login?error=google_failed');
    redirect(data.url);
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-10 flex items-center justify-center">
          <Logo size={56} withWordmark />
        </Link>

        <div className="rounded-3xl border border-zinc-900 bg-zinc-950/60 p-7 shadow-2xl backdrop-blur">
          <h1 className="font-[var(--font-archivo-black)] text-2xl uppercase tracking-tight">
            Bentornato
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Accedi per seguire le tue squadre e gestire le schedine.
          </p>

          {params.error && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
              {params.error === 'credenziali_errate'
                ? 'Email o password non corrette.'
                : params.error === 'campi_mancanti'
                  ? 'Compila tutti i campi.'
                  : 'Errore di accesso. Riprova.'}
            </div>
          )}

          <form action={loginAction} className="mt-6 space-y-4">
            <Field label="Email" name="email" type="email" placeholder="tu@esempio.it" autoComplete="email" required />
            <Field label="Password" name="password" type="password" autoComplete="current-password" required />

            <button
              type="submit"
              className="w-full rounded-xl bg-[#e8c800] py-3 font-[var(--font-archivo-black)] text-sm uppercase tracking-wider text-black transition hover:scale-[1.01] hover:shadow-[0_0_36px_rgba(232,200,0,0.45)]"
            >
              Accedi
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">o continua con</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <form action={googleAction}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 py-3 text-sm font-semibold transition hover:border-zinc-700 hover:bg-zinc-800"
            >
              <GoogleIcon /> Continua con Google
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-zinc-400">
            Non hai un account?{' '}
            <Link href="/signup" className="font-semibold text-[#e8c800] hover:underline">
              Registrati
            </Link>
          </p>
        </div>

        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          <Link href="/" className="hover:text-zinc-400">← Torna alla home</Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  label, name, type = 'text', ...rest
}: { label: string; name: string; type?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
        {label}
      </span>
      <input
        name={name}
        type={type}
        {...rest}
        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-[#e8c800] focus:ring-2 focus:ring-[#e8c800]/20"
      />
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"/>
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z"/>
      <path fill="#FBBC05" d="M5.4 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.6.4-2.4V6.5H1.4A12 12 0 0 0 0 12c0 1.9.5 3.8 1.4 5.5l4-3.1z"/>
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 12 0 12 12 0 0 0 1.4 6.5l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"/>
    </svg>
  );
}
