/**
 * app/(auth)/signup/page.tsx — Pagina di registrazione.
 * Email/password con username opzionale. Trigger SQL crea il profilo automaticamente.
 */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { createClient } from '@/lib/supabase/server';

interface PageProps {
  searchParams: Promise<{ error?: string; sent?: string }>;
}

export default async function SignupPage({ searchParams }: PageProps) {
  const params = await searchParams;

  async function signupAction(formData: FormData) {
    'use server';
    
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    const username = String(formData.get('username') ?? '').trim();

    if (!email || password.length < 8) {
      redirect('/signup?error=password_corta');
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, full_name: username },
        emailRedirectTo: 'https://on-the-corner.vercel.app/auth/callback',
      },
    });

    if (error) {
      redirect(`/signup?error=${encodeURIComponent(error.message)}`);
    }

    redirect('/signup?sent=1');
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-10 flex items-center justify-center">
          <Logo size={56} withWordmark />
        </Link>

        <div className="rounded-3xl border border-zinc-900 bg-zinc-950/60 p-7 shadow-2xl backdrop-blur">
          {params.sent ? (
            <SuccessState />
          ) : (
            <>
              <h1 className="font-[var(--font-archivo-black)] text-2xl uppercase tracking-tight">
                Crea account
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                Inizia a seguire le tue squadre e tracciare le schedine.
              </p>

              {params.error && (
                <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
                  {params.error === 'password_corta'
                    ? 'La password deve avere almeno 8 caratteri.'
                    : decodeURIComponent(params.error)}
                </div>
              )}

              <form action={signupAction} className="mt-6 space-y-4">
                <Field 
                  label="Username" 
                  name="username" 
                  placeholder="es. luca99" 
                  minLength={3} 
                  maxLength={24} 
                  required 
                />
                <Field 
                  label="Email" 
                  name="email" 
                  type="email" 
                  placeholder="tu@esempio.it" 
                  autoComplete="email" 
                  required 
                />
                <Field
                  label="Password (min 8 caratteri)"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#e8c800] py-3 font-[var(--font-archivo-black)] text-sm uppercase tracking-wider text-black transition hover:scale-[1.01] hover:shadow-[0_0_36px_rgba(232,200,0,0.45)]"
                >
                  Crea account
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-zinc-400">
                Hai già un account?{' '}
                <Link href="/login" className="font-semibold text-[#e8c800] hover:underline">
                  Accedi
                </Link>
              </p>
            </>
          )}
        </div>

        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          <Link href="/" className="hover:text-zinc-400">← Torna alla home</Link>
        </p>
      </div>
    </main>
  );
}

function SuccessState() {
  return (
    <div className="text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#e8c800]/15">
        <span className="text-3xl">📧</span>
      </div>
      <h1 className="font-[var(--font-archivo-black)] text-2xl uppercase">Controlla l'email</h1>
      <p className="mt-3 text-sm text-zinc-400">
        Ti abbiamo inviato un link di conferma. Clicca sul link per attivare l'account, poi torna qui per accedere.
      </p>
      <Link
        href="/login"
        className="mt-6 inline-block rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-3 text-sm font-semibold transition hover:border-[#e8c800]/40 hover:text-[#e8c800]"
      >
        Vai al login
      </Link>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  ...rest
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
