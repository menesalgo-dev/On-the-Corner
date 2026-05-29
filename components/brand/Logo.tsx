/**
 * components/brand/Logo.tsx
 *
 * Logo "On The Corner" in SVG inline:
 * - Bandierina gialla (#e8c800)
 * - Testo "ON THE CORNER" su 3 righe come nel design originale
 * - Linea curva (calcio d'angolo) bianca
 * - Pallone bianco con stitch nero
 *
 * 3 varianti d'uso:
 * - <Logo /> → solo simbolo (mobile, favicon, footer)
 * - <Logo full /> → simbolo + wordmark completo (header desktop)
 * - <Logo compact /> → simbolo piccolo + testo orizzontale ridotto
 *
 * Sempre wrappato in <Link href="/"> nel componente <LogoLink />
 * per cliccare e tornare alla home.
 */

import Link from 'next/link'

const COLORS = {
  flag: '#e8c800',
  line: '#ffffff',
  text: '#ffffff',
  ballWhite: '#ffffff',
  ballBlack: '#080808',
}

interface LogoProps {
  /** Mostra il wordmark "ON THE CORNER" su 3 righe (versione completa) */
  full?: boolean
  /** Versione orizzontale compatta (simbolo + scritta inline) */
  compact?: boolean
  /** Altezza in px del simbolo. Default: 40 */
  size?: number
  className?: string
}

export function Logo({ full = false, compact = false, size = 40, className = '' }: LogoProps) {
  // Versione FULL: replica fedele del logo che mi hai mandato
  if (full) {
    const w = size * 4
    const h = size * 4
    return (
      <svg
        width={w}
        height={h}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="On The Corner"
        role="img"
        className={className}
      >
        {/* Asta bandierina + bandierina gialla */}
        <line x1="40" y1="30" x2="40" y2="90" stroke={COLORS.line} strokeWidth="3" strokeLinecap="round" />
        <path d="M 40 30 L 70 36 L 40 50 Z" fill={COLORS.flag} />

        {/* Linea curva del corner (parte verticale + curva + orizzontale) */}
        <path
          d="M 40 90 L 40 150 Q 40 165 55 165 L 165 165"
          stroke={COLORS.line}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* Testo "ON" - "THE" - "CORNER" su 3 righe */}
        <text x="55" y="100" fontFamily="Archivo Black, sans-serif" fontSize="22" fontWeight="900" fill={COLORS.text}>
          ON
        </text>
        <text x="55" y="125" fontFamily="Archivo Black, sans-serif" fontSize="22" fontWeight="900" fill={COLORS.text}>
          THE
        </text>
        <text x="55" y="155" fontFamily="Archivo Black, sans-serif" fontSize="22" fontWeight="900" fill={COLORS.text}>
          CORNER
        </text>

        {/* Pallone in basso a destra */}
        <g transform="translate(165, 165)">
          <circle cx="0" cy="0" r="11" fill={COLORS.ballWhite} stroke={COLORS.ballBlack} strokeWidth="1.5" />
          {/* Pentagono centrale */}
          <path d="M -3.5 -2 L 0 -5 L 3.5 -2 L 2.2 2.5 L -2.2 2.5 Z" fill={COLORS.ballBlack} />
          {/* Linee */}
          <line x1="-3.5" y1="-2" x2="-8" y2="-5" stroke={COLORS.ballBlack} strokeWidth="0.8" />
          <line x1="3.5" y1="-2" x2="8" y2="-5" stroke={COLORS.ballBlack} strokeWidth="0.8" />
          <line x1="-2.2" y1="2.5" x2="-5" y2="7" stroke={COLORS.ballBlack} strokeWidth="0.8" />
          <line x1="2.2" y1="2.5" x2="5" y2="7" stroke={COLORS.ballBlack} strokeWidth="0.8" />
        </g>
      </svg>
    )
  }

  // Versione COMPACT: simbolo piccolo a sinistra + testo orizzontale
  if (compact) {
    return (
      <span className={`inline-flex items-center gap-2.5 ${className}`}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Asta */}
          <line x1="10" y1="10" x2="10" y2="40" stroke={COLORS.line} strokeWidth="2.5" strokeLinecap="round" />
          {/* Bandiera gialla */}
          <path d="M 10 10 L 28 13 L 10 22 Z" fill={COLORS.flag} />
          {/* Curva corner */}
          <path
            d="M 10 40 Q 10 54 24 54 L 52 54"
            stroke={COLORS.line}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Pallone */}
          <circle cx="52" cy="54" r="6" fill={COLORS.ballWhite} stroke={COLORS.ballBlack} strokeWidth="1" />
          <path d="M 50 52.5 L 52 50.5 L 54 52.5 L 53.2 55 L 50.8 55 Z" fill={COLORS.ballBlack} />
        </svg>
        <span
          className="text-base uppercase leading-none tracking-tight text-white sm:text-lg"
          style={{ fontFamily: 'var(--font-archivo-black)' }}
        >
          On The <span style={{ color: COLORS.flag }}>Corner</span>
        </span>
      </span>
    )
  }

  // Versione DEFAULT: solo simbolo piccolo (per favicon, mobile, footer)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="On The Corner"
      role="img"
      className={className}
    >
      <line x1="10" y1="10" x2="10" y2="40" stroke={COLORS.line} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 10 10 L 28 13 L 10 22 Z" fill={COLORS.flag} />
      <path
        d="M 10 40 Q 10 54 24 54 L 52 54"
        stroke={COLORS.line}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="52" cy="54" r="6" fill={COLORS.ballWhite} stroke={COLORS.ballBlack} strokeWidth="1" />
      <path d="M 50 52.5 L 52 50.5 L 54 52.5 L 53.2 55 L 50.8 55 Z" fill={COLORS.ballBlack} />
    </svg>
  )
}

/**
 * Wrapper cliccabile per tornare alla home.
 * Da usare in Header, Footer, e ovunque serva un logo navigabile.
 */
export function LogoLink({
  full = false,
  compact = true,
  size = 36,
  className = '',
}: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="On The Corner – Vai alla home"
      className={`inline-flex items-center transition-opacity hover:opacity-80 ${className}`}
    >
      <Logo full={full} compact={compact} size={size} />
    </Link>
  )
}
