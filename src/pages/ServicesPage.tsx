import { useMemo, useState } from 'react';
import { ArrowLeftRight, MapPin, Search, SlidersHorizontal } from 'lucide-react';
import type { Service } from '@/data/catalog';
import { categories, services } from '@/data/catalog';
import ServiceRow from '@/components/ServiceRow';
import CategoryTile from '@/components/CategoryTile';
import ActionButton from '@/components/ActionButton';
import { useStagger } from '@/lib/motion';

type Props = {
  search: string;
  setSearch: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  onProvider: (service: Service) => void;
  onBook: (service: Service) => void;
  onBrowseCategories: () => void;
};

const sorts = [
  { label: 'Recommended', value: 'recommended' },
  { label: 'Highest rated', value: 'rating' },
  { label: 'Most reviewed', value: 'reviews' },
  { label: 'Price: low to high', value: 'price' },
] as const;

type Sort = (typeof sorts)[number]['value'];

const areas = ['All of Kabul', ...Array.from(new Set(services.map((service) => service.location)))];

export default function ServicesPage({ search, setSearch, category, setCategory, onProvider, onBook, onBrowseCategories }: Props) {
  const [sort, setSort] = useState<Sort>('recommended');
  const [maxPrice, setMaxPrice] = useState('Any price');
  const [area, setArea] = useState(areas[0]);

  const results = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const ceiling = maxPrice === 'Under AFN 1,000' ? 1000 : maxPrice === 'AFN 1,000 – 2,000' ? 2000 : Number.POSITIVE_INFINITY;
    const matched = services.filter((service) => {
      const haystack = `${service.title} ${service.provider} ${service.category} ${service.location} ${service.description}`.toLowerCase();
      return (category === 'All services' || service.category === category)
        && (area === areas[0] || service.location === area)
        && haystack.includes(needle)
        && service.price <= ceiling;
    });
    const order: Record<Sort, (a: Service, b: Service) => number> = {
      recommended: (a, b) => b.rating * b.reviews - a.rating * a.reviews,
      rating: (a, b) => b.rating - a.rating,
      reviews: (a, b) => b.reviews - a.reviews,
      price: (a, b) => a.price - b.price,
    };
    return [...matched].sort(order[sort]);
  }, [search, category, sort, maxPrice, area]);

  const clearAll = () => { setSearch(''); setCategory('All services'); setMaxPrice('Any price'); setArea(areas[0]); };
  const activeFilters = [category !== 'All services', Boolean(search.trim()), maxPrice !== 'Any price', area !== areas[0]].filter(Boolean).length;

  return (
    <main className="page-shell">
      <section className="band relative overflow-hidden border-b border-line">
        <div className="dotted pointer-events-none absolute inset-x-0 bottom-0 h-40 opacity-40" />
        <div className="relative mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-[4.5rem]">
          <p className="eyebrow">Find your next helping hand</p>
          <h1 className="mt-4 max-w-3xl font-display text-display-sm text-ink">Services made simple, priced in the open.</h1>
          <p className="mt-5 max-w-xl prose-khidmat">
            Browse {services.length} listed services from {new Set(services.map((service) => service.provider)).size} professionals working across Kabul.
          </p>

          <div className="search-shell mt-9 flex flex-col gap-2 rounded-2xl border border-line bg-white p-2 shadow-card sm:flex-row sm:items-center sm:rounded-full">
            <label className="flex flex-1 items-center gap-3 px-3.5 py-2.5">
              <Search size={19} className="shrink-0 text-brand-600" />
              <span className="sr-only">Search services</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search a service, professional, or neighbourhood"
                className="w-full bg-transparent text-[.95rem] text-ink-soft outline-none placeholder:text-ink-faint"
              />
            </label>
            <span className="hidden h-7 w-px bg-line sm:block" />
            <label className="flex items-center gap-2.5 px-3.5 py-2.5 sm:w-[11rem]">
              <MapPin size={17} className="shrink-0 text-brand-600" />
              <span className="sr-only">Area</span>
              <select value={area} onChange={(event) => setArea(event.target.value)} className="w-full bg-transparent text-sm font-semibold text-ink-soft outline-none">
                {areas.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 sm:w-[10.5rem]">
              <SlidersHorizontal size={17} className="shrink-0 text-brand-600" />
              <span className="sr-only">Price</span>
              <select
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-ink-soft outline-none"
              >
                {['Any price', 'Under AFN 1,000', 'AFN 1,000 – 2,000'].map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 sm:w-[11.5rem]">
              <ArrowLeftRight size={17} className="shrink-0 text-brand-600" />
              <span className="sr-only">Sort results</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as Sort)}
                className="w-full bg-transparent text-sm font-semibold text-ink-soft outline-none"
              >
                {sorts.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </div>

          <div className="chip-row mt-6 flex gap-2 overflow-x-auto pb-1">
            {['All services', ...categories.map((categoryItem) => categoryItem.name)].map((name, index) => (
              <CategoryPill key={name} name={name} active={category === name} onSelect={setCategory} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8 lg:py-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-muted">
            <strong className="font-display text-[1.05rem] text-ink">{results.length}</strong>
            {results.length === 1 ? ' professional' : ' professionals'}
            {category === 'All services' ? ' across Kabul' : ` in ${category}`}
            {activeFilters > 0 && <span className="ml-2 text-ink-faint">· {activeFilters} filter{activeFilters > 1 ? 's' : ''} applied</span>}
          </p>
          <div className="flex items-center gap-3">
            {activeFilters > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="btn-link text-ink-muted"
              >
                Clear filters
              </button>
            )}
            <span className="text-xs uppercase tracking-[.14em] text-ink-faint">Sorted by {sorts.find((item) => item.value === sort)?.label}</span>
          </div>
        </div>

        {results.length ? (
          <div className="mt-7 space-y-4">
            {results.map((service, index) => (
              <ServiceRow key={service.id} service={service} index={index} onProvider={onProvider} onBook={onBook} />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid overflow-hidden rounded-sheet border border-line bg-white shadow-card sm:grid-cols-[1.15fr_1fr]">
            <div className="p-8 sm:p-10">
              <p className="eyebrow">Nothing matches — yet</p>
              <h2 className="mt-3 font-display text-title text-ink">Try a wider search.</h2>
              <p className="mt-4 prose-khidmat">
                Kabul professionals list many jobs under one roof. Clearing a filter is usually all it takes.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <ActionButton kind="brand" onClick={clearAll}>Clear all filters</ActionButton>
                <ActionButton kind="quiet" onClick={onBrowseCategories}>Browse categories</ActionButton>
              </div>
            </div>
            <div className="relative min-h-[12rem]">
              <img src={services[3].image} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-mist/85 via-mist/20 to-transparent" />
            </div>
          </div>
        )}
      </section>

      <section id="category-rail" className="mx-auto max-w-7xl scroll-mt-24 px-5 pb-16 lg:px-8 lg:pb-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Explore by need</p>
            <h2 className="mt-2 font-display text-title text-ink">Pick a lane, get straight to it.</h2>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((categoryItem, index) => (
            <CategoryTile
              key={categoryItem.name}
              category={categoryItem}
              index={index}
              count={services.filter((service) => service.category === categoryItem.name).length}
              onClick={setCategory}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function CategoryPill({ name, active, onSelect, index }: { name: string; active: boolean; onSelect: (value: string) => void; index: number }) {
  const delay = useStagger(index, 40);
  return (
    <button
      type="button"
      data-reveal
      style={delay}
      onClick={() => onSelect(name)}
      className={`pill whitespace-nowrap px-4 py-2 text-sm font-semibold ${
        active ? 'bg-brand-600 text-white shadow-[0_10px_20px_-12px_rgba(18,105,79,.8)]' : 'border border-line bg-white text-ink-soft hover:border-brand-300 hover:bg-brand-50'
      }`}
    >
      {name}
    </button>
  );
}
