/**
 * components/layout/Ticker.tsx
 * Barra scorrevole Premium Minimal con i titoli delle ultime notizie.
 * Allineata con la palette otc, navigazione interna ad Hash e scorrimento asincrono.
 */
import React from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';

interface TickerItem {
  id: string; // Rappresenta l'hash univoco della notizia
  title: string;
  link: string;
  source_name: string;
}

export function Ticker({ items = [] }: { items: TickerItem[] }) {
  if (!items || items.length === 0) return null;

  // Selezione dei primi 14 record in evidenza come da configurazione del team
  const slice = items.slice(0, 14);

  return (
    <div className="relative overflow-hidden border-b border-otc-line bg-[#050507] text-zinc-200">
      {/* Badge di Intestazione Ticker - Miniaturizzato e Nero Opaco */}
      <div className="absolute left-0 top-0 z-10 flex h-full items-center gap-1.5 bg-otc-surface border-r border-otc-line px-4 text-otc-accent">
        <Zap className="h-3 w-3" fill="currentColor" />
        <span 
          className="text-[9px] font-black uppercase tracking-widest" 
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Ticker
        </span>
      </div>

      {/* Rullo ad Animazione Seamless (Keyframe ticker-scroll nativo in app/globals.css) */}
      <div className="relative h-9 overflow-hidden pl-[105px]">
        <div 
          className="flex w-max group hover:[animation-play-state:paused]" 
          style={{ animation: 'ticker-scroll 80s linear infinite' }}
        >
          {[0, 1].map((dup) => (
            <div key={dup} className="flex flex-shrink-0" aria-hidden={dup === 1}>
              {slice.map((it) => (
                <Link
                  key={`${dup}-${it.id}`}
                  /* CORREZIONE: Punta al dettaglio interno /news/[hash] senza uscire dall'aggregatore */
                  href={`/news/${it.id}`}
                  prefetch={false}
                  className="inline-flex h-9 items-center gap-2.5 whitespace-nowrap px-6 transition-colors hover:text-otc-accent"
                >
                  <span 
                    className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 font-bold" 
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {it.source_name}
                  </span>
                  <span className="text-xs font-medium tracking-tight text-zinc-300">
                    {it.title}
                  </span>
                  <span className="text-zinc-700 font-mono">•</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
