/**
 * components/brand/Logo.tsx
 * Logo "On The Corner": bandierina d'angolo SVG inline + wordmark.
 */
interface LogoProps {
  withWordmark?: boolean;
  size?: number;
  className?: string;
}

export function Logo({ withWordmark = false, size = 40, className }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="On The Corner logo"
        role="img"
      >
        <path
          d="M 8 56 Q 8 22 42 22"
          stroke="#e8c800"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        <line x1="42" y1="22" x2="42" y2="56" stroke="#e8c800" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 42 22 L 60 26 L 42 34 Z" fill="#e8c800" />
        <line x1="6" y1="58" x2="58" y2="58" stroke="#e8c800" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      </svg>

      {withWordmark && (
        <span
          className="uppercase tracking-tight text-white"
          style={{
            fontFamily: 'var(--font-archivo-black)',
            fontSize: size * 0.45,
            lineHeight: 1,
          }}
        >
          On The <span className="text-[#e8c800]">Corner</span>
        </span>
      )}
    </span>
  );
}
