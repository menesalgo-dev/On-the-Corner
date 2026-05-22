/**
 * lib/data/popular-entities.ts
 * Dataset curato delle entità (squadre/atleti) seguibili.
 * In W4 lo amplieremo con TheSportsDB per il catalogo completo.
 *
 * Per ora include i 50 elementi più cercati per i 6 sport del progetto.
 */

import type { CategoryId } from '@/lib/rss/config';

export interface PopularEntity {
  /** Slug univoco usato come entity_slug in follows. */
  slug: string;
  /** Nome visualizzato. */
  name: string;
  /** Tipo: 'team' per squadre, 'athlete' per atleti individuali. */
  kind: 'team' | 'athlete';
  /** Categoria principale. */
  category: CategoryId;
  /** Emoji rappresentativa (fallback se non c'è logo). */
  emoji?: string;
  /** Lista parole chiave per il match nelle news (lowercase, no accenti). */
  keywords: string[];
}

export const POPULAR_ENTITIES: readonly PopularEntity[] = [
  // ─── CALCIO Serie A ───
  { slug: 'juventus',   name: 'Juventus',   kind: 'team', category: 'calcio', emoji: '⚪⚫', keywords: ['juventus', 'juve', 'bianconeri'] },
  { slug: 'inter',      name: 'Inter',      kind: 'team', category: 'calcio', emoji: '🔵⚫', keywords: ['inter', 'nerazzurri', 'internazionale'] },
  { slug: 'milan',      name: 'Milan',      kind: 'team', category: 'calcio', emoji: '🔴⚫', keywords: ['milan', 'rossoneri', 'ac milan'] },
  { slug: 'napoli',     name: 'Napoli',     kind: 'team', category: 'calcio', emoji: '💙', keywords: ['napoli', 'partenopei', 'azzurri napoli'] },
  { slug: 'roma',       name: 'Roma',       kind: 'team', category: 'calcio', emoji: '🟡🔴', keywords: ['roma', 'giallorossi', 'as roma'] },
  { slug: 'lazio',      name: 'Lazio',      kind: 'team', category: 'calcio', emoji: '🦅', keywords: ['lazio', 'biancocelesti'] },
  { slug: 'atalanta',   name: 'Atalanta',   kind: 'team', category: 'calcio', emoji: '🔵⚫', keywords: ['atalanta', 'orobici', 'dea'] },
  { slug: 'fiorentina', name: 'Fiorentina', kind: 'team', category: 'calcio', emoji: '🟣', keywords: ['fiorentina', 'viola'] },
  { slug: 'bologna',    name: 'Bologna',    kind: 'team', category: 'calcio', emoji: '🔴🔵', keywords: ['bologna', 'rossoblu'] },
  { slug: 'torino',     name: 'Torino',     kind: 'team', category: 'calcio', emoji: '🟤', keywords: ['torino', 'granata', 'toro'] },

  // ─── CALCIO Estero ───
  { slug: 'real-madrid',     name: 'Real Madrid',      kind: 'team', category: 'calcio', emoji: '👑', keywords: ['real madrid', 'real'] },
  { slug: 'barcelona',       name: 'Barcellona',       kind: 'team', category: 'calcio', emoji: '🔵🔴', keywords: ['barcelona', 'barcellona', 'barca', 'barça'] },
  { slug: 'manchester-city', name: 'Manchester City',  kind: 'team', category: 'calcio', emoji: '🔵', keywords: ['manchester city', 'man city', 'city'] },
  { slug: 'manchester-utd',  name: 'Manchester United',kind: 'team', category: 'calcio', emoji: '🔴', keywords: ['manchester united', 'man utd', 'red devils'] },
  { slug: 'liverpool',       name: 'Liverpool',        kind: 'team', category: 'calcio', emoji: '🔴', keywords: ['liverpool', 'reds'] },
  { slug: 'arsenal',         name: 'Arsenal',          kind: 'team', category: 'calcio', emoji: '🔴⚪', keywords: ['arsenal', 'gunners'] },
  { slug: 'chelsea',         name: 'Chelsea',          kind: 'team', category: 'calcio', emoji: '🔵', keywords: ['chelsea', 'blues'] },
  { slug: 'psg',             name: 'PSG',              kind: 'team', category: 'calcio', emoji: '🔵🔴', keywords: ['psg', 'paris saint-germain', 'paris'] },
  { slug: 'bayern-monaco',   name: 'Bayern Monaco',    kind: 'team', category: 'calcio', emoji: '🔴', keywords: ['bayern', 'bayern monaco', 'bayern munich'] },

  // ─── F1 PILOTI ───
  { slug: 'verstappen', name: 'Max Verstappen', kind: 'athlete', category: 'f1', emoji: '🇳🇱', keywords: ['verstappen', 'max verstappen'] },
  { slug: 'leclerc',    name: 'Charles Leclerc',kind: 'athlete', category: 'f1', emoji: '🇲🇨', keywords: ['leclerc', 'charles leclerc'] },
  { slug: 'sainz',      name: 'Carlos Sainz',   kind: 'athlete', category: 'f1', emoji: '🇪🇸', keywords: ['sainz', 'carlos sainz'] },
  { slug: 'hamilton',   name: 'Lewis Hamilton', kind: 'athlete', category: 'f1', emoji: '🇬🇧', keywords: ['hamilton', 'lewis hamilton'] },
  { slug: 'norris',     name: 'Lando Norris',   kind: 'athlete', category: 'f1', emoji: '🇬🇧', keywords: ['norris', 'lando norris'] },
  { slug: 'piastri',    name: 'Oscar Piastri',  kind: 'athlete', category: 'f1', emoji: '🇦🇺', keywords: ['piastri', 'oscar piastri'] },
  { slug: 'russell',    name: 'George Russell', kind: 'athlete', category: 'f1', emoji: '🇬🇧', keywords: ['russell', 'george russell'] },
  { slug: 'alonso',     name: 'Fernando Alonso',kind: 'athlete', category: 'f1', emoji: '🇪🇸', keywords: ['alonso', 'fernando alonso'] },

  // ─── F1 TEAM ───
  { slug: 'ferrari',  name: 'Ferrari',  kind: 'team', category: 'f1', emoji: '🐎', keywords: ['ferrari', 'scuderia ferrari'] },
  { slug: 'red-bull', name: 'Red Bull', kind: 'team', category: 'f1', emoji: '🐂', keywords: ['red bull', 'red bull racing', 'redbull'] },
  { slug: 'mclaren',  name: 'McLaren',  kind: 'team', category: 'f1', emoji: '🟠', keywords: ['mclaren'] },
  { slug: 'mercedes-f1', name: 'Mercedes F1', kind: 'team', category: 'f1', emoji: '⭐', keywords: ['mercedes f1', 'mercedes amg'] },

  // ─── TENNIS ───
  { slug: 'sinner',     name: 'Jannik Sinner',  kind: 'athlete', category: 'tennis', emoji: '🇮🇹', keywords: ['sinner', 'jannik sinner'] },
  { slug: 'alcaraz',    name: 'Carlos Alcaraz', kind: 'athlete', category: 'tennis', emoji: '🇪🇸', keywords: ['alcaraz', 'carlos alcaraz'] },
  { slug: 'djokovic',   name: 'Novak Djokovic', kind: 'athlete', category: 'tennis', emoji: '🇷🇸', keywords: ['djokovic', 'novak djokovic', 'djoker'] },
  { slug: 'musetti',    name: 'Lorenzo Musetti',kind: 'athlete', category: 'tennis', emoji: '🇮🇹', keywords: ['musetti', 'lorenzo musetti'] },
  { slug: 'berrettini', name: 'Matteo Berrettini',kind: 'athlete', category: 'tennis', emoji: '🇮🇹', keywords: ['berrettini', 'matteo berrettini'] },
  { slug: 'paolini',    name: 'Jasmine Paolini',kind: 'athlete', category: 'tennis', emoji: '🇮🇹', keywords: ['paolini', 'jasmine paolini'] },
  { slug: 'swiatek',    name: 'Iga Swiatek',    kind: 'athlete', category: 'tennis', emoji: '🇵🇱', keywords: ['swiatek', 'iga swiatek'] },
  { slug: 'sabalenka',  name: 'Aryna Sabalenka',kind: 'athlete', category: 'tennis', emoji: '🇧🇾', keywords: ['sabalenka', 'aryna sabalenka'] },

  // ─── MOTOGP ───
  { slug: 'bagnaia',  name: 'Pecco Bagnaia',  kind: 'athlete', category: 'motogp', emoji: '🇮🇹', keywords: ['bagnaia', 'pecco bagnaia', 'francesco bagnaia'] },
  { slug: 'marquez',  name: 'Marc Marquez',   kind: 'athlete', category: 'motogp', emoji: '🇪🇸', keywords: ['marquez', 'marc marquez'] },
  { slug: 'martin',   name: 'Jorge Martin',   kind: 'athlete', category: 'motogp', emoji: '🇪🇸', keywords: ['jorge martin', 'martin motogp'] },
  { slug: 'bezzecchi',name: 'Marco Bezzecchi',kind: 'athlete', category: 'motogp', emoji: '🇮🇹', keywords: ['bezzecchi', 'marco bezzecchi'] },
  { slug: 'ducati-mgp', name: 'Ducati (MotoGP)', kind: 'team', category: 'motogp', emoji: '🔴', keywords: ['ducati motogp', 'ducati corse'] },

  // ─── NFL ───
  { slug: 'chiefs',   name: 'Kansas City Chiefs', kind: 'team', category: 'nfl', emoji: '🔴', keywords: ['chiefs', 'kansas city chiefs', 'kansas city'] },
  { slug: '49ers',    name: 'San Francisco 49ers',kind: 'team', category: 'nfl', emoji: '🟥', keywords: ['49ers', 'san francisco 49ers', 'niners'] },
  { slug: 'cowboys',  name: 'Dallas Cowboys',     kind: 'team', category: 'nfl', emoji: '⭐', keywords: ['cowboys', 'dallas cowboys'] },
  { slug: 'eagles',   name: 'Philadelphia Eagles',kind: 'team', category: 'nfl', emoji: '🦅', keywords: ['eagles', 'philadelphia eagles'] },
  { slug: 'mahomes',  name: 'Patrick Mahomes',    kind: 'athlete', category: 'nfl', emoji: '🏈', keywords: ['mahomes', 'patrick mahomes'] },
];

