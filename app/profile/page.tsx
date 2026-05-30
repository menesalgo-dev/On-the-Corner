/**
 * app/profile/page.tsx — Profilo v1
 *
 * Pagina ibrida:
 *  - Loggato: dashboard con identità, stats, sport preferiti, bookmark, settings
 *  - Non loggato: landing access con CTA Accedi/Inizia
 *
 * Design coerente con redesign-v2.
 */
import Link from 'next/link';
import {
  Home as HomeIcon,
  Bookmark,
  Heart,
  TrendingUp,
  Settings,
  Calendar,
  Mail,
  Newspaper,
  Radio,
  ArrowRight,
  ShieldCheck,
  Bell,
  Lock,
  Sparkles,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { LogoutButton } from '@/components/profile/LogoutButton';
import { createClient } from '@/lib/supabase/server';
import { fetchUserBookmarkHashes } from '@/lib/news';
import { fetchMatchCountsByStatus } from '@/lib/sports/matches';
import { fetchProfileData } from '@/lib/profile/data';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Profilo — On The Corner',
  description: 'Il tuo profilo personale.',
};

interface FavoriteSport {
  id: string;
  label: string;
  emoji: string;
  count: number;
}

interface RecentBookmark {
  id: string;
  hash: string;
  title: string;
  source_name: string | null;
  published_at: string;
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const matchCounts = await fetchMatchCountsByStatus();

