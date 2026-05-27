/**
 * app/chi-siamo/page.tsx
 * Pagina statica informativa.
 */
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { Logo } from '@/components/brand/Logo';

export const metadata = {
  title: 'Chi siamo',
  description: 'On The Corner è l\'aggregatore sportivo italiano premium.',
};

export default function ChiSiamoPage() {
  return (
    <>
      <Header />

      <main className="mx-auto max-w-[800px] px-4 pb-24 pt-6 sm:px-6 sm:pb-12">
        <header className="mb-10 text-center">
          <Logo size={64} />
          <h1
            className="mt-6 text-3xl uppercase tracking-tight sm:text-5xl"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Chi <span className="text-[#e8c800]">Siamo</span>
          </h1>
          <p className="mt-4 text-lg text-zinc-300">
            Lo sport italiano, raccontato meglio.
          </p>
        </header>

        <div className="space-y-10">
          <Section title="La nostra missione">
            <p>
              On The Corner nasce per offrire agli appassionati italiani
              un'unica piattaforma dove trovare notizie sportive da fonti
              affidabili, risultati live e strumenti per gestire le proprie schedine.
            </p>
            <p className="mt-3">
              Niente clickbait, niente popup. Solo lo sport che ami,
              presentato bene.
            </p>
          </Section>

          <Section title="Cosa facciamo">
            <ul className="space-y-2">
              <li>📰 Aggreghiamo notizie da <strong className="text-[#e8c800]">21 fonti</strong> italiane e internazionali</li>
              <li>⚽ Copriamo <strong className="text-[#e8c800]">6 sport principali</strong>: Calcio, Champions, F1, MotoGP, Tennis, NFL</li>
              <li>🔴 Aggiorniamo i feed ogni <strong className="text-[#e8c800]">15 minuti</strong> automaticamente</li>
              <li>⭐ Permettiamo di personalizzare il feed per squadre e atleti seguiti</li>
              <li>🎯 In arrivo: schedine in tempo reale, statistiche avanzate, fantacalcio</li>
            </ul>
          </Section>

          <Section title="Le nostre fonti">
            <p className="mb-3">
              Selezioniamo solo testate giornalistiche affidabili:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                'Gazzetta', 'Corriere Sport', 'Sky Sport', 'Eurosport', 'Tuttosport',
                'Repubblica', 'SportMediaset', 'ANSA', 'Calciomercato.com',
                'FormulaPassion', 'GPone', 'BBC Sport', 'Formula1.com',
                'Marca', 'AS.com', 'UEFA.com', 'ATP Tour', 'NFL.com',
              ].map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-[#1f1f1f] bg-[#141414] px-3 py-1 text-xs text-zinc-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </Section>

          <Section title="Account gratuito">
            <p>
              On The Corner è gratuito e accessibile a tutti.
              Creando un account potrai inoltre:
            </p>
            <ul className="mt-3 space-y-2">
              <li>🟡 Seguire le tue squadre, atleti, leghe preferite</li>
              <li>📑 Salvare le notizie che ti interessano</li>
              <li>📊 Tracciare le tue schedine (in arrivo)</li>
              <li>🏆 Sbloccare statistiche e badge personali</li>
            </ul>
            <div className="mt-6 flex gap-3">
              <Link
                href="/signup"
                className="rounded-xl bg-[#e8c800] px-5 py-2.5 text-sm uppercase tracking-wider text-black transition hover:scale-[1.02]"
                style={{ fontFamily: 'var(--font-archivo-black)' }}
              >
                Crea account
              </Link>
              <Link
                href="/"
                className="rounded-xl border border-[#1f1f1f] px-5 py-2.5 text-sm uppercase tracking-wider text-zinc-300 transition hover:border-[#e8c800]/40 hover:text-[#e8c800]"
                style={{ fontFamily: 'var(--font-archivo-black)' }}
              >
                Vai alla home
              </Link>
            </div>
          </Section>

          <Section title="Tecnologia">
            <p>
              Sito costruito con tecnologie moderne: Next.js 14, React 18,
              Supabase, TypeScript. Hostato su Vercel con CDN globale.
              Aggiornamento news automatico tramite cron job ogni 15 minuti.
            </p>
          </Section>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] p-6 sm:p-8">
      <h2
        className="mb-4 text-lg uppercase tracking-tight text-white sm:text-xl"
        style={{ fontFamily: 'var(--font-archivo-black)' }}
      >
        {title}
      </h2>
      <div className="text-base leading-relaxed text-zinc-300">
        {children}
      </div>
    </section>
  );
}
