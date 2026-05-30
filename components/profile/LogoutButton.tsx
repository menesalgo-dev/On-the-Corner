/**
 * components/profile/LogoutButton.tsx
 *
 * Bottone logout client-side che chiama Supabase signOut e poi
 * fa router.refresh() per ricaricare lo stato auth.
 */
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    if (loading) return;
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('[logout] failed', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-3.5 text-sm uppercase tracking-wider text-red-400 transition hover:border-red-500/40 hover:bg-red-500/10 disabled:opacity-50"
      style={{ fontFamily: 'var(--font-dm-mono)' }}
    >
      <LogOut className="h-4 w-4" />
      {loading ? 'Disconnessione...' : 'Esci dall\'account'}
    </button>
  );
}
