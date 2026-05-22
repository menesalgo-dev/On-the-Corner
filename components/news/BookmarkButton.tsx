/**
 * components/news/BookmarkButton.tsx
 * Bookmark con optimistic UI + toast. Funziona solo se loggato.
 */
'use client';

import { useState, useTransition } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { toggleBookmark } from '@/server/actions/bookmarks';
import { cn } from '@/lib/utils';

interface Props {
  newsId: string;
  initialBookmarked: boolean;
  variant?: 'inline' | 'floating';
}

export function BookmarkButton({ newsId, initialBookmarked, variant = 'inline' }: Props) {
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic flip
    const next = !bookmarked;
    setBookmarked(next);

    startTransition(async () => {
      const result = await toggleBookmark(newsId);

      if (!result.ok) {
        // Rollback
        setBookmarked(!next);
        if (result.error === 'not_authenticated') {
          toast.error('Devi accedere per salvare le notizie.', {
            action: { label: 'Accedi', onClick: () => router.push('/login') },
          });
        } else {
          toast.error('Errore nel salvataggio.');
        }
        return;
      }

      toast.success(next ? 'Notizia salvata' : 'Notizia rimossa', { duration: 1500 });
    });
  }

  const Icon = bookmarked ? BookmarkCheck : Bookmark;

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={bookmarked ? 'Rimuovi dai preferiti' : 'Salva'}
      className={cn(
        'transition disabled:opacity-50',
        variant === 'floating'
          ? 'rounded-full bg-otc-bg/70 p-2 backdrop-blur hover:bg-otc-accent hover:text-black'
          : 'rounded-md p-1.5 hover:bg-otc-surface-2',
        bookmarked
          ? 'text-otc-accent'
          : variant === 'floating'
            ? 'text-white'
            : 'text-otc-text-3 hover:text-otc-accent',
      )}
    >
      <Icon className="h-4 w-4" strokeWidth={bookmarked ? 2.5 : 2} />
    </button>
  );
}
