/**
 * components/news/SourceFilter.tsx
 *
 * Filtro fonti collapsibile: di default chiuso con bottone "Filtra per fonte".
 * Apre un pannello con lista fonti hardcoded (in attesa di fetchNewsStats).
 * Non riempie il viewport con chips quando non serve.
 */
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Filter, ChevronDown, X } from 'lucide-react';

// Lista fonti più comuni nel sync news
const TOP_SOURCES = [
  'Gazzetta',
  'Corriere Sport',
  'Sky Sport',
  'Eurosport',
  'Tuttosport',
  'Repubblica Calcio',
  'Repubblica F1',
  'Repubblica Tennis',
  'SportMediaset',
  'ANSA Sport',
  'Calciomercato.com',
  'FormulaPassion',
  'GPone',
  'NewsAPI',
  'GNews',
];

interface Props {
  activeSource?: string;
  activeCategory?: string;
}

export function SourceFilter({ activeSource, activeCategory }: Props) {
  const [open, setOpen] = useState(!!activeSource);

  const buildHref = (source: string | undefined) => {
    const sp = new URLSearchParams();
    if (activeCategory) sp.set('category', activeCategory);
    if (source) sp.set('source', source);
    const qs = sp.toString();
    return qs ? `/news?${qs}` : '/news';
  };

  return (
    <div className="mb-5">
      {/* Toggle bottone */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition sm:w-auto ${
          activeSource
            ? 'border-otc-accent/40 bg-otc-accent/10 text-otc-accent'
            : 'border-otc-line bg-otc-surface text-zinc-400 hover:border-otc-accent/30 hover:text-otc-accent'
        }`}
        style={{ fontFamily: 'var(--font-dm-mono)' }}
      >
        <span className="inline-flex items-center gap-2">
          <Filter className="h-3.5 w-3.5" />
          {activeSource ? `Fonte: ${activeSource}` : 'Filtra per fonte'}
        </span>
        {activeSource ? (
          <Link
            href={buildHref(undefined)}
            aria-label="Rimuovi filtro fonte"
            className="ml-3 inline-flex items-center justify-center rounded-full hover:bg-otc-accent/20"
            onClick={(e) => e.stopPropagation()}
          >
            <X className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <ChevronDown
            className={`ml-3 h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {/* Pannello espanso */}
      {open && !activeSource && (
        <div className="mt-3 rounded-2xl border border-otc-line bg-otc-surface p-3">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
            {TOP_SOURCES.map((source) => (
              <Link
                key={source}
                href={buildHref(source)}
                className="rounded-lg border border-transparent bg-otc-bg px-3 py-2 text-xs text-zinc-400 transition hover:border-otc-accent/30 hover:text-otc-accent"
              >
                {source}
              </Link>
            ))}
          </div>
          <p
            className="mt-3 text-[10px] uppercase tracking-widest text-zinc-600"
            style={{ fontFamily: 'var(--font-dm-mono)' }}
          >
            Click su una fonte per filtrare
          </p>
        </div>
      )}
    </div>
  );
}
