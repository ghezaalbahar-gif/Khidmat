import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

type Kind = 'brand' | 'ember' | 'quiet' | 'glass' | 'link';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  kind?: Kind;
  size?: Size;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  icon?: ReactNode;
  arrow?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
  full?: boolean;
  className?: string;
  ariaLabel?: string;
};

const skins: Record<Kind, string> = {
  brand: 'btn btn-brand',
  ember: 'btn btn-ember',
  quiet: 'btn btn-quiet',
  glass: 'btn btn-glass',
  link: 'btn btn-link',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-3 text-[.95rem]',
  lg: 'px-6 py-3.5 text-base',
};

/**
 * One button for the whole site. Each kind owns a different hover personality:
 * brand sweeps light, ember deepens, quiet answers with its border, glass lifts
 * off dark surfaces, link draws a rule.
 */
export default function ActionButton({
  kind = 'brand', size = 'md', href, onClick, children, icon, arrow = false,
  disabled, type = 'button', full = false, className = '', ariaLabel,
}: Props) {
  const body = (
    <>
      {icon}
      <span>{children}</span>
      {arrow && <ArrowRight size={size === 'lg' ? 19 : 17} data-arrow />}
    </>
  );

  const sizing = kind === 'link' ? 'text-[.95rem]' : sizes[size];
  const classes = `${skins[kind]} ${sizing} ${full ? 'w-full' : ''} ${disabled ? 'pointer-events-none opacity-60' : ''} ${className}`;

  if (href) {
    return (
      <a href={href} onClick={onClick} className={classes} aria-label={ariaLabel}>
        {body}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} aria-label={ariaLabel}>
      {body}
    </button>
  );
}
