import { Star } from 'lucide-react';

type Props = { value: number; count?: number; size?: number; animate?: boolean; label?: string };

/** Rating row where the filled layer is clipped to the real score, so 4.8 looks 4.8. */
export default function Rating({ value, count, size = 15, animate = false, label }: Props) {
  const percent = Math.max(0, Math.min(100, (value / 5) * 100));
  const row = (filled: boolean) => (
    <span className="flex items-center gap-0.5" aria-hidden={filled}>
      {[0, 1, 2, 3, 4].map((index) => (
        <Star
          key={index}
          size={size}
          fill={filled ? 'currentColor' : 'none'}
          className={filled && animate ? 'animate-star-in' : undefined}
          style={filled && animate ? { animationDelay: `${index * 90}ms` } : undefined}
        />
      ))}
    </span>
  );

  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative inline-flex">
        <span className="text-line-strong opacity-70">{row(false)}</span>
        <span className="absolute inset-0 overflow-hidden text-ember-600" style={{ width: `${percent}%` }}>
          {row(true)}
        </span>
      </span>
      <span className="text-sm font-bold text-ember-800">
        {value.toFixed(1)}
        {count !== undefined && <span className="ml-1 font-normal text-ember-800/55">({count})</span>}
      </span>
      {label && <span className="text-xs text-ink-muted">{label}</span>}
    </span>
  );
}