  // NON LOGGATO → landing access
  if (!user) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-[700px] px-4 pb-24 pt-8 sm:px-6 sm:pb-12 sm:pt-12">
          <NotLoggedInView />
        </main>
        <Footer />
        <BottomNav liveCount={matchCounts.live} />
      </>
    );
  }

  // LOGGATO → dashboard
  const profileData = await fetchProfileData(user.id, user.created_at ?? '');

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1100px] px-4 pb-24 pt-4 sm:px-6 sm:pb-12 sm:pt-8">
        {/* Breadcrumb */}
        <nav className="mb-3 flex items-center gap-2 text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-zinc-500 transition hover:text-otc-accent"
          >
            <HomeIcon className="h-3.5 w-3.5" />
            Home
          </Link>
          <span className="text-zinc-700">/</span>
          <span
            className="uppercase tracking-widest text-zinc-300"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            Profilo
          </span>
        </nav>

        {/* Titolo */}
        <header className="mb-6">
          <h1
            className="text-3xl uppercase tracking-tight text-white sm:text-5xl"
            style={{ fontFamily: 'var(--font-archivo-black)', letterSpacing: '-0.02em' }}
          >
            Profilo<span className="text-otc-accent">.</span>
          </h1>
          <p
            className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            La tua area personale
          </p>
        </header>

        {/* IDENTITY CARD */}
        <IdentityCard
          email={user.email ?? ''}
          memberDays={profileData.memberDays}
        />

        {/* STATS GRID */}
        <section className="mb-6">
          <SectionHeader
            icon={<TrendingUp className="h-3.5 w-3.5 text-otc-accent" />}
            label="Le tue statistiche"
          />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <StatBox
              icon={<Bookmark className="h-4 w-4" />}
              label="Salvati"
              value={profileData.bookmarkCount}
              href="/bookmarks"
            />
            <StatBox
              icon={<Heart className="h-4 w-4" />}
              label="Sport"
              value={profileData.favoriteSports.length}
            />
            <StatBox
              icon={<Newspaper className="h-4 w-4" />}
              label="Letti"
              value={profileData.bookmarkCount}
              subtitle="circa"
            />
            <StatBox
              icon={<Calendar className="h-4 w-4" />}
              label="Giorni"
              value={profileData.memberDays}
              subtitle="iscritto"
            />
          </div>
        </section>

        {/* SPORT PREFERITI */}
        {profileData.favoriteSports.length > 0 && (
          <section className="mb-6">
            <SectionHeader
              icon={<Heart className="h-3.5 w-3.5 text-otc-accent" />}
              label="Sport preferiti"
            />
            <div className="flex flex-wrap gap-2">
              {profileData.favoriteSports.map((sport: FavoriteSport) => (
                <Link
                  key={sport.id}
                  href={`/news?category=${sport.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-otc-line bg-otc-surface px-4 py-2 transition hover:border-otc-accent/40 hover:bg-otc-surface/80"
                >
                  <span className="text-lg">{sport.emoji}</span>
                  <span
                    className="text-xs uppercase tracking-wider text-zinc-300"
                    style={{ fontFamily: 'var(--font-dm-mono)' }}
                  >
                    {sport.label}
                  </span>
                  <span
                    className="text-[10px] text-zinc-600"
                    style={{ fontFamily: 'var(--font-dm-mono)' }}
                  >
                    {sport.count}
                  </span>
                </Link>
              ))}
            </div>
            <p
              className="mt-2 text-[10px] uppercase tracking-widest text-zinc-600"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              Basati sulle notizie che hai salvato
            </p>
          </section>
        )}

        {/* BOOKMARK RECENTI */}
        {profileData.recentBookmarks.length > 0 && (
          <section className="mb-6">
            <SectionHeader
              icon={<Bookmark className="h-3.5 w-3.5 text-otc-accent" />}
              label="Bookmark recenti"
              cta={{ href: '/bookmarks', label: 'Tutti' }}
            />
            <div className="divide-y divide-otc-line overflow-hidden rounded-2xl border border-otc-line bg-otc-surface">
              {profileData.recentBookmarks.slice(0, 3).map((bk: RecentBookmark) => (
                <Link
                  key={bk.id}
                  href={`/news/${bk.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition hover:bg-otc-bg/40"
                >
                  <Bookmark className="h-4 w-4 shrink-0 text-otc-accent" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm text-white">{bk.title}</p>
                    <p
                      className="text-[10px] uppercase tracking-widest text-zinc-500"
                      style={{ fontFamily: 'var(--font-dm-mono)' }}
                    >
                      {bk.source_name ?? 'Sport'}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-zinc-600" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* QUICK ACTIONS */}
        <section className="mb-6">
          <SectionHeader
            icon={<Sparkles className="h-3.5 w-3.5 text-otc-accent" />}
            label="Esplora"
          />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            <QuickAction icon={<Newspaper className="h-5 w-5" />} label="Notizie" href="/news" />
            <QuickAction icon={<Radio className="h-5 w-5" />} label="Live" href="/live" />
            <QuickAction icon={<Bookmark className="h-5 w-5" />} label="Salvati" href="/bookmarks" />
            <QuickAction icon={<Calendar className="h-5 w-5" />} label="Schedine" href="/schedine" />
          </div>
        </section>

        {/* SETTINGS */}
        <section className="mb-6">
          <SectionHeader
            icon={<Settings className="h-3.5 w-3.5 text-otc-accent" />}
            label="Impostazioni"
          />
          <div className="divide-y divide-otc-line overflow-hidden rounded-2xl border border-otc-line bg-otc-surface">
            <SettingsLink
              icon={<Bell className="h-4 w-4" />}
              label="Notifiche email"
              description="Aggiornamenti su sport preferiti"
              href="/settings/notifications"
            />
            <SettingsLink
              icon={<Lock className="h-4 w-4" />}
              label="Cambia password"
              description="Aggiorna le credenziali"
              href="/settings/password"
            />
            <SettingsLink
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Privacy"
              description="Gestisci i tuoi dati"
              href="/settings/privacy"
            />
          </div>
        </section>

        {/* LOGOUT */}
        <LogoutButton />

        <p
          className="mt-6 text-center text-[10px] uppercase tracking-[0.2em] text-zinc-600"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          Account creato il {formatDate(user.created_at ?? '')}
        </p>
      </main>
      <Footer />
      <BottomNav liveCount={matchCounts.live} />
    </>
  );
}

/* ============================================================
 * Not logged in landing
 * ============================================================ */
function NotLoggedInView() {
  return (
    <>
      <div className="text-center">
        <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-otc-accent/10">
          <Lock className="h-7 w-7 text-otc-accent" />
        </div>
        <h1
          className="text-3xl uppercase tracking-tight text-white sm:text-5xl"
          style={{ fontFamily: 'var(--font-archivo-black)', letterSpacing: '-0.02em' }}
        >
          Accedi<span className="text-otc-accent">.</span>
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400">
          Crea un account gratuito per salvare notizie, seguire i tuoi sport, giocare schedine e altro ancora.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/signup"
          className="flex flex-col items-center gap-2 rounded-2xl bg-otc-accent p-6 text-black transition hover:scale-[1.02]"
        >
          <Sparkles className="h-6 w-6" />
          <span
            className="text-base uppercase tracking-tight"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Crea account
          </span>
          <span className="text-xs opacity-70">Gratis · 30 secondi</span>
        </Link>
        <Link
          href="/login"
          className="flex flex-col items-center gap-2 rounded-2xl border border-otc-line bg-otc-surface p-6 text-white transition hover:border-otc-accent/40"
        >
          <Mail className="h-6 w-6 text-otc-accent" />
          <span
            className="text-base uppercase tracking-tight"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Accedi
          </span>
          <span className="text-xs text-zinc-500">Hai già un account?</span>
        </Link>
      </div>

      <div className="mt-10">
        <p
          className="mb-4 text-center text-[10px] uppercase tracking-[0.2em] text-zinc-500"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          Cosa puoi fare con un account
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Benefit icon={<Bookmark className="h-5 w-5" />} title="Salva notizie" description="Crea un archivio personale" />
          <Benefit icon={<Heart className="h-5 w-5" />} title="Sport preferiti" description="Segui le categorie che ami" />
          <Benefit icon={<Calendar className="h-5 w-5" />} title="Schedine" description="Pronostici sportivi" />
          <Benefit icon={<TrendingUp className="h-5 w-5" />} title="Statistiche" description="La tua attività" />
        </div>
      </div>

      <p
        className="mt-8 text-center text-[10px] uppercase tracking-[0.2em] text-zinc-600"
        style={{ fontFamily: 'var(--font-dm-mono)' }}
      >
        Registrazione gratuita · Nessuna carta richiesta
      </p>
    </>
  );
}

/* ============================================================
 * COMPONENTI
 * ============================================================ */

function IdentityCard({ email, memberDays }: { email: string; memberDays: number }) {
  const initials = getInitials(email);
  const username = email.split('@')[0] ?? '';

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-otc-line bg-gradient-to-br from-otc-surface to-otc-bg">
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-otc-accent/20 sm:h-20 sm:w-20">
            <span
              className="text-xl uppercase text-otc-accent sm:text-2xl"
              style={{ fontFamily: 'var(--font-archivo-black)' }}
            >
              {initials}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-[10px] uppercase tracking-[0.2em] text-otc-accent"
              style={{ fontFamily: 'var(--font-dm-mono)' }}
            >
              Membro da {memberDays} giorni
            </p>
            <h2
              className="mt-1 truncate text-xl uppercase tracking-tight text-white sm:text-2xl"
              style={{ fontFamily: 'var(--font-archivo-black)' }}
            >
              {username}
            </h2>
            <p className="mt-0.5 truncate text-xs text-zinc-500">{email}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatBox({
  icon, label, value, subtitle, href,
}: { icon: React.ReactNode; label: string; value: number; subtitle?: string; href?: string }) {
  const content = (
    <>
      <div className="mb-1 text-otc-accent">{icon}</div>
      <p
        className="text-2xl text-white"
        style={{ fontFamily: 'var(--font-archivo-black)' }}
      >
        {value}
      </p>
      <p
        className="text-[10px] uppercase tracking-widest text-zinc-500"
        style={{ fontFamily: 'var(--font-dm-mono)' }}
      >
        {label}
      </p>
      {subtitle && (
        <p
          className="text-[9px] uppercase tracking-widest text-zinc-700"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          {subtitle}
        </p>
      )}
    </>
  );

  const className = "flex flex-col items-start rounded-2xl border border-otc-line bg-otc-surface p-3 transition hover:border-otc-accent/40 sm:p-4";

  return href ? (
    <Link href={href} className={className}>{content}</Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

function QuickAction({
  icon, label, href,
}: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-otc-line bg-otc-surface p-4 transition hover:border-otc-accent/40 hover:bg-otc-surface/80"
    >
      <div className="text-zinc-400 transition group-hover:scale-110 group-hover:text-otc-accent">
        {icon}
      </div>
      <span
        className="text-[10px] uppercase tracking-widest text-zinc-400 group-hover:text-otc-accent"
        style={{ fontFamily: 'var(--font-dm-mono)' }}
      >
        {label}
      </span>
    </Link>
  );
}

function SettingsLink({
  icon, label, description, href,
}: { icon: React.ReactNode; label: string; description: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 transition hover:bg-otc-bg/40 sm:px-5 sm:py-4"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-otc-accent/10 text-otc-accent">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white">{label}</p>
        <p className="text-[11px] text-zinc-500">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-zinc-600" />
    </Link>
  );
}

function Benefit({
  icon, title, description,
}: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-otc-line bg-otc-surface p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-otc-accent/10 text-otc-accent">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="text-sm uppercase tracking-tight text-white"
          style={{ fontFamily: 'var(--font-archivo-black)' }}
        >
          {title}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
      </div>
    </div>
  );
}

function SectionHeader({
  icon, label, cta,
}: { icon?: React.ReactNode; label: string; cta?: { href: string; label: string } }) {
  return (
    <header className="mb-3 flex items-baseline justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <h2
          className="text-xs uppercase tracking-[0.2em] text-white"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          {label}
        </h2>
      </div>
      {cta && (
        <Link
          href={cta.href}
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-zinc-500 transition hover:text-otc-accent"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          {cta.label} <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </header>
  );
}

/* UTILS */
function getInitials(email: string): string {
  if (!email) return '?';
  const name = email.split('@')[0] ?? '';
  return name.slice(0, 2).toUpperCase();
}

function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}
