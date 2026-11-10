import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { BadgeCheck, Bell, Check, Search, ShieldCheck, Star, TrendingUp } from 'lucide-react';
import { categories, services } from '@/data/catalog';
import ActionButton from '@/components/ActionButton';
import Rating from '@/components/Rating';
import { useCountUp, useParallax, usePrefersReducedMotion } from '@/lib/motion';

type Props = {
  onSearch: (term: string) => void;
  onCategory: (name: string) => void;
  onJoin: () => void;
};

const incoming = [
  { who: 'Farzana S.', what: 'Deep home cleaning', where: 'Shahr-e-Naw', when: 'Tomorrow, morning' },
  { who: 'Ahmad W.', what: 'Leak & pipe repair', where: 'Karte Parwan', when: 'Friday, midday' },
  { who: 'Omid R.', what: 'Electrical inspection', where: 'Wazir Akbar Khan', when: 'Saturday, afternoon' },
];

export default function HomeHero({ onSearch, onCategory, onJoin }: Props) {
  const [term, setTerm] = useState('');
  const [request, setRequest] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const reduced = usePrefersReducedMotion();
  const glow = useParallax(18);
  const cards = useParallax(-26);
  const sectionRef = useRef<HTMLElement | null>(null);

  const pros = new Set(services.map((service) => service.provider)).size;
  const jobs = services.reduce((sum, service) => sum + service.jobsDone, 0);
  const avg = services.reduce((sum, service) => sum + service.rating, 0) / services.length;
  const reviews = services.reduce((sum, service) => sum + service.reviews, 0);
  const counters = [
    useCountUp(pros, { duration: 1100 }),
    useCountUp(jobs, { duration: 1500 }),
    useCountUp(avg, { duration: 1300, decimals: 1 }),
  ];

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setAccepted(false);
      setRequest((current) => (current + 1) % incoming.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    const id = window.setTimeout(() => setAccepted(true), 1600);
    return () => window.clearTimeout(id);
  }, [request, reduced]);

  const live = incoming[request];

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* ambient layers */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(72%_58%_at_78%_18%,rgba(215,239,224,.92),transparent_66%),linear-gradient(178deg,#fbfcfa_0%,#f2f7f2_58%,#f9faf8_100%)]" />
      <div className="dotted pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-45" />
      <div
        ref={glow.layerRef}
        className="pointer-events-none absolute -right-24 top-10 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(79,168,127,.42),transparent_65%)] blur-2xl"
        style={{ transform: 'translate3d(var(--px, 0), var(--py, 0), 0)' }}
      />

      <div ref={glow.hostRef} className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-14 lg:grid-cols-[1.03fr_.97fr] lg:gap-8 lg:px-8 lg:pb-24 lg:pt-[4.5rem]">
        {/* ---------------------------------------------------------- copy -- */}
        <div className="animate-rise-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-white/75 px-3.5 py-2 text-[.68rem] font-bold uppercase tracking-[.16em] text-brand-600 shadow-card backdrop-blur">
            <span className="relative grid h-2.5 w-2.5 place-items-center">
              <span className="absolute inset-0 rounded-full bg-brand-500 animate-pulse-ring" />
              <span className="h-2 w-2 rounded-full bg-brand-500" />
            </span>
            Serving Kabul, Afghanistan
          </span>

          <h1 className="mt-6 font-display text-display text-balance text-ink">
            Good work starts with <span className="relative inline-block text-brand-600">the right person.
              <span className="absolute -bottom-1 left-0 h-[10px] w-full rounded-full bg-ember-400/40" />
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lead leading-8 text-ink-muted">
            From quick fixes to bigger projects, find trusted local professionals who care about doing the job right.
          </p>

          {/* Thumbtack-style entry point: the search is the primary action. */}
          <form
            onSubmit={(event) => { event.preventDefault(); onSearch(term.trim()); }}
            className="search-shell mt-8 flex flex-col gap-2 rounded-2xl border border-line bg-white p-2 shadow-card sm:flex-row sm:items-center sm:rounded-full"
          >
            <label className="flex flex-1 items-center gap-3 px-3.5 py-2.5">
              <Search size={19} className="shrink-0 text-brand-600" />
              <span className="sr-only">Search for a service</span>
              <input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="What do you need done? Try “leak”, “painting”…"
                className="w-full bg-transparent text-[.95rem] text-ink-soft outline-none placeholder:text-ink-faint"
              />
            </label>
            <span className="hidden h-7 w-px bg-line sm:block" />
            <span className="hidden items-center gap-2 px-3 text-sm font-semibold text-ink-muted sm:flex">
              <BadgeCheck size={16} className="text-brand-500" /> Kabul
            </span>
            <ActionButton kind="brand" type="submit" arrow className="shrink-0">Find pros</ActionButton>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-[.14em] text-ink-faint">Popular:</span>
            {categories.slice(0, 4).map((category) => (
              <button
                key={category.name}
                type="button"
                onClick={() => onCategory(category.name)}
                className="pill border border-line bg-white/80 px-3.5 py-1.5 text-[.8rem] font-semibold text-ink-soft hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                {category.name}
              </button>
            ))}
          </div>

          <dl className="mt-11 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6">
            {[
              { label: 'Local pros listed', value: counters[0].display, ref: counters[0].ref },
              { label: 'Jobs shown in profiles', value: counters[1].display, ref: counters[1].ref },
              { label: 'Average rating', value: counters[2].display, ref: counters[2].ref },
            ].map((stat) => (
              <div key={stat.label}>
                <span ref={stat.ref} className="block font-display text-[1.75rem] font-extrabold leading-none tracking-[-.05em] text-ink">{stat.value}</span>
                <dt className="mt-2 text-[.78rem] leading-5 text-ink-faint">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* -------------------------------------------------------- visual -- */}
        <div ref={cards.hostRef} className="relative mx-auto w-full max-w-[560px]">
          <div
            ref={cards.layerRef}
            data-tilt
            className="media-frame relative h-[24rem] w-full sm:h-[30rem] lg:h-[33rem]"
            style={{ transform: 'perspective(1000px) rotateX(var(--tilt-x,0deg)) rotateY(var(--tilt-y,0deg)) translate3d(var(--px,0), var(--py,0), 0)' }}
          >
            <img src={services[1].image} alt="A professional preparing a home in Kabul for a customer" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/62 via-ink-deep/5 to-transparent" />
            <div className="absolute left-5 right-5 top-5 flex items-center justify-between gap-4 rounded-2xl border border-white/25 bg-white/12 p-4 backdrop-blur-md sm:right-[42%]">
              <div>
                <p className="text-[.62rem] font-bold uppercase tracking-[.16em] text-white/70">Popular this week</p>
                <p className="mt-1 font-display text-[1.05rem] font-bold text-white">Home repairs & cleaning</p>
              </div>
              <button type="button" onClick={onJoin} className="pill grid h-11 w-11 place-items-center rounded-full bg-ember-400 text-ink transition hover:bg-ember-500" aria-label="Join as a professional">
                <TrendingUp size={19} />
              </button>
            </div>
          </div>

          {/* floating card 1 — live booking notification */}
          <div className="float-card -right-3 top-6 w-[15.5rem] rounded-2xl border border-ink-deep/25 bg-ink/95 p-3.5 text-white shadow-float backdrop-blur sm:-right-8 sm:top-10" style={{ '--float-anim': 'float-y 8.5s ease-in-out infinite' } as CSSProperties}>
            <div className="flex items-start gap-3">
              <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-500/25 text-brand-200">
                <Bell size={16} />
                {!reduced && <span className="absolute inset-0 rounded-xl bg-brand-400/30 animate-pulse-ring" />}
              </span>
              <div className="min-w-0">
                <p className="text-[.62rem] font-bold uppercase tracking-[.15em] text-brand-200/80">New booking request</p>
                <p key={request} className="mt-1 animate-rise-in truncate font-display text-sm font-bold">{live.what}</p>
                <p className="mt-0.5 text-[.72rem] text-white/60">{live.who} · {live.where} · {live.when}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
              <span className="text-[.68rem] text-white/55">Preview of your inbox</span>
              <span className={`pill inline-flex items-center gap-1 px-2.5 py-1 text-[.68rem] font-bold transition-colors duration-500 ${accepted ? 'bg-brand-500 text-white' : 'bg-white/12 text-white/70'}`}>
                {accepted ? <><Check size={12} /> Accepted</> : 'Review'}
              </span>
            </div>
          </div>

          {/* floating card 2 — reputation */}
          <div className="float-card -right-2 bottom-24 w-[13.5rem] rounded-2xl border border-line bg-white p-4 shadow-float sm:-right-6" style={{ '--float-anim': 'float-y 6.5s ease-in-out infinite .4s' } as CSSProperties}>
            <div className="flex items-center justify-between">
              <p className="text-[.66rem] font-bold uppercase tracking-[.14em] text-ink-faint">Reputation preview</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-1 text-[.62rem] font-bold uppercase tracking-[.1em] text-brand-600">
                <ShieldCheck size={11} /> Verified
              </span>
            </div>
            <p className="mt-2 font-display text-3xl font-extrabold tracking-[-.05em] text-ink">{avg.toFixed(1)}</p>
            <div className="mt-1.5"><Rating value={avg} size={13} animate /></div>
            <p className="mt-2 flex items-center gap-1.5 text-[.72rem] text-ink-muted">
              <Star size={12} className="text-ember-600" fill="currentColor" /> {reviews} reviews in listed profiles
            </p>
          </div>

          {/* floating card 3 — sample earnings strip */}
          <div className="float-card -bottom-8 left-1 hidden w-[16.5rem] rounded-2xl border border-ember-400/40 bg-ember-soft/95 p-4 shadow-float sm:block sm:-left-6" style={{ '--float-anim': 'float-y 10s ease-in-out infinite .8s' } as CSSProperties}>
            <p className="text-[.66rem] font-bold uppercase tracking-[.14em] text-ember-800/70">Sample dashboard</p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="font-display text-2xl font-extrabold tracking-[-.04em] text-ember-900">AFN 18,400</p>
              <span className="inline-flex items-center gap-1 text-[.7rem] font-bold text-brand-600"><TrendingUp size={13} /> +12%</span>
            </div>
            <div className="mt-3 flex items-end gap-1.5" aria-hidden="true">
              {[38, 54, 30, 62, 48, 74, 58].map((height, index) => (
                <span key={index} className="w-full rounded-sm bg-ember-600/55" style={{ height: `${height * 0.28}px` }} />
              ))}
            </div>
            <p className="mt-2.5 text-[.7rem] text-ember-900/60">Illustrative figures from a professional account.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
