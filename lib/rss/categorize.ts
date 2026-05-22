/**
 * lib/rss/categorize.ts
 * Sistema di categorizzazione per notizie. Replica e migliora il sito vecchio.
 *
 * Strategia:
 *  1. Se la fonte ha `forceCat` → usa quella (override hard)
 *  2. Altrimenti analizza titolo + descrizione con keyword pesate
 *  3. Vince la categoria con punteggio totale più alto
 *  4. Sotto soglia minima (2 punti) → fallback 'altro'
 */

import type { CategoryId, FeedSource } from './config';

interface Keyword {
  pattern: RegExp;
  weight: number;
}

const KW: Record<Exclude<CategoryId, 'altro'>, Keyword[]> = {
  calcio: [
    // Leghe e tornei
    { pattern: /\bserie\s*a\b/i, weight: 3 },
    { pattern: /\bserie\s*b\b/i, weight: 3 },
    { pattern: /\bpremier\s*league\b/i, weight: 3 },
    { pattern: /\bla\s*liga\b/i, weight: 3 },
    { pattern: /\bbundesliga\b/i, weight: 3 },
    { pattern: /\bligue\s*1\b/i, weight: 3 },
    { pattern: /\beuropa\s*league\b/i, weight: 3 },
    { pattern: /\bconference\s*league\b/i, weight: 3 },
    { pattern: /\bcoppa\s*italia\b/i, weight: 3 },
    { pattern: /\bnazionale\b/i, weight: 2 },
    { pattern: /\bmondiali\b/i, weight: 2 },
    { pattern: /\beuropei\b/i, weight: 2 },
    // Squadre Serie A top
    { pattern: /\b(juventus|juve|inter|milan|napoli|roma|lazio|atalanta|fiorentina|bologna|torino|genoa|udinese)\b/i, weight: 3 },
    // Squadre estere top
    { pattern: /\b(real\s*madrid|barcelona|barça|psg|bayern|manchester|liverpool|chelsea|arsenal|city|united|tottenham|atletico)\b/i, weight: 3 },
    // Generici
    { pattern: /\bcalcio(?!mercato)\b/i, weight: 1 },
    { pattern: /\bcalciomercato\b/i, weight: 2 },
    { pattern: /\b(gol|goal|rigore|allenatore|mister)\b/i, weight: 1 },
  ],
  champions: [
    { pattern: /\bchampions\s*league\b/i, weight: 3 },
    { pattern: /\buefa\s*champions\b/i, weight: 3 },
    { pattern: /\bsupercoppa\s*europea\b/i, weight: 2 },
    { pattern: /\bottavi\s*di\s*finale\b/i, weight: 1 },
    { pattern: /\bquarti\s*champions\b/i, weight: 2 },
    { pattern: /\bsemifinale\s*champions\b/i, weight: 2 },
    { pattern: /\bfinale\s*champions\b/i, weight: 3 },
  ],
  f1: [
    { pattern: /\bformula\s*1\b/i, weight: 3 },
    { pattern: /\bformula\s*uno\b/i, weight: 3 },
    { pattern: /\bf1\b/i, weight: 3 },
    { pattern: /\bgran\s*premio\b/i, weight: 2 },
    { pattern: /\bgp\s+(canada|austria|monaco|silverstone|monza|imola|spa|brasile)\b/i, weight: 3 },
    { pattern: /\b(ferrari|mclaren|mercedes|red\s*bull|aston\s*martin|williams|alpine)\b/i, weight: 2 },
    { pattern: /\b(verstappen|hamilton|leclerc|sainz|norris|piastri|russell|alonso|perez)\b/i, weight: 3 },
    { pattern: /\bpole\s*position\b/i, weight: 2 },
    { pattern: /\bpodio\b/i, weight: 1 },
    { pattern: /\bqualifich[ae]\b/i, weight: 1 },
    { pattern: /\bcircuito\b/i, weight: 1 },
  ],
  motogp: [
    { pattern: /\bmotogp\b/i, weight: 3 },
    { pattern: /\bmoto\s*gp\b/i, weight: 3 },
    { pattern: /\bmoto\s*2\b/i, weight: 3 },
    { pattern: /\bmoto\s*3\b/i, weight: 3 },
    { pattern: /\bdorna\b/i, weight: 2 },
    { pattern: /\b(bagnaia|marquez|martin|bezzecchi|quartararo|aleix|miller|binder|morbidelli|bastianini)\b/i, weight: 3 },
    { pattern: /\b(ducati|honda\s+rc|yamaha\s+m1|aprilia|ktm)\b/i, weight: 2 },
    { pattern: /\bmugello\b/i, weight: 2 },
    { pattern: /\bsachsenring\b/i, weight: 2 },
  ],
  tennis: [
    { pattern: /\btennis\b/i, weight: 2 },
    { pattern: /\batp\b/i, weight: 3 },
    { pattern: /\bwta\b/i, weight: 3 },
    { pattern: /\bgrand\s*slam\b/i, weight: 3 },
    { pattern: /\b(wimbledon|roland\s*garros|us\s*open|australian\s*open)\b/i, weight: 3 },
    { pattern: /\b(sinner|alcaraz|djokovic|nadal|federer|musetti|berrettini|sonego|fognini)\b/i, weight: 3 },
    { pattern: /\b(swiatek|sabalenka|gauff|paolini|errani)\b/i, weight: 3 },
    { pattern: /\bset\s+vincente\b/i, weight: 1 },
    { pattern: /\bbreak\s+point\b/i, weight: 1 },
    { pattern: /\bace\b/i, weight: 1 },
  ],
  nfl: [
    { pattern: /\bnfl\b/i, weight: 3 },
    { pattern: /\bsuper\s*bowl\b/i, weight: 3 },
    { pattern: /\b(quarterback|touchdown|playoffs)\b/i, weight: 2 },
    { pattern: /\b(chiefs|49ers|cowboys|eagles|patriots|giants|packers|bills|ravens|bengals)\b/i, weight: 3 },
    { pattern: /\b(mahomes|brady|kelce|allen|burrow|hurts|jackson)\b/i, weight: 3 },
    { pattern: /\bfootball\s+americano\b/i, weight: 2 },
  ],
};

