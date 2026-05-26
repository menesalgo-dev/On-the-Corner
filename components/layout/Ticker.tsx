/**
 * components/layout/Ticker.tsx
 * Barra gialla scorrevole con i titoli delle ultime 14 notizie.
 * Pausa on-hover, loop seamless.
 */
import Link from 'next/link';
import { Zap } from 'lucide-react';

interface TickerItem {
  id: string;
  title: string;
  link: string;
  source_name: string;
}

export function Ticker({ items }: { items: TickerItem[] }) {
  if (items.length === 0) return null;

  const slice = items.slice(0, 14);

  return (
    <div className="relative overflow-hidden border-b border-[#1f1f1f] bg-[#e8c800] text-black">
      <div className="absolute left-0 top-0 z-10 flex h-full items-center gap-1.5 bg-black px-3 text-[#e8c800]">
        <Zap className="h-3.5 w-3.5" fill="currentColor" />
        <span className="text-[10px] uppercase tracking-widest" style={{ fontFamily: 'var(--font-archivo-black)' }}>
          Ticker
        </span>
      </div>

      <div className="relative h-9 overflow-hidden pl-[110px]">
        <div className="flex w-max" style={{ animation: 'ticker-scroll 80s linear infinite' }}>
          {[0, 1].map((dup) => (
            <div key={dup} className="flex flex-shrink-0" aria-hidden={dup === 1}>
              {slice.map((it) => (
                <Link
                  key={`${dup}-${it.id}`}
                  href={it.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  prefetch={false}
                  className="inline-flex h-9 items-center gap-2.5 whitespace-nowrap px-6 transition-opacity hover:opacity-75"
                >
                  <span className="text-[10px] uppercase tracking-widest opacity-70" style={{ fontFamily: 'var(--font-archivo-black)' }}>
                    {it.source_name}
                  </span>
                  <span className="text-sm font-semibold">{it.title}</span>
                  <span className="opacity-40">·</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
