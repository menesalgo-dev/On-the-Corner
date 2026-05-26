/**
 * components/news/BookmarkButton.tsx
 * Bottone bookmark con optimistic UI + toast.
 */
'use client';

import { useState, useTransition } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { toggleBookmark } from '@/server/actions/bookmarks';

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

    const next = !bookmarked;
    setBookmarked(next);

    startTransition(async () => {
      const result = await toggleBookmark(newsId);
      if (!result.ok) {
        setBookmarked(!next);
        if (result.error === 'not_authenticated') {
          toast.error('Accedi per salvare le notizie.', {
            action: { label: 'Login', onClick: () => router.push('/login') },
          });
        } else {
          toast.error('Errore.');
        }
        return;
      }
      toast.success(next ? 'Salvata' : 'Rimossa', { duration: 1200 });
    });
  }

  const Icon = bookmarked ? BookmarkCheck : Bookmark;

  if (variant === 'floating') {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        aria-label={bookmarked ? 'Rimuovi' : 'Salva'}
        className={`rounded-full bg-black/70 p-2 backdrop-blur transition disabled:opacity-50 ${
          bookmarked ? 'text-[#e8c800]' : 'text-white hover:bg-[#e8c800] hover:text-black'
        }`}
      >
        <Icon className="h-4 w-4" strokeWidth={bookmarked ? 2.5 : 2} />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={bookmarked ? 'Rimuovi' : 'Salva'}
      className={`rounded-md p-1.5 transition disabled:opacity-50 ${
        bookmarked ? 'text-[#e8c800]' : 'text-zinc-500 hover:bg-[#141414] hover:text-[#e8c800]'
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={bookmarked ? 2.5 : 2} />
    </button>
  );
}
