/**
 * components/news/CategoryTabs.tsx
 * Barra dei filtri sportivi (Tab di Navigazione Orizzontale Liquida).
 * Estetica Premium Minimal: pulsanti piatti, sottolineatura attiva ed eliminazione scrollbar.
 */
import React from 'react';
import Link from 'next/link';

export interface CategoryTab {
  id: string;
  name: string;
  emoji?: string;
  count?: number;
}

interface Props {
  tabs: CategoryTab[];
  activeId?: string;
  basePath: string;
}

export function CategoryTabs({ tabs, activeId, basePath }: Props) {
  return (
    {/* Slider Orizzontale a Scorrimento Liquido con plugin scrollbar-none inline */}
    <div className="overflow-x-auto scrollbar-none border-b border-otc-line/60 mb-6">
      <nav className="flex gap-1 whitespace-nowrap min-w-max pb-px">
        {/* Tab di controllo globale "Tutto" */}
        <Tab
          href={basePath}
          active={!activeId || activeId === 'tutto'}
          label="Tutti gli Sport"
        />
        
        {/* Generazione dinamica delle discipline sportive del database */}
        {tabs.map((t) => (
          <Tab
            key={t.id}
            href={`${basePath}?category=${t.id}`}
            active={activeId?.toLowerCase() === t.id.toLowerCase()}
            label={
              <span className="inline-flex items-center">
                {/* Il nome dello sport perde l'emoji gigante per un look editoriale pulito */}
                <span>{t.name}</span>
                
                {/* Micro-badge per il contatore dei record se popolato e maggiore di 0 */}
                {t.count !== undefined && t.count > 0 && (
                  <span
                    className="ml-1.5 rounded bg-otc-line px-1.5 py-0.5 font-mono text-[9px] font-bold text-zinc-500 transition-colors group-hover:text-otc-accent"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {t.count}
                  </span>
                )}
              </span>
            }
          />
        ))}
      </nav>
    </div>
  );
}

function Tab({
  href, active, label,
}: {
  href: string;
  active: boolean;
  label: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative px-4 py-2.5 text-xs font-semibold tracking-wider uppercase transition-colors duration-200 -mb-px border-b-2 ${
        active
          ? 'border-otc-accent text-zinc-100 font-bold'
          : 'border-transparent text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {label}
    </Link>
  );
}
