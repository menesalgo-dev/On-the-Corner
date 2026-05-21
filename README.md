[README.md](https://github.com/user-attachments/files/28111848/README.md)
# On The Corner — Blueprint Production-Ready (v2026)

> Evoluzione definitiva del sito attuale. Stack moderno, costo iniziale 0€, scalabile.
> Tema: **#080808** (sfondo) · **#e8c800** (accento giallo) · Archivo Black + DM Mono.

---

## Indice

1. [Architettura Generale](#1-architettura-generale)
2. [Schema Database Supabase](#2-schema-database-supabase) → vedi anche `database/schema.sql`
3. [Struttura Cartelle](#3-struttura-cartelle-del-progetto)
4. [Codice Chiave](#4-codice-chiave) → vedi `lib/rss/*`, `supabase/functions/*`, `components/*`
5. [Prompt Logo AI](#5-prompt-per-generare-il-logo)
6. [Roadmap 8 Settimane](#6-roadmap-di-sviluppo)
7. [Strategia di Migrazione da Hostinger](#7-strategia-di-migrazione)

---

## 1. Architettura Generale

```
                           ┌──────────────────────────────────┐
                           │       Utente (mobile-first)      │
                           │   PWA · iOS · Android · Desktop  │
                           └──────────────┬───────────────────┘
                                          │  HTTPS
                                          ▼
              ┌──────────────────────────────────────────────────────┐
              │              Next.js 15 App Router                   │
              │  ┌────────────┐  ┌────────────┐  ┌──────────────┐    │
              │  │ Server     │  │ Server     │  │ Client       │    │
              │  │ Components │  │ Actions    │  │ Components   │    │
              │  └────────────┘  └────────────┘  └──────────────┘    │
              │  Caching: revalidateTag · revalidatePath · ISR       │
              │  Auth middleware · Edge runtime per RSS              │
              │  Deploy: Vercel (free tier) o Cloudflare Pages       │
              └────────┬─────────────────────────────────┬───────────┘
                       │                                 │
                       ▼                                 ▼
        ┌──────────────────────────────┐  ┌──────────────────────────┐
        │       Supabase (Free)        │  │   Servizi Esterni        │
        │  ┌────────────────────────┐  │  │ ┌──────────────────────┐ │
        │  │  Auth (email + OAuth)  │  │  │ │ API-Football (Free)  │ │
        │  ├────────────────────────┤  │  │ │ TheSportsDB (Free)   │ │
        │  │  Postgres + RLS        │  │  │ │ RSS Feeds (19)       │ │
        │  ├────────────────────────┤  │  │ │ OneSignal (Push)     │ │
        │  │  Realtime (websocket)  │  │  │ └──────────────────────┘ │
        │  ├────────────────────────┤  │  └──────────────────────────┘
        │  │  Edge Functions (Deno) │◀─┼──── pg_cron ogni 15 min
        │  │   • sync-news (RSS)    │  │
        │  │   • sync-matches       │  │
        │  │   • settle-slips       │  │
        │  ├────────────────────────┤  │
        │  │  Storage (avatar)      │  │
        │  └────────────────────────┘  │
        └──────────────────────────────┘

Data flow notizie:
RSS → Edge Function sync-news (parser + dedup) → news_items (Postgres)
   → Realtime channel → Client invalida cache → UI aggiornata

Data flow schedine:
Client crea slip → Server Action → DB → Realtime → Tutti i device dell'utente
   pg_cron settle-slips ogni 5 min → controlla match conclusi → aggiorna stato
   → notifica push via OneSignal → UI animazione vittoria/sconfitta
```

**Decisioni architetturali chiave**

- **Server Components di default**: solo i componenti interattivi sono `'use client'`. Bundle minimo, performance massima.
- **Server Actions per mutazioni**: zero API routes manuali per le operazioni CRUD utente.
- **RSS server-side**: il parser gira su Edge Function Deno (no CORS, no client overhead). Il client riceve solo JSON già pulito e deduplicato.
- **Realtime selettivo**: subscription Supabase Realtime solo dove serve (schedine live, partite live). Le notizie usano polling SWR + revalidate tag.
- **Caching aggressivo**: `unstable_cache` con tag `news`, `matches`, `user:{id}` → invalidazione mirata.
- **Edge runtime**: rotte di lettura news/matches deployate su edge per latenza minima.

---

## 2. Schema Database Supabase

Il file completo eseguibile è in **`database/schema.sql`**. Sintesi delle tabelle e delle policy RLS:

### Tabelle principali

| Tabella | Scopo | Realtime |
|---|---|---|
| `profiles` | Estende `auth.users` (username, avatar, preferenze) | sì |
| `teams` | Squadre (cache da API-Football/TheSportsDB) | no |
| `leagues` | Campionati e competizioni | no |
| `follows` | Polimorfica: l'utente segue team/league/competition | sì |
| `news_items` | Notizie aggregate da RSS, deduplicate | sì |
| `news_bookmarks` | Notizie salvate dall'utente | sì |
| `matches` | Partite (cache + risultati live) | sì |
| `slips` | Schedine create dall'utente | sì |
| `slip_picks` | Singole giocate dentro una schedina | sì |
| `bankroll_transactions` | Movimenti del bankroll | sì |
| `badges` | Definizione dei badge gamification | no |
| `user_badges` | Badge sbloccati dall'utente | sì |
| `notifications` | Coda notifiche in-app | sì |
| `leaderboard_view` | Vista materializzata classifica | no |

### Policy RLS — pattern ricorrenti

- **Profile pubblico, mutazione self**: `SELECT` aperto su `profiles`, `UPDATE/INSERT` solo dove `auth.uid() = id`.
- **Risorse utente private**: `slips`, `bankroll_transactions`, `news_bookmarks`, `follows`, `user_badges`, `notifications` → tutti i comandi richiedono `auth.uid() = user_id`.
- **Dati pubblici read-only**: `teams`, `leagues`, `matches`, `news_items`, `badges` → `SELECT` aperto a tutti, scrittura solo da `service_role` (Edge Functions).
- **Slip pubbliche su consenso**: `slips` ha colonna `is_public BOOL` → policy `SELECT` aggiuntiva `is_public = true` per permettere condivisione link.

> ⚠️ **Sicurezza**: tutte le policy usano `auth.uid()` server-side; il client non può mai bypassare. Le Edge Functions usano la `service_role` key (mai esposta al client) per scrivere su `news_items`, `matches`, ecc.

---

## 3. Struttura Cartelle del Progetto

```
on-the-corner/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/route.ts        # OAuth callback Supabase
│   ├── (main)/
│   │   ├── layout.tsx               # Layout con BottomNav mobile
│   │   ├── page.tsx                 # Homepage: news + match in evidenza
│   │   ├── news/
│   │   │   ├── page.tsx             # Feed completo
│   │   │   └── [id]/page.tsx        # Dettaglio notizia + share
│   │   ├── live/
│   │   │   ├── page.tsx             # Lista live scores
│   │   │   └── [matchId]/page.tsx   # Match detail (lineup, stats, eventi)
│   │   ├── slips/
│   │   │   ├── page.tsx             # Le mie schedine
│   │   │   ├── new/page.tsx         # Crea schedina
│   │   │   └── [id]/page.tsx        # Tracking realtime
│   │   ├── follow/
│   │   │   └── page.tsx             # Gestisci team/leghe seguite
│   │   ├── dashboard/
│   │   │   └── page.tsx             # Stats, ROI, grafici, bankroll
│   │   ├── leaderboard/page.tsx
│   │   └── settings/page.tsx        # Tema, push, account
│   ├── api/
│   │   ├── rss/route.ts             # Fallback proxy RSS (se serve)
│   │   └── onesignal/route.ts       # Webhook OneSignal
│   ├── search/page.tsx              # Ricerca globale
│   ├── manifest.ts                  # PWA manifest
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── globals.css
│   ├── icon.tsx                     # Favicon dinamica
│   └── layout.tsx                   # Root layout, font, theme provider
│
├── components/
│   ├── ui/                          # shadcn/ui (button, card, dialog, ...)
│   ├── brand/
│   │   ├── Logo.tsx
│   │   └── CornerFlag.tsx
│   ├── news/
│   │   ├── NewsCard.tsx
│   │   ├── NewsList.tsx
│   │   └── BookmarkButton.tsx
│   ├── matches/
│   │   ├── MatchCard.tsx
│   │   ├── LiveScoreboard.tsx
│   │   └── MatchTimeline.tsx
│   ├── slips/
│   │   ├── SlipBuilder.tsx
│   │   ├── SlipTracker.tsx          # Barra gialla progress + realtime
│   │   ├── SlipCard.tsx
│   │   └── ShareSlipDialog.tsx
│   ├── dashboard/
│   │   ├── StatsGrid.tsx
│   │   ├── ROIChart.tsx             # Recharts
│   │   ├── BankrollWidget.tsx
│   │   └── StreakBadge.tsx
│   ├── follow/
│   │   ├── FollowButton.tsx
│   │   └── FollowedList.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── BottomNav.tsx            # Mobile-first
│   │   ├── SideNav.tsx              # Desktop
│   │   └── ThemeToggle.tsx
│   └── shared/
│       ├── ErrorBoundary.tsx
│       ├── LoadingSkeleton.tsx
│       └── EmptyState.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # Browser client
│   │   ├── server.ts                # Server client (RSC, Server Actions)
│   │   ├── middleware.ts            # Cookie refresh
│   │   └── service.ts               # Service-role client (solo server)
│   ├── rss/
│   │   ├── config.ts                # 19 feeds + costanti
│   │   ├── parser.ts                # Parser + dedup + filtro età
│   │   └── normalize.ts             # Pulizia HTML, estrazione immagini
│   ├── sports/
│   │   ├── api-football.ts
│   │   ├── thesportsdb.ts
│   │   └── matches.ts               # Funzioni unificate
│   ├── slips/
│   │   ├── calc.ts                  # Quote, parlay, vincita potenziale
│   │   └── settle.ts                # Logica di chiusura schedine
│   ├── onesignal/
│   │   └── push.ts                  # Helper invio notifiche
│   ├── analytics/
│   │   └── stats.ts                 # Aggregazioni ROI, win rate
│   ├── utils.ts                     # cn(), formatters, hash dedup
│   └── constants.ts                 # Colori, breakpoint, route
│
├── hooks/
│   ├── useSupabaseAuth.ts
│   ├── useRealtime.ts               # Wrapper per Supabase Realtime
│   ├── useFollow.ts
│   ├── useSlipTracker.ts
│   ├── useBookmark.ts
│   └── useMediaQuery.ts
│
├── server/
│   └── actions/
│       ├── auth.ts
│       ├── follow.ts
│       ├── slips.ts
│       ├── bookmarks.ts
│       └── profile.ts
│
├── types/
│   ├── database.types.ts            # Generato con `supabase gen types`
│   ├── news.ts
│   ├── match.ts
│   └── slip.ts
│
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   └── 20260101000000_init.sql
│   └── functions/
│       ├── sync-news/
│       │   └── index.ts             # RSS aggregator (Deno)
│       ├── sync-matches/
│       │   └── index.ts             # Pull API-Football/TheSportsDB
│       ├── settle-slips/
│       │   └── index.ts             # Chiusura schedine
│       └── _shared/
│           ├── cors.ts
│           └── supabase.ts
│
├── public/
│   ├── logo.svg
│   ├── logo-mark.svg
│   ├── icons/                       # PWA icons 192, 512, maskable
│   ├── splash/                      # iOS splash screens
│   └── og-image.png
│
├── styles/
│   └── tokens.css                   # Design tokens custom
│
├── .env.local.example
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── components.json                  # shadcn/ui config
├── package.json
└── README.md
```

---

## 4. Codice Chiave

I file completi sono nei loro path naturali — qui un riepilogo di cosa contengono e perché.

### 4.1 `lib/rss/config.ts`
Configurazione fonti RSS (le 19 esatte richieste) + costanti operative. Definisce anche i pesi delle priorità per l'ordinamento finale.

### 4.2 `lib/rss/parser.ts`
- Fetch parallelo con `Promise.allSettled` (un feed lento non blocca gli altri).
- Parsing con `fast-xml-parser` (zero dipendenze native, gira su Deno e Node).
- Estrazione immagine da `media:content`, `enclosure`, `<img>` nel description.
- Pulizia HTML con regex sicure (no DOM lato server).
- **Dedup intelligente**: normalizza titolo (lowercase, no punteggiatura, no accenti), normalizza URL (rimuove utm, fragment), confronto con Levenshtein soglia 0.85 sul titolo.
- Filtro età con `MAX_AGE_DAYS = 7`.
- Cap per fonte con `MAX_ITEMS_PER_SOURCE = 10`.
- Ordinamento finale: priorità fonte (1 > 2) → recency.

### 4.3 `supabase/functions/sync-news/index.ts`
Edge Function Deno che:
1. Chiama il parser.
2. Upsert su `news_items` con `ON CONFLICT (hash) DO UPDATE` per refresh metadati.
3. Cancella le notizie più vecchie di `MAX_AGE_DAYS`.
4. Logga metriche (n. notizie per fonte, errori).
Schedulata via `pg_cron` ogni 15 minuti.

### 4.4 `components/slips/SlipTracker.tsx`
- Subscription Supabase Realtime al canale `slip:{id}`.
- Barra di progresso gialla animata (`framer-motion` `useSpring`).
- Stato per ogni pick (won / lost / pending) con icona colorata.
- Calcolo vincita potenziale aggiornata live.
- Pull-to-refresh su mobile + skeleton loading.

### 4.5 `lib/supabase/server.ts` e `client.ts`
- Pattern ufficiale `@supabase/ssr` per Next.js 15.
- Cookie handling sicuro con `cookies()` di Next.
- `service.ts` separato che usa la `service_role` key — usato **solo** in Edge Functions e Server Actions privilegiate.

### 4.6 `server/actions/follow.ts`
Server Action `toggleFollow(entityType, entityId)`:
- Verifica autenticazione.
- Upsert/delete su `follows`.
- `revalidateTag('user-follows')` per invalidare cache.
- Ritorna stato nuovo per optimistic UI.

### 4.7 `server/actions/slips.ts`
- `createSlip(picks, stake)` con validazione zod.
- `addPickToSlip(slipId, pick)`.
- `cancelSlip(slipId)`.
- Tutto con error handling tipizzato (`{ ok: true, data } | { ok: false, error }`).

---

## 5. Prompt per Generare il Logo

Usa questo prompt su **Midjourney v6**, **Ideogram**, **DALL-E 3** o **Flux Pro**.

### Prompt principale (versione completa)

```
Modern minimalist sports brand logo for "On The Corner" (OTC), featuring a
stylized soccer corner flag at a dynamic 45-degree angle, the flag rendered
in vibrant solid yellow (#e8c800) against a deep matte black background
(#080808). Sharp geometric lines, slight motion blur on the flag edge to
suggest movement and energy, clean vector style with no gradients except a
subtle inner shadow on the flagpole. The flag forms a sharp triangular
silhouette that doubles as a corner-of-pitch icon. Premium urban sports
aesthetic, professional broadcast quality, monoline construction, perfectly
balanced, symmetric tension. Wordmark "ON THE CORNER" set in heavy
condensed sans-serif (Archivo Black style) below the icon, tight letter
spacing, all caps, yellow on black. Variant: standalone "OTC" monogram
also generated. Designed for app icon, favicon, social media avatar, and
large-format display. Flat 2D, no 3D rendering, no photorealism, ultra-sharp
edges, isolated subject, transparent background, vector-ready, 4K resolution.
--ar 1:1 --style raw --v 6
```

### Variante per app icon (più stretta)

```
App icon for sports betting tracker "OTC", bold yellow (#e8c800) corner
flag silhouette on solid deep black (#080808), tilted 30 degrees, minimal
geometric construction, rounded square iOS-style container, no text, no
gradient, premium and recognizable at 32px, vector flat design.
--ar 1:1 --v 6
```

### Linee guida per la generazione

- Genera **almeno 4 varianti**: full lockup, icon only, monogram OTC, monocromo (per stampa).
- Verifica il logo a 32×32 px: deve restare leggibile.
- Esporta in SVG via tracing (es. `vectorizer.ai` o `recraft.ai` se l'AI esce in PNG).
- Test contrasto WCAG: giallo su nero → ratio ~13:1, ampiamente AAA.

---

## 6. Roadmap di Sviluppo

8 settimane a regime full-time. Comprime a 6 settimane se rinunci a gamification avanzata e PWA offline.

### Settimana 1 — Fondamenta
- Setup Next.js 15 + TS + Tailwind + shadcn/ui + Framer Motion.
- Design system: tokens colore (#080808, #e8c800), tipografia (Archivo Black, DM Mono), spaziature, ombre, animazioni base.
- Componenti UI base: Button, Card, Input, Dialog, Sheet, Toast.
- Layout root: Header + BottomNav (mobile) + SideNav (desktop).
- Setup Supabase, migrazione schema iniziale, RLS policies, types generation.
- Auth: signup/login/logout, OAuth Google, middleware sessione.
- Deploy preview su Vercel.

**Deliverable**: app navigabile vuota con auth funzionante e design system completo.

### Settimana 2 — Notizie
- Implementazione `lib/rss/parser.ts` con tutte le 19 fonti.
- Edge Function `sync-news` + cron 15 minuti.
- Tabella `news_items` + RLS + indici full-text search.
- Pagina Homepage + pagina News con infinite scroll.
- Componenti `NewsCard`, `NewsList`, hero "In Evidenza".
- Sistema bookmark con optimistic UI.
- Filtri: per fonte, per lingua, per data.

**Deliverable**: feed notizie aggregato e bookmarkabile, completamente funzionante.

### Settimana 3 — Follow & Squadre
- Integrazione API-Football: pull leghe + squadre principali (Serie A, Premier, Liga, Champions, F1, ATP).
- Pagina catalogo team/leghe con ricerca.
- Tabella `follows` polimorfica + Server Action `toggleFollow`.
- Filtro homepage per "solo i miei team".
- Push notifications setup (OneSignal): notifica al match dei team seguiti.

**Deliverable**: utente può seguire entità e ricevere il feed personalizzato.

### Settimana 4 — Live Scores & Match Detail
- Edge Function `sync-matches` ogni 60 secondi durante eventi live.
- Pagina Live con scoreboard in tempo reale (Realtime subscription).
- Match Detail page: lineup, eventi (gol, cartellini), statistiche, head-to-head.
- Calendario partite future + countdown.

**Deliverable**: sezione Live e match detail pronti per l'uso quotidiano.

### Settimana 5 — Schedine
- Slip Builder: aggiungi pick da match detail, calcolo quota totale.
- Tabelle `slips`, `slip_picks`, `bankroll_transactions`.
- `SlipTracker` con Realtime, barra gialla animata, calcolo vincita potenziale.
- Server Actions create/update/cancel slip.
- Edge Function `settle-slips`: ogni 5 minuti chiude le schedine con tutti i match conclusi.
- Notifica push a esito.

**Deliverable**: ciclo completo crea → traccia → chiudi schedina.

### Settimana 6 — Dashboard & Analytics
- Aggregazioni: ROI, win rate, profitto/perdita, streak, miglior sport.
- Grafici Recharts: andamento bankroll, distribuzione per sport, calendario heatmap.
- Bankroll Manager: depositi/prelievi manuali, soglie di alert.
- Export CSV delle schedine.

**Deliverable**: dashboard utente di livello pro.

### Settimana 7 — Gamification & Polish
- Sistema badge: definizione 20+ badge (prima schedina, 10 vittorie consecutive, etc.).
- Trigger Postgres che assegnano badge automaticamente.
- Leaderboard pubblica con vista materializzata (top 100 per ROI/streak).
- Toggle tema (anche se dark è il primario).
- Animazioni Framer Motion su ogni transizione di pagina.
- Ricerca globale (Cmd+K stile Linear) con risultati da news, team, partite.

**Deliverable**: app più "viva" e divertente da usare.

### Settimana 8 — PWA, QA, Launch
- PWA: manifest, service worker (next-pwa o `serwist`), offline page, installabile su iOS/Android.
- Audit Lighthouse: target ≥90 su tutte le metriche.
- Audit a11y con axe-core.
- Test e2e con Playwright su flussi critici (auth, follow, slip).
- Bug bash, sentinel monitoring (Sentry free tier).
- Documentazione utente in-app (onboarding tour).
- Soft launch beta con utenti del sito Hostinger attuale.
- Launch pubblico.

**Deliverable**: app pronta in produzione.

---

## 7. Strategia di Migrazione

### Fase 0 — Audit dell'attuale (giorno 0)
- Inventario contenuti del sito Hostinger: pagine, asset, eventuale database/utenti, URL indicizzati su Google (Search Console).
- Esporta tutti gli utenti registrati (se presenti) in CSV con `email`, `data_iscrizione`.
- Backup completo Hostinger (FTP + DB dump se MySQL).
- Annota i top 20 URL per traffico organico → andranno preservati o rediretti.

### Fase 1 — Sviluppo parallelo (settimane 1–7)
- Nuovo progetto deployato su **`beta.onthecorner.it`** (sottodominio Vercel).
- Il sito Hostinger su `www.onthecorner.it` resta **online e intatto**.
- Aggiungi banner discreto sul vecchio sito: "Stiamo costruendo qualcosa di nuovo — prova la beta".
- Onboard 10–30 beta tester (utenti più attivi) → feedback iteration.

### Fase 2 — Import utenti (settimana 7)
- Script `scripts/import-legacy-users.ts`: legge il CSV ed esegue `supabase.auth.admin.createUser({ email, email_confirm: false })` per ognuno.
- Invia email transazionale (Resend free 100/giorno o Supabase SMTP): "On The Corner ha una nuova casa — clicca per impostare la password".
- Gli utenti accedono al nuovo sito mantenendo la stessa email.

### Fase 3 — Cutover DNS (settimana 8, finestra notturna)

```
T-7 giorni:  Abbassa TTL DNS attuale a 300s (5 minuti)
T-0:         Snapshot finale dei dati Hostinger
T-0 + 5min:  Modifica record A/CNAME del dominio principale:
             www.onthecorner.it → Vercel (CNAME cname.vercel-dns.com)
             onthecorner.it     → Vercel (A 76.76.21.21)
T-0 + 10min: Verifica propagazione (dig +short, whatsmydns.net)
T-0 + 15min: Smoke test su tutte le route critiche
T-0 + 30min: Abilita HSTS, ricontrolla HTTPS
```

- Mantieni Hostinger attivo per ~30 giorni come fallback (sito raggiungibile via `legacy.onthecorner.it`).

### Fase 4 — SEO preservato
- Mappa i top URL del vecchio sito → corrispondenti nuovi:
  ```
  /news/calcio        → /news?league=calcio
  /partite-oggi       → /live
  /schedina-XXX       → /slips/XXX  (se id era pubblico)
  ```
- Implementa in `next.config.ts`:
  ```ts
  async redirects() {
    return [
      { source: '/news/calcio', destination: '/news?league=calcio', permanent: true },
      // ...altri redirect 301
    ];
  }
  ```
- Aggiorna `sitemap.xml` e risottometti a Google Search Console.
- Mantieni i 301 attivi per **almeno 12 mesi**.

### Fase 5 — Decommissioning (mese 2)
- Esporta backup definitivo del vecchio Hostinger.
- Disattiva account hosting → risparmio mensile.
- Domain registration: porta su Cloudflare Registrar (a costo) o lascia su Hostinger solo come registrar (DNS già su Cloudflare/Vercel).

### Comunicazione utenti
- Email pre-launch (T-14 giorni): "Stiamo per evolverci".
- Email launch day: "Siamo online! Imposta la tua nuova password".
- Post launch (T+7): survey rapida ("Cosa pensi della nuova On The Corner?").
- In-app: tour onboarding al primo accesso.

### Rollback plan
Se nelle prime 48h emerge un problema critico:
1. Riporta i record DNS al vecchio Hostinger (TTL basso → propaga rapido).
2. Comunica trasparentemente agli utenti.
3. Fixa, riprova cutover dopo 7 giorni.

---

## Variabili d'Ambiente (`.env.local.example`)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=         # MAI esporre lato client

# API-Football (RapidAPI free tier)
API_FOOTBALL_KEY=

# TheSportsDB
THESPORTSDB_KEY=3                  # 3 = free tier pubblico

# OneSignal
NEXT_PUBLIC_ONESIGNAL_APP_ID=
ONESIGNAL_REST_API_KEY=

# Site
NEXT_PUBLIC_SITE_URL=https://onthecorner.it
```

---

## Comandi di Setup Rapido

```bash
# 1. Clona la base
npx create-next-app@latest on-the-corner --typescript --tailwind --app --turbopack

# 2. Dipendenze core
cd on-the-corner
npm i @supabase/ssr @supabase/supabase-js
npm i framer-motion lucide-react recharts
npm i fast-xml-parser
npm i react-onesignal
npm i zod sonner date-fns
npm i -D @types/node

# 3. shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card dialog sheet input toast skeleton

# 4. Supabase CLI
npm i -D supabase
npx supabase init
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push                  # applica schema.sql
npx supabase gen types typescript --linked > types/database.types.ts

# 5. Deploy Edge Functions
npx supabase functions deploy sync-news
npx supabase functions deploy sync-matches
npx supabase functions deploy settle-slips

# 6. Schedula con pg_cron (da SQL editor Supabase):
# vedi database/schema.sql sezione finale
```

---

## Note di Qualità

- **TypeScript strict mode** sempre attivo (`"strict": true`, `"noUncheckedIndexedAccess": true`).
- **ESLint + Prettier + lint-staged** preconfigurati.
- **Conventional Commits** + Changesets per il versioning.
- **Sentry** free tier per error tracking in produzione.
- **Vercel Analytics** o Plausible self-hosted (gratis su Supabase) per le metriche.

---

*Documento generato come blueprint di partenza. Adatta nomi, valori e priorità al tuo contesto. Buon lavoro — `On The Corner` è pronto a prendere posizione.*
