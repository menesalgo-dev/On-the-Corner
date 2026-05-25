/**
 * app/(auth)/signup/page.tsx — Pagina di registrazione.
 * VERSIONE CON BYPASS TEMPORANEO - Salta registrazione per test
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
    
    const supabase = await createClient();

    // === BYPASS TEMPORANEO - Entra direttamente ===
    const testEmail = 'test@on-the-corner.it';
    const testPassword = '12345678';

    // Prova a fare login
    let { error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    // Se non esiste, crealo e poi loggati
    if (error) {
      await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: { username: 'testuser', full_name: 'Test User' },
        },
      });

      // Login dopo la creazione
      await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
    }

    redirect('/'); // Vai direttamente alla home
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-10 flex items-center justify-center">
          <Logo size={56} withWordmark />
        </Link>

        <div className="rounded-3xl border border-zinc-900 bg-zinc-950/60 p-7 shadow-2xl backdrop-blur">
          <h1 className="font-[var(--font-archivo-black)] text-2xl uppercase tracking-tight">
            Modalità Test
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Clicca sul pulsante per entrare direttamente come utente di test.
          </p>

          <form action={signupAction} className="mt-8">
            <button
              type="submit"
              className="w-full rounded-xl bg-[#e8c800] py-4 font-[var(--font-archivo-black)] text-lg uppercase tracking-wider text-black transition hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(232,200,0,0.5)]"
            >
              ENTRA COME TEST USER
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-500">
            (Bypass temporaneo per sviluppo)
          </p>
        </div>

        <p className="mt-8 text-center font-mono text-[10px] uppercase tracking-widest text-zinc-600">
          <Link href="/" className="hover:text-zinc-400">← Torna alla home</Link>
        </p>
      </div>
    </main>
  );
}
