/**
 * components/shared/EmptyState.tsx
 * Stato vuoto riusabile.
 */
import Link from 'next/link';

interface Props {
  emoji?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ emoji = '📭', title, description, actionLabel, actionHref }: Props) {
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-[#1f1f1f] bg-[#0d0d0d] p-10 text-center">
      <div className="mb-4 text-5xl">{emoji}</div>
      <h2
        className="mb-2 text-xl uppercase text-white"
        style={{ fontFamily: 'var(--font-archivo-black)' }}
      >
        {title}
      </h2>
      {description && <p className="text-sm text-zinc-400">{description}</p>}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-6 inline-block rounded-xl bg-[#e8c800] px-6 py-3 text-sm uppercase tracking-wider text-black transition hover:scale-[1.02]"
          style={{ fontFamily: 'var(--font-archivo-black)' }}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
