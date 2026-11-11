import { ArrowRight, BadgeCheck, CalendarDays, Clock3, Heart, Quote, ShieldCheck, Sparkles, Star } from 'lucide-react';
import type { CSSProperties } from 'react';
import { categories, services } from '@/data/catalog';
import type { Service } from '@/data/catalog';
import CategoryTile from '@/components/CategoryTile';
import ServiceCard from '@/components/ServiceCard';
import ActionButton from '@/components/ActionButton';
import Rating from '@/components/Rating';
import HomeHero from '@/sections/home/HomeHero';

type Props = {
  onSearch: (term: string) => void;
  onBrowse: () => void;
  onCategory: (name: string) => void;
  onProvider: (service: Service) => void;
  onBook: (service: Service) => void;
  onJoin: () => void;
};

const steps = [
  { n: '01', title: 'Tell us what you need', text: 'Search by service, browse a category, or describe the task in your own words.' },
  { n: '02', title: 'Choose your professional', text: 'Compare experience, reviews, availability and pricing before you decide.' },
  { n: '03', title: 'Book with confidence', text: 'Send one request, then keep every detail and update in a single place.' },
];

export default function HomePage({ onSearch, onBrowse, onCategory, onProvider, onBook, onJoin }: Props) {
  const [featured, ...rest] = services;
  const spotlight = services[2];

  return (
    <main className="page-shell">
      <HomeHero onSearch={onSearch} onCategory={onCategory} onJoin={onJoin} />

      {/* ------------------------------------------------------ categories -- */}
      <section className="relative mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">What do you need?</p>
            <h2 className="mt-3 font-display text-title text-ink">A helping hand is closer<br className="hidden sm:block" /> than you think.</h2>
          </div>
          <ActionButton kind="link" onClick={onBrowse} arrow className="self-start sm:self-auto">View all services</ActionButton>
        </div>
        <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category, index) => (
            <CategoryTile
              key={category.name}
              category={category}
              index={index}
              count={services.filter((service) => service.category === category.name).length}
              onClick={onCategory}
            />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ rail -- */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span className="font-display font-bold text-ink-soft">Trusted by households across Kabul</span>
          <div className="flex flex-wrap gap-x-7 gap-y-2">
            {[
              { icon: ShieldCheck, label: 'Verified professionals' },
              { icon: Clock3, label: 'On-time service' },
              { icon: Heart, label: 'Satisfaction first' },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="group inline-flex items-center gap-2">
                <Icon size={16} className="text-brand-600 transition-transform duration-500 group-hover:-translate-y-0.5" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- featured  -- */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
          <div>
            <p className="eyebrow">Popular right now</p>
            <h2 className="mt-3 font-display text-title text-ink">People you can count on.</h2>
            <p className="mt-4 max-w-md prose-khidmat">Every professional shown here lists real prices, recent reviews and the neighbourhoods they work in.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 lg:justify-end">
            {[...services].sort((a, b) => b.rating - a.rating).slice(0, 3).map((service) => (
              <button key={service.id} type="button" onClick={() => onProvider(service)} className="group inline-flex items-center gap-2.5 rounded-full border border-line bg-white px-3.5 py-2 text-sm font-semibold text-ink-soft transition hover:border-brand-300 hover:bg-brand-50">
                <Star size={14} className="text-ember-600 transition-transform duration-500 group-hover:rotate-12" fill="currentColor" />
                {service.provider}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-[1.15fr_1fr]">
          <ServiceCard service={featured} onProvider={onProvider} onBook={onBook} />
          {rest.slice(0, 3).map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index + 1} onProvider={onProvider} onBook={onBook} />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <ActionButton kind="quiet" onClick={onBrowse} arrow>Browse all {services.length} services</ActionButton>
        </div>
      </section>

      {/* ---------------------------------------------------------- steps -- */}
      <section className="band relative overflow-hidden py-16 lg:py-20">
        <div className="ruled pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <p className="eyebrow">Simple by design</p>
            <h2 className="mt-3 font-display text-display-sm text-ink">From “I need help” to “all done.”</h2>
            <p className="mt-5 prose-khidmat">Khidmat keeps the messy parts of hiring local help out of your way, so the job is the only thing you think about.</p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {steps.map((step, index) => (
              <article
                key={step.n}
                data-reveal
                style={{ '--reveal-delay': `${index * 110}ms` } as CSSProperties}
                className="step group relative overflow-hidden rounded-2xl border border-line bg-white/85 p-6 backdrop-blur-sm"
              >
                <span className="bleed-numeral absolute -right-3 -top-4 leading-none">{step.n}</span>
                <span className="relative inline-flex items-center gap-2 text-[.7rem] font-bold uppercase tracking-[.16em] text-ember-700">
                  <span className="h-px w-6 bg-ember-600/60" />Step {step.n}
                </span>
                <h3 className="relative mt-5 font-display text-[1.15rem] font-bold tracking-[-.025em] text-ink">{step.title}</h3>
                <p className="relative mt-2.5 text-[.92rem] leading-7 text-ink-muted">{step.text}</p>
                {index < steps.length - 1 && (
                  <ArrowRight size={18} className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-brand-300 sm:block" />
                )}
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <ActionButton kind="brand" onClick={onBrowse} arrow>Start exploring</ActionButton>
            <span className="inline-flex items-center gap-2 text-sm text-ink-muted"><CalendarDays size={16} className="text-brand-600" />Most requests are answered the same day.</span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- spotlight -- */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <div data-reveal className="grid overflow-hidden rounded-sheet border border-line bg-white shadow-card lg:grid-cols-[1.05fr_1fr]">
          <div className="relative min-h-[18rem] overflow-hidden">
            <img src={spotlight.image} alt={spotlight.title} className="h-full w-full object-cover transition-transform duration-[1200ms] ease-silk hover:scale-[1.05]" />
            <div className="absolute inset-0 bg-gradient-to-tr from-ink-deep/55 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 rounded-2xl border border-white/25 bg-ink-deep/70 px-4 py-3 text-white backdrop-blur">
              <p className="text-[.62rem] font-bold uppercase tracking-[.16em] text-brand-200">In the spotlight</p>
              <p className="mt-1 font-display font-bold">{spotlight.category} · {spotlight.location}</p>
            </div>
          </div>
          <div className="p-6 sm:p-10">
            <p className="eyebrow">Why households stay</p>
            <h2 className="mt-3 font-display text-title text-ink">Clarity before the first knock.</h2>
            <div className="mt-6 flex items-center gap-3">
              <Rating value={spotlight.rating} count={spotlight.reviews} />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[.68rem] font-bold uppercase tracking-[.12em] text-brand-600">
                <BadgeCheck size={13} /> Identity checked
              </span>
            </div>
            <figure className="mt-6 border-l-2 border-ember-400 pl-4">
              <Quote size={16} className="text-ember-600" />
              <blockquote className="mt-2 font-editorial text-[1.05rem] italic leading-8 text-ink-soft">
                “I could see the price, the reviews and the area before I sent anything. That alone made it feel safe.”
              </blockquote>
              <figcaption className="mt-3 text-[.8rem] font-semibold text-ink-faint">Khidmat customer, Shahr-e-Naw</figcaption>
            </figure>
            <ul className="mt-7 space-y-3 text-[.92rem] text-ink-muted">
              {['Upfront pricing on every listing', 'One inbox for all your requests', 'Reviews from completed jobs only'].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Sparkles size={15} className="mt-0.5 shrink-0 text-brand-500" /> {item}
                </li>
              ))}
            </ul>
            <div className="mt-8"><ActionButton kind="brand" onClick={onBrowse} arrow>Find your professional</ActionButton></div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ pro invite -- */}
      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8 lg:pb-20">
        <div data-reveal className="band-ink relative overflow-hidden rounded-sheet px-6 py-12 text-white sm:px-10 lg:px-14">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(241,185,104,.32),transparent_65%)] blur-xl" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="eyebrow eyebrow-light">For local professionals</p>
              <h2 className="mt-4 font-display text-[clamp(1.75rem,4vw,2.6rem)] font-extrabold leading-[1.05] tracking-[-.05em]">
                Your skills deserve to be discovered.
              </h2>
              <p className="mt-4 leading-7 text-white/65">
                Join a growing community of trusted professionals serving Kabul — free to start, fully in your control.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ActionButton kind="ember" onClick={onJoin} arrow>Join Khidmat</ActionButton>
              <ActionButton kind="glass" href="#/professionals">Learn more</ActionButton>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
