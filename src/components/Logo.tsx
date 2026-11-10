type LogoProps = { size?: 'sm' | 'md' | 'lg'; tone?: 'ink' | 'light'; className?: string };

const marks = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12' };
const words = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' };

/** The Khidmat house-over-hands glyph, drawn so it stays crisp at favicon size. */
export function LogoGlyph({ className = 'h-[58%] w-[58%]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4.4 11.6 12 5.1l7.6 6.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.1 14.2c0 3.5 2.7 5.7 5.9 5.7s5.9-2.2 5.9-5.7" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <circle cx="12" cy="17.4" r="1.15" fill="var(--ember)" />
    </svg>
  );
}

export default function Logo({ size = 'md', tone = 'ink', className = '' }: LogoProps) {
  const light = tone === 'light';
  return (
    <span className={`logo-lockup group inline-flex items-center gap-2.5 ${className}`}>
      <span className={`logo-mark grid place-items-center text-white ${marks[size]}`}>
        <LogoGlyph />
      </span>
      <span className={`logo-word ${words[size]} ${light ? '!text-white' : ''}`}>
        khidmat<span className="dot">.</span>
      </span>
    </span>
  );
}
