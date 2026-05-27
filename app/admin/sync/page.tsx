/**
 * app/admin/sync/page.tsx
 * Pannello admin per monitorare il sync.
 * Mostra ultimo stato, conta news per fonte, errori.
 */
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin Sync' };

export default async function AdminSyncPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/admin/sync');

  // Conta news totali
  const { count: total } = await supabase
    .from('news_items')
    .select('*', { count: 'exact', head: true });

  // News per fonte (ultime 1000)
  const { data: bySource } = await supabase
    .from('news_items')
    .select('source_id, source_name, published_at')
    .order('published_at', { ascending: false })
    .limit(1000);

  // News per categoria
  const { data: byCategory } = await supabase
    .from('news_items')
    .select('category_id')
    .gte('published_at', new Date(Date.now() - 86_400_000).toISOString());

  const sourceMap = new Map<string, { name: string; count: number; latest: string }>();
  (bySource ?? []).forEach((r: { source_id: unknown; source_name: unknown; published_at: unknown }) => {
    const key = String(r.source_id ?? '');
    if (!key) return;
    const existing = sourceMap.get(key) ?? { name: String(r.source_name ?? ''), count: 0, latest: '' };
    existing.count += 1;
    const ts = String(r.published_at ?? '');
    if (ts > existing.latest) existing.latest = ts;
    sourceMap.set(key, existing);
  });
  const sources = Array.from(sourceMap, ([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.count - a.count);

  const catMap = new Map<string, number>();
  (byCategory ?? []).forEach((r: { category_id: unknown }) => {
    const k = String(r.category_id ?? 'unknown');
    catMap.set(k, (catMap.get(k) ?? 0) + 1);
  });

  // Ultima notizia inserita
  const { data: latestItems } = await supabase
    .from('news_items')
    .select('title, source_name, published_at')
    .order('published_at', { ascending: false })
    .limit(5);

  return (
    <>
      <Header />

      <main className="mx-auto max-w-[1100px] px-4 pb-24 pt-6 sm:px-6 sm:pb-12">
        <header className="mb-6">
          <h1
            className="text-2xl uppercase tracking-tight sm:text-3xl"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Admin <span className="text-[#e8c800]">Sync</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Monitora il sync delle notizie.
          </p>
        </header>

        {/* Stats top */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="News totali" value={total ?? 0} />
          <Stat label="Fonti attive" value={sources.length} />
          <Stat label="Categorie" value={catMap.size} />
          <Stat label="Ultime 24h" value={byCategory?.length ?? 0} />
        </div>

        <div className="mt-6 rounded-2xl border border-[#e8c800]/30 bg-[#e8c800]/5 p-5">
          <h2
            className="text-sm uppercase tracking-tight text-[#e8c800]"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Forza sync manuale
          </h2>
          <p className="mt-2 text-xs text-zinc-300">
            Per forzare un sync immediato, apri questa URL nel browser:
          </p>
          <code className="mt-2 block break-all rounded-lg bg-black/40 p-3 text-xs text-[#e8c800]">
            /api/sync-news/run?secret=&lt;TUO_CRON_SECRET&gt;
          </code>
          <p className="mt-2 text-xs text-zinc-500">
            Sostituisci <code>&lt;TUO_CRON_SECRET&gt;</code> col valore dell&apos;env variable CRON_SECRET.
          </p>
        </div>

        {/* Per categoria */}
        <section className="mt-6 rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] p-5">
          <h2
            className="mb-4 text-sm uppercase tracking-tight text-white"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Per <span className="text-[#e8c800]">categoria</span> (ultime 24h)
          </h2>
          <div className="flex flex-wrap gap-2">
            {[...catMap.entries()].sort((a, b) => b[1] - a[1]).map(([cat, n]) => (
              <span
                key={cat}
                className="rounded-full border border-[#1f1f1f] bg-[#141414] px-3 py-1 text-xs"
              >
                <span className="text-zinc-300">{cat}</span>{' '}
                <span className="text-[#e8c800]" style={{ fontFamily: 'var(--font-dm-mono)' }}>{n}</span>
              </span>
            ))}
          </div>
        </section>

        {/* Per fonte */}
        <section className="mt-6 rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] p-5">
          <h2
            className="mb-4 text-sm uppercase tracking-tight text-white"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Per <span className="text-[#e8c800]">fonte</span>
          </h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1f1f1f] text-left text-[10px] uppercase tracking-widest text-zinc-500">
                <th className="py-2 font-normal">Fonte</th>
                <th className="py-2 text-right font-normal">News</th>
                <th className="hidden py-2 text-right font-normal sm:table-cell">Ultima</th>
              </tr>
            </thead>
            <tbody>
              {sources.slice(0, 30).map((s) => (
                <tr key={s.id} className="border-b border-[#1f1f1f] text-sm last:border-0">
                  <td className="py-2 text-white">{s.name}</td>
                  <td className="py-2 text-right text-zinc-400" style={{ fontFamily: 'var(--font-dm-mono)' }}>{s.count}</td>
                  <td className="hidden py-2 text-right text-xs text-zinc-500 sm:table-cell" style={{ fontFamily: 'var(--font-dm-mono)' }}>
                    {s.latest ? new Date(s.latest).toLocaleString('it-IT') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Ultime news */}
        <section className="mt-6 rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] p-5">
          <h2
            className="mb-4 text-sm uppercase tracking-tight text-white"
            style={{ fontFamily: 'var(--font-archivo-black)' }}
          >
            Ultime <span className="text-[#e8c800]">5 notizie</span>
          </h2>
          <ul className="space-y-3">
            {(latestItems ?? []).map((n: { title: unknown; source_name: unknown; published_at: unknown }, i: number) => (
              <li key={i} className="text-sm">
                <span className="text-[10px] uppercase tracking-widest text-[#e8c800]" style={{ fontFamily: 'var(--font-dm-mono)' }}>
                  {String(n.source_name ?? '')}
                </span>{' '}
                <span className="text-zinc-300">{String(n.title ?? '')}</span>
                <div className="text-[10px] text-zinc-600" style={{ fontFamily: 'var(--font-dm-mono)' }}>
                  {n.published_at ? new Date(String(n.published_at)).toLocaleString('it-IT') : '—'}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <Link
          href="/"
          className="mt-8 inline-block text-xs uppercase tracking-widest text-zinc-500 hover:text-[#e8c800]"
          style={{ fontFamily: 'var(--font-dm-mono)' }}
        >
          ← Torna alla home
        </Link>
      </main>

      <Footer />
      <BottomNav />
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#1f1f1f] bg-[#0d0d0d] p-4">
      <div
        className="text-3xl text-white"
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
