/**
 * lib/rss/config.ts — versione W3.
 * Aggiunte: 2 fonti (GPone MotoGP, NFL.com), campo opzionale `forceCat`.
 * Esporta CategoryId, MAX_AGE_DAYS_IT/EN, BALANCE_LANG_*.
 */

export type FeedLang = 'it' | 'en';

/** Id delle categorie OTC. Allineato con tabella `categories`. */
export type CategoryId =
  | 'calcio'
  | 'champions'
  | 'f1'
  | 'motogp'
  | 'tennis'
  | 'nfl'
  | 'altro';

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  lang: FeedLang;
  priority: 1 | 2;
  /** Se presente, tutte le notizie del feed ottengono questa categoria
   *  bypassando il sistema a keyword. */
  forceCat?: CategoryId;
}

export const FEEDS: readonly FeedSource[] = [
  // ─── Italiane (priorità 1) ───
  { id: 'g',           name: 'Gazzetta',           url: 'https://www.gazzetta.it/rss/home.xml',                                lang: 'it', priority: 1 },
  { id: 'c',           name: 'Corriere Sport',     url: 'https://www.corrieredellosport.it/rss/home.xml',                      lang: 'it', priority: 1 },
  { id: 's',           name: 'Sky Sport',          url: 'https://sport.sky.it/rss/sport.xml',                                  lang: 'it', priority: 1 },
  { id: 'e',           name: 'Eurosport',          url: 'https://eurosport.it/rss.xml',                                        lang: 'it', priority: 1 },
  { id: 'tt',          name: 'Tuttosport',         url: 'https://www.tuttosport.com/rss/home.xml',                             lang: 'it', priority: 1 },
  { id: 'rep_calcio',  name: 'Repubblica Calcio',  url: 'https://www.repubblica.it/rss/sport/calcio/rss2.0.xml',               lang: 'it', priority: 1, forceCat: 'calcio' },
  { id: 'rep_f1',      name: 'Repubblica F1',      url: 'https://www.repubblica.it/rss/sport/formulauno/rss2.0.xml',           lang: 'it', priority: 1, forceCat: 'f1' },
  { id: 'rep_tennis',  name: 'Repubblica Tennis',  url: 'https://www.repubblica.it/rss/sport/tennis/rss2.0.xml',               lang: 'it', priority: 1, forceCat: 'tennis' },
  { id: 'sm',          name: 'SportMediaset',      url: 'https://www.sportmediaset.mediaset.it/rss/sportmediaset.xml',         lang: 'it', priority: 1 },
  { id: 'ansa',        name: 'ANSA Sport',         url: 'https://www.ansa.it/sito/notizie/sport/sport_rss.xml',                lang: 'it', priority: 1 },
  { id: 'cm',          name: 'Calciomercato.com',  url: 'https://www.calciomercato.com/rss',                                   lang: 'it', priority: 1, forceCat: 'calcio' },
  { id: 'fp',          name: 'FormulaPassion',     url: 'https://www.formulapassion.it/feed',                                  lang: 'it', priority: 1, forceCat: 'f1' },
  { id: 'gpone',       name: 'GPone',              url: 'https://www.gpone.com/it/rss.xml',                                    lang: 'it', priority: 1, forceCat: 'motogp' },

  // ─── Estere (priorità 2) ───
  { id: 'b',     name: 'BBC Sport',     url: 'https://feeds.bbci.co.uk/sport/rss.xml',                                          lang: 'en', priority: 2 },
  { id: 'f',     name: 'Formula1.com',  url: 'https://www.formula1.com/content/fom-website/en/latest/all.xml',                  lang: 'en', priority: 2, forceCat: 'f1' },
  { id: 'marca', name: 'Marca',         url: 'https://e00-marca.uecdn.es/rss/portada.xml',                                      lang: 'en', priority: 2 },
  { id: 'skyuk', name: 'Sky Sports UK', url: 'https://www.skysports.com/rss/12040',                                             lang: 'en', priority: 2 },
  { id: 'as',    name: 'AS.com',        url: 'https://as.com/rss/tags/ultimas_noticias.xml',                                    lang: 'en', priority: 2 },
  { id: 'uefa',  name: 'UEFA.com',      url: 'https://www.uefa.com/rssfeed/newsrss.xml',                                        lang: 'en', priority: 2, forceCat: 'champions' },
  { id: 'atp',   name: 'ATP Tour',      url: 'https://www.atptour.com/en/media/rss-feed/xml-feed',                              lang: 'en', priority: 2, forceCat: 'tennis' },
  { id: 'nfl',   name: 'NFL.com',       url: 'https://www.nfl.com/feeds/rss/news',                                              lang: 'en', priority: 2, forceCat: 'nfl' },
] as const;

// ───── Costanti operative ─────
export const MAX_ITEMS_PER_SOURCE = 10;
export const MAX_AGE_DAYS_IT      = 7;
export const MAX_AGE_DAYS_EN      = 3;

export const FETCH_TIMEOUT_MS = 8_000;
export const RSS_USER_AGENT = 'OnTheCornerBot/1.0 (+https://onthecorner.it)';
export const DEDUP_TITLE_SIM_THRESHOLD = 0.85;

export const BALANCE_LANG_THRESHOLD_IT = 30;
export const BALANCE_LANG_EN_CAP_PCT = 20;
