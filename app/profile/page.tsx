/**
 * app/profile/page.tsx
 */
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User, Bookmark, Star, Activity } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/server/actions/auth';

export const metadata = { title: 'Profilo' };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/profile');

  // Conta bookmark
  const { count: bookmarkCount } = await supabase
    .from('news_bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  return (
    <>
      <Header />

      <main className="mx-auto max-w-[900px] px-4 pb-24 pt-6 sm:px-6 sm:pb-12">
        <header className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8c800] text-black">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1
              className="text-2xl uppercase tracking-tight sm:text-3xl"
              style={{ fontFamily: 'var(--font-archivo-black)' }}
            >
              {(user.user_metadata?.display_name as string | undefined) ?? 'Profilo'}
            </h1>
            <p className="text-sm text-zinc-400">{user.email}</p>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatBox icon={Bookmark} label="Salvate" value={bookmarkCount ?? 0} />
          <StatBox icon={Star} label="Seguiti" value={0} />
          <StatBox icon={Activity} label="Schedine" value={0} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ActionCard
            href="/follow"
            title="Personalizza"
            description="Segui le tue squadre e atleti preferiti"
            emoji="⭐"
          />
          <ActionCard
            href="/dashboard"
            title="Dashboard"
            description="Statistiche personali (in arrivo)"
            emoji="📊"
          />
        </div>

        <form action={signOut} className="mt-8">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl border border-[#1f1f1f] bg-[#0d0d0d] px-5 py-3 text-sm uppercase tracking-wider text-zinc-300 transition hover:border-red-500/40 hover:text-red-400"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            <LogOut className="h-4 w-4" />
            Esci
          </button>
        </form>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}

function StatBox({ icon: Icon, label, value }: { icon: typeof User; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] p-4">
      <Icon className="h-5 w-5 text-[#e8c800]" />
      <div
        className="mt-3 text-3xl text-white"
        style={{ fontFamily: 'var(--font-archivo-black)' }}
      >
        {value}
      </div>
      <div
        className="mt-1 text-[10px] uppercase tracking-widest text-zinc-500"
        style={{ fontFamily: 'var(--font-dm-mono)' }}
      >
        {label}
      </div>
    </div>
  );
}

function ActionCard({ href, title, description, emoji }: { href: string; title: string; description: string; emoji: string }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] p-5 transition hover:border-[#e8c800]/40"
    >
      <div className="text-3xl">{emoji}</div>
      <h3
        className="mt-3 text-sm uppercase tracking-tight text-white group-hover:text-[#e8c800]"
        style={{ fontFamily: 'var(--font-archivo-black)' }}
      >
        {title}
      </h3>
      <p className="mt-1 text-xs text-zinc-400">{description}</p>
    </Link>
  );
}
