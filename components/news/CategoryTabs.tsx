/**
 * components/news/CategoryTabs.tsx
 * Tab orizzontali per filtrare per categoria.
 */
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
    <nav
      className="flex gap-2 overflow-x-auto py-3 scrollbar-hide"
    >
      <Tab
        href={basePath}
        active={!activeId}
        label="Tutto"
      />
      {tabs.map((t) => (
        <Tab
          key={t.id}
          href={`${basePath}?category=${t.id}`}
          active={activeId === t.id}
          label={
            <>
              {t.emoji && <span className="mr-1">{t.emoji}</span>}
              {t.name}
              {t.count !== undefined && t.count > 0 && (
                <span
                  className="ml-1.5 text-[10px] opacity-60"
                  style={{ fontFamily: 'var(--font-dm-mono)' }}
                >
                  {t.count}
                </span>
              )}
            </>
          }
        />
      ))}
    </nav>
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
      className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
        active
          ? 'bg-[#e8c800] text-black'
          : 'border border-[#1f1f1f] bg-[#0d0d0d] text-zinc-400 hover:border-[#e8c800]/40 hover:text-[#e8c800]'
      }`}
    >
      {label}
    </Link>
  );
}
