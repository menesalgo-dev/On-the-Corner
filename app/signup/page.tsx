/**
 * app/signup/page.tsx
 */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { createClient } from '@/lib/supabase/server';
import { SignupForm } from './SignupForm';

export const metadata = {
  title: 'Registrati',
};

export default async function SignupPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect('/');

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex flex-col items-center">
          <Logo size={56} />
          <span
            className="mt-3 text-xl uppercase tracking-tight text-white"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            On The <span className="text-[#e8c800]">Corner</span>
          </span>
        </Link>

        <div className="rounded-3xl border border-[#1f1f1f] bg-[#0d0d0d] p-8">
          <h1
            className="text-2xl uppercase tracking-tight text-white"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Inizia gratis
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Crea un account in 30 secondi.
          </p>

          <SignupForm />

          <p className="mt-6 text-center text-sm text-zinc-400">
            Hai già un account?{' '}
            <Link href="/login" className="font-bold text-[#e8c800] hover:underline">
              Accedi
            </Link>
          </p>
        </div>

        <Link
          href="/"
          className="mt-6 block text-center text-xs uppercase tracking-widest text-zinc-500 hover:text-[#e8c800]"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          ← Torna al sito
        </Link>
      </div>
    </main>
  );
}
