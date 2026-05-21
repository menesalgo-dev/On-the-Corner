/**
 * lib/rss/config.ts
 * Configurazione fonti RSS — fedele al config.js esistente del vecchio sito.
 * Le 19 fonti, lingue, priorità e limiti sono identici per garantire
 * la continuità del feed durante la migrazione.
 */

export type FeedLang = 'it' | 'en';

export interface FeedSource {
  /** Identificatore stabile usato in dedup e analytics. */
  id: string;
  /** Nome leggibile mostrato in UI. */
  name: string;
  /** URL del feed RSS / Atom. */
  url: string;
  /** Lingua del contenuto. */
  lang: FeedLang;
  /**
   * Priorità di ordinamento: 1 = top (italiane), 2 = secondaria (estere).
   * A parità di priorità, ordina per `published_at` desc.
   */
  priority: 1 | 2;
}

export const FEEDS: readonly FeedSource[] = [
  // ─── Italiane (priorità 1) ───
  { id: 'g',           name: 'Gazzetta',           url: 'https://www.gazzetta.it/rss/home.xml',                                           lang: 'it', priority: 1 },
  { id: 'c',           name: 'Corriere Sport',     url: 'https://www.corrieredellosport.it/rss/home.xml',                                 lang: 'it', priority: 1 },
  { id: 's',           name: 'Sky Sport',          url: 'https://sport.sky.it/rss/sport.xml',                                             lang: 'it', priority: 1 },
  { id: 'e',           name: 'Eurosport',          url: 'https://eurosport.it/rss.xml',                                                   lang: 'it', priority: 1 },
  { id: 'tt',          name: 'Tuttosport',         url: 'https://www.tuttosport.com/rss/home.xml',                                        lang: 'it', priority: 1 },
  { id: 'rep_calcio',  name: 'Repubblica Calcio',  url: 'https://www.repubblica.it/rss/sport/calcio/rss2.0.xml',                          lang: 'it', priority: 1 },
  { id: 'rep_f1',      name: 'Repubblica F1',      url: 'https://www.repubblica.it/rss/sport/formulauno/rss2.0.xml',                      lang: 'it', priority: 1 },
  { id: 'rep_tennis',  name: 'Repubblica Tennis',  url: 'https://www.repubblica.it/rss/sport/tennis/rss2.0.xml',                          lang: 'it', priority: 1 },
  { id: 'sm',          name: 'SportMediaset',      url: 'https://www.sportmediaset.mediaset.it/rss/sportmediaset.xml',                    lang: 'it', priority: 1 },
  { id: 'ansa',        name: 'ANSA Sport',         url: 'https://www.ansa.it/sito/notizie/sport/sport_rss.xml',                           lang: 'it', priority: 1 },
  { id: 'cm',          name: 'Calciomercato.com',  url: 'https://www.calciomercato.com/rss',                                              lang: 'it', priority: 1 },
  { id: 'fp',          name: 'FormulaPassion',     url: 'https://www.formulapassion.it/feed',                                             lang: 'it', priority: 1 },

  // ─── Estere (priorità 2) ───
  { id: 'b',     name: 'BBC Sport',     url: 'https://feeds.bbci.co.uk/sport/rss.xml',                                        lang: 'en', priority: 2 },
  { id: 'f',     name: 'Formula1.com',  url: 'https://www.formula1.com/content/fom-website/en/latest/all.xml',                lang: 'en', priority: 2 },
  { id: 'marca', name: 'Marca',         url: 'https://e00-marca.uecdn.es/rss/portada.xml',                                    lang: 'en', priority: 2 },
  { id: 'skyuk', name: 'Sky Sports UK', url: 'https://www.skysports.com/rss/12040',                                           lang: 'en', priority: 2 },
  { id: 'as',    name: 'AS.com',        url: 'https://as.com/rss/tags/ultimas_noticias.xml',                                  lang: 'en', priority: 2 },
  { id: 'uefa',  name: 'UEFA.com',      url: 'https://www.uefa.com/rssfeed/newsrss.xml',                                      lang: 'en', priority: 2 },
  { id: 'atp',   name: 'ATP Tour',      url: 'https://www.atptour.com/en/media/rss-feed/xml-feed',                            lang: 'en', priority: 2 },
] as const;

// ───── Costanti operative ─────
export const MAX_ITEMS_PER_SOURCE = 10;
export const MAX_AGE_DAYS         = 7;

/** Timeout per singolo fetch (ms) — evita di bloccare l'aggregator. */
export const FETCH_TIMEOUT_MS = 8_000;

/** User-Agent dichiarato ai server RSS. */
export const RSS_USER_AGENT = 'OnTheCornerBot/1.0 (+https://onthecorner.it)';

/** Soglia di similarità per dedup titoli (0–1, più alta = più severo). */
export const DEDUP_TITLE_SIM_THRESHOLD = 0.85;