/** Cerca entità per query libera (case-insensitive, normalizzata). */
export function searchEntities(query: string, limit = 20): PopularEntity[] {
  const q = query.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (!q) return [...POPULAR_ENTITIES].slice(0, limit);

  return POPULAR_ENTITIES
    .map((e) => {
      // Match esatto sul nome → score più alto
      const name = e.name.toLowerCase();
      if (name.includes(q)) return { e, score: 10 };
      // Match su keyword
      for (const kw of e.keywords) {
        if (kw.includes(q)) return { e, score: 5 };
      }
      return null;
    })
    .filter((x): x is { e: PopularEntity; score: number } => x !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.e);
}

/** Suggeriti: top N per ciascuna categoria. */
export function getSuggestedEntities(perCategory = 3): PopularEntity[] {
  const byCat = new Map<CategoryId, PopularEntity[]>();
  POPULAR_ENTITIES.forEach((e) => {
    const arr = byCat.get(e.category) ?? [];
    if (arr.length < perCategory) arr.push(e);
    byCat.set(e.category, arr);
  });
  return Array.from(byCat.values()).flat();
}

/** Filtra news per entità seguite: match su keywords nel titolo+descrizione. */
export function newsMatchesEntities(
  title: string,
  description: string | null,
  entitySlugs: string[],
): string[] {
  if (entitySlugs.length === 0) return [];
  const text = `${title} ${description ?? ''}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const matched: string[] = [];

  for (const slug of entitySlugs) {
    const ent = POPULAR_ENTITIES.find((e) => e.slug === slug);
    if (!ent) continue;
    for (const kw of ent.keywords) {
      if (text.includes(kw)) {
        matched.push(slug);
        break;
      }
    }
  }
  return matched;
}