const MIN_SCORE_TO_CATEGORIZE = 2;

/**
 * Categorizza una notizia.
 */
export function categorize(
  feed: FeedSource,
  title: string,
  description?: string | null,
): CategoryId {
  if (feed.forceCat) return feed.forceCat;

  const text = `${title} ${description ?? ''}`;
  const scores = new Map<CategoryId, number>();

  (Object.keys(KW) as Exclude<CategoryId, 'altro'>[]).forEach((cat) => {
    let score = 0;
    KW[cat].forEach((kw) => {
      if (kw.pattern.test(text)) score += kw.weight;
    });
    if (score > 0) scores.set(cat, score);
  });

  if (scores.size === 0) return 'altro';

  let winner: CategoryId = 'altro';
  let max = MIN_SCORE_TO_CATEGORIZE - 1;
  scores.forEach((s, cat) => {
    if (s > max) {
      max = s;
      winner = cat;
    }
  });
  return winner;
}

/**
 * Bilanciamento lingua: se IT ≥ thresholdIt, cap EN al enCapPct%.
 */
export function balanceByLanguage<T extends { lang: 'it' | 'en' }>(
  items: T[],
  thresholdIt: number,
  enCapPct: number,
): T[] {
  const it = items.filter((i) => i.lang === 'it');
  const en = items.filter((i) => i.lang === 'en');

  if (it.length < thresholdIt) return items;

  const ratio = enCapPct / 100;
  const enCap = Math.floor((it.length * ratio) / (1 - ratio));
  const enKept = en.slice(0, enCap);

  return [...it, ...enKept];
}
