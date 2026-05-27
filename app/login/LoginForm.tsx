/**
 * app/login/LoginForm.tsx
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      toast.success('Accesso effettuato!');
      router.push('/');
      router.refresh();
    } catch (err) {
      toast.error('Errore di rete.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div>
        <label className="mb-1.5 block text-[11px] uppercase tracking-widest text-zinc-400" style={{ fontFamily: 'var(--font-dm-mono)' }}>
          Email
        </label>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-[#1f1f1f] bg-[#080808] px-4 py-3 text-white outline-none transition focus:border-[#e8c800] focus:ring-2 focus:ring-[#e8c800]/20"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[11px] uppercase tracking-widest text-zinc-400" style={{ fontFamily: 'var(--font-dm-mono)' }}>
          Password
        </label>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-[#1f1f1f] bg-[#080808] px-4 py-3 text-white outline-none transition focus:border-[#e8c800] focus:ring-2 focus:ring-[#e8c800]/20"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e8c800] py-3 text-sm uppercase tracking-wider text-black transition hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
        style={{ fontFamily: 'var(--font-archivo-black)' }}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Accedi'}
      </button>
    </form>
  );
}
