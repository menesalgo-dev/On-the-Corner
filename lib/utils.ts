/**
 * lib/utils.ts
 * Utility comuni usate da quasi tutti i componenti.
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNowStrict } from 'date-fns';
import { it } from 'date-fns/locale';

/**
 * Concatena classi tailwind con merge intelligente (rimuove duplicati conflittuali).
 * Esempio: cn('p-2 p-4') → 'p-4'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Tempo relativo in italiano: "2 minuti fa", "1 ora fa", "ieri".
 * Accetta ISO string o Date.
 */
export function formatRelative(input: string | Date): string {
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '';
  return formatDistanceToNowStrict(date, { addSuffix: true, locale: it });
}

/**
 * Formatta cent → "12,34 €" italiano.
 */
export function formatCurrency(cents: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

/**
 * Formatta numero con separatori italiani.
 */
export function formatNumber(n: number, opts?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('it-IT', opts).format(n);
}

/**
 * Slugify base per URL friendly.
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Type guard utile in catch:
 *   } catch (err) { return { ok: false, error: errorMessage(err) }; }
 */
export function errorMessage(err: unknown, fallback = 'Errore sconosciuto'): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return fallback;
}
