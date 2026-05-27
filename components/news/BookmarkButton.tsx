/**
 * components/news/BookmarkButton.tsx
 * Componente client interattivo per salvare o rimuovere una notizia dai segnalibri.
 * Interamente allineato alla logica ad HASH univoco.
 */
'use client';

import React, { useState, useTransition } from 'react';
import { Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface BookmarkButtonProps {
  newsHash: string;
  initialBookmarked: boolean;
}

export function BookmarkButton({ newsHash, initialBookmarked }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Evita la navigazione se il pulsante è dentro una NewsCard cliccabile
    if (isPending) return;

    // Ottimizzazione UI ottimistica (Optimistic UI)
    const previousState = isBookmarked;
    setIsBookmarked(!previousState);

    startTransition(async () => {
      try {
        // Chiamata all'API handler unificata creata nel Modulo Bookmarks
        const response = await fetch('/api/bookmarks', {
          method: previousState ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newsHash }),
        });

        if (!response.ok) throw new Error();

        toast.success(previousState ? 'Rossa dai preferiti' : 'Salvata nei preferiti');
        router.refresh(); // Invalida i Server Components per aggiornare i contatori globali
      } catch (err) {
        // Rollback dello stato se la chiamata al database fallisce
        setIsBookmarked(previousState);
        toast.error('Impossibile aggiornare i preferiti. Riprova.');
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-[#0d0d0d] transition-all hover:scale-105 active:scale-95 ${
        isBookmarked 
          ? 'text-[#e8c800] bg-[#e8c800]/10 border-[#e8c800]/30' 
          : 'text-zinc-400 hover:text-white'
      }`}
      title={isBookmarked ? 'Rimuovi dai preferiti' : 'Salva per dopo'}
    >
      <Bookmark 
        className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''} ${isPending ? 'opacity-50' : ''}`} 
      />
    </button>
  );
}
