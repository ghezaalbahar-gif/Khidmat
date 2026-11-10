import { ArrowRight } from 'lucide-react';
import type { Category } from '@/data/catalog';
import { useStagger } from '@/lib/motion';

type Props = { category: Category; count: number; onClick: (name: string) => void; index?: number; note?: string };

export default function CategoryTile({ category, count, onClick, index = 0, note }: Props) {
  const delay = useStagger(index, 60);
  const Icon = category.icon;

  return (
    <button
      type="button"
      data-reveal
      style={delay}
      onClick={() => onClick(category.name)}
      className="tile group rounded-2xl border border-line bg-white p-4 text-left sm:p-5"
      data-cursor="card"
    >
      <span className={`tile-icon mb-7 grid h-12 w-12 place-items-center rounded-xl ${category.tint} ${category.accent}`}>
        <Icon size={22} />
      </span>
      <span className="block font-display text-[.95rem] font-bold tracking-[-.01em] text-ink-soft">{category.name}</span>
      <span className="mt-1 block text-xs leading-5 text-ink-faint">{note ?? category.blurb}</span>
      <span className="mt-3 flex items-center gap-1.5 text-[.72rem] font-bold uppercase tracking-[.12em] text-brand-600">
        {count} listed
        <ArrowRight size={13} className="tile-arrow" />
      </span>
    </button>
  );
}
