import type { CSSProperties } from 'react';
import { BadgeCheck, CalendarCheck2, MapPin, Star, UserRoundCheck, Wallet } from 'lucide-react';
import { categories, photos } from '@/data/catalog';
import { useCountUp, usePrefersReducedMotion } from '@/lib/motion';
import ActionButton from '@/components/ActionButton';

type Props = { onJoin: () => void };

const proofs = [
  { icon: UserRoundCheck, text: 'Free to join, no listing fee' },
  { icon: CalendarCheck2, text: 'You accept every request' },
  { icon: BadgeCheck, text: 'Your work, your price' },
];

export default function ProfessionalsHero({ onJoin }: Props) {
  const listed = useCountUp(categories.length);
  const reduced = usePrefersReducedMotion();

  // Hash routing owns location.hash, so in-page jumps must scroll instead of linking.
  const scrollToSteps = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(140,197,167,.42),transparent_66%)] blur-2xl" />
      <div className="pointer-events-none absolute right-[-6rem] top-40 hidden h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(241,185,104,.34),transparent_66%)] blur-2xl lg:block" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 lg:grid-cols-[1.02fr_.98fr] lg:gap-14 lg:px-8 lg:py-20">
        <div>
          <p className="pill inline-flex items-center gap-2 border border-brand-200 bg-brand-50 px-3 py-1.5 text-[.68rem] font-extrabold uppercase tracking-[.2em] text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-ember-600" />
            For local professionals
          </p>

          <h1 className="mt-6 font-display text-display text-ink">
            Your skills deserve
            <span className="relative inline-block">
              <span className="relative z-10 ml-2">to be discovered.</span>
              <span className="absolute inset-x-0 bottom-1.5 z-0 h-3 rounded-full bg-ember-400/45" aria-hidden="true" />
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lead text-ink-muted">
            Join Khidmat and connect with customers across Kabul who need your skills and services.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <ActionButton kind="brand" size="lg" onClick={onJoin} arrow>Join as a professional</ActionButton>
            <ActionButton kind="quiet" size="lg" onClick={scrollToSteps}>How it works</ActionButton>
          </div>

          <ul className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-[.86rem] font-semibold text-ink-soft">
            {proofs.map(({ icon: Icon, text }) => (
              <li key={text} className="group inline-flex items-center gap-2">
                <Icon size={16} className="text-brand-600 transition-transform duration-500 ease-silk group-hover:-translate-y-0.5" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* ------------------------------------------------- annotated image */}
        <div className="relative">
          <div data-tilt className="media-frame aspect-[5/4] w-full border border-line">
            <img src={photos.heroTall} alt="A professional finishing a home service visit in Kabul" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-ink-deep/45 via-transparent to-transparent" />
          </div>

          <div
            className="float-card hidden rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-float backdrop-blur sm:block"
            style={{ '--float-anim': 'float-y 7.5s ease-in-out infinite', top: '-1.25rem', right: '8%' } as CSSProperties}
          >
            <p className="flex items-center gap-2 text-[.66rem] font-extrabold uppercase tracking-[.16em] text-brand-600">
              <span className="relative grid h-6 w-6 place-items-center rounded-full bg-brand-50">
                <span className="absolute inset-0 animate-pulse-ring rounded-full border border-brand-300" />
                <Star size={12} className="text-ember-600" fill="currentColor" />
              </span>
              Request preview
            </p>
            <p className="mt-2 font-display text-[.92rem] font-bold text-ink">Deep home cleaning</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[.72rem] text-ink-muted"><MapPin size={12} className="text-brand-500" />Shahr-e-Naw · today</p>
          </div>

          <div
            className="float-card hidden rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-float backdrop-blur md:block"
            style={{ '--float-anim': 'float-y-slow 10s ease-in-out infinite', bottom: '12%', left: '-1.5rem' } as CSSProperties}
          >
            <p className="text-[.66rem] font-extrabold uppercase tracking-[.16em] text-ink-faint">Open on Khidmat</p>
            <p className="mt-1 font-display text-[1.35rem] font-extrabold leading-none text-ink"><span ref={listed.ref}>{listed.display}</span></p>
            <p className="mt-1 text-[.72rem] text-ink-muted">service categories you can work in</p>
          </div>

          <div
            className="float-card hidden rounded-2xl border border-white/12 bg-ink-deep/92 px-4 py-3 text-white shadow-float backdrop-blur lg:block"
            style={{ '--float-anim': 'float-y-fast 6.2s ease-in-out infinite', bottom: '-1.5rem', right: '10%' } as CSSProperties}
          >
            <p className="flex items-center gap-1.5 text-[.66rem] font-extrabold uppercase tracking-[.16em] text-brand-200">
              <Wallet size={12} className="text-ember-400" /> To list a service
            </p>
            <p className="mt-1.5 font-display text-[1.15rem] font-extrabold leading-none">AFN 0</p>
            <p className="mt-2 text-[.72rem] text-white/70">You set your own prices, always.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
