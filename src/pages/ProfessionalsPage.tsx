import type { CSSProperties } from 'react';
import {
  BadgeCheck, BookOpen, CircleDollarSign, ClipboardList, MapPin, MessageSquareQuote,
  Quote, Star, UsersRound, Wrench,
} from 'lucide-react';
import { categories, services } from '@/data/catalog';
import CategoryTile from '@/components/CategoryTile';
import FaqAccordion from '@/components/FaqAccordion';
import ActionButton from '@/components/ActionButton';
import ProfessionalsHero from '@/sections/professionals/ProfessionalsHero';

type Props = { onJoin: () => void; onCategory: (name: string) => void };

const benefits = [
  { icon: UsersRound, title: 'Find More Customers', text: 'Show up when households across Kabul are actively searching for the exact work you do.', tint: 'bg-brand-50 text-brand-600' },
  { icon: ClipboardList, title: 'Manage Your Bookings', text: 'Requests, dates, customer details and statuses live in one calm dashboard instead of a chat thread.', tint: 'bg-ember-soft text-ember-700' },
  { icon: Star, title: 'Build Your Reputation', text: 'Every completed job can earn a review, so good work becomes visible proof for the next customer.', tint: 'bg-tint-sage text-accent-sage' },
  { icon: CircleDollarSign, title: 'Grow Your Business', text: 'Set your own prices, publish the services you actually want, and turn spare hours into steady income.', tint: 'bg-tint-honey text-accent-honey' },
];

const steps = [
  { n: '01', title: 'Create your professional account', text: 'Sign up with your email and choose the professional role. It takes about two minutes.' },
  { n: '02', title: 'Build your profile and add services', text: 'Describe your experience, publish the services you offer, and set a clear price for each one.' },
  { n: '03', title: 'Receive and manage booking requests', text: 'Customers send requests straight to your dashboard. Accept the ones that fit your schedule.' },
  { n: '04', title: 'Complete jobs and collect reviews', text: 'Mark a job done, invite feedback, and watch your rating carry your profile higher.' },
];

const pillars = [
  { icon: MapPin, title: 'Be seen locally', text: 'Reach customers across Kabul who already need help, in the areas you choose to work in.' },
  { icon: BookOpen, title: 'Work with clarity', text: 'Services, prices and job details stay written down, so nothing is agreed by memory.' },
  { icon: MessageSquareQuote, title: 'Earn trust', text: 'Build a visible track record with thoughtful reviews from real completed jobs.' },
];

const quotes = [
  { name: 'Farzana Sediqi', role: 'Home care specialist', area: 'Shahr-e-Naw', text: 'Khidmat helped me turn regular cleaning work into a business customers can find and trust.' },
  { name: 'Omid Rahimi', role: 'Electrician', area: 'Wazir Akbar Khan', text: 'The requests are clearer now, and I can focus on doing excellent work instead of chasing leads.' },
  { name: 'Mariam Ahmadi', role: 'Painter', area: 'Taimani', text: 'My profile gives new customers confidence before I even arrive at the door.' },
];

const faqs: [string, string][] = [
  ['How can I become a Khidmat professional?', 'Create your account, complete your professional profile, and add the services you offer. Once submitted, your profile can be discovered by customers in Kabul.'],
  ['Is registration free?', 'Yes. Creating a professional profile and listing your services is free. You keep the prices you set.'],
  ['How do I receive booking requests?', 'Customers send requests through your listed services. You review and answer each one — accept, decline, or update the status — from your professional dashboard.'],
  ['Can I manage my services and prices?', 'Yes. Your dashboard lets you add services, adjust prices, update descriptions, and remove services you no longer offer.'],
  ['How do I receive customer reviews?', 'After a completed service, customers can leave feedback on the booking and your professional profile.'],
];

export default function ProfessionalsPage({ onJoin, onCategory }: Props) {
  return (
    <main className="page-shell overflow-hidden">
      <ProfessionalsHero onJoin={onJoin} />

      {/* -------------------------------------------------------- benefits -- */}
      <section className="border-t border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[.72fr_1.28fr] lg:px-8 lg:py-24">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">Built around your work</p>
            <h2 className="mt-3 font-display text-display-sm text-ink">A better way to build a local business.</h2>
            <p className="mt-5 prose-khidmat">Khidmat handles the discovering, the scheduling and the paperwork side, so the work itself stays the focus.</p>
            <div className="mt-8"><ActionButton kind="brand" onClick={onJoin} arrow>Create your profile</ActionButton></div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <article
                  key={benefit.title}
                  data-reveal
                  style={{ '--reveal-delay': `${index * 90}ms` } as CSSProperties}
                  className="benefit rounded-2xl border border-line bg-canvas p-6"
                  data-cursor="card"
                >
                  <span className={`benefit-icon grid h-12 w-12 place-items-center rounded-xl ${benefit.tint}`}>
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-6 font-display text-[1.05rem] font-bold tracking-[-.02em] text-ink">{benefit.title}</h3>
                  <p className="mt-2.5 text-[.92rem] leading-7 text-ink-muted">{benefit.text}</p>
                  <span className="mt-6 flex items-center gap-2 text-[.68rem] font-extrabold uppercase tracking-[.16em] text-ink-faint">
                    <span className="h-px w-5 bg-line-strong" />{benefit.title.split(' ')[1]}
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- how it works -- */}
      <section id="how-it-works" className="band relative scroll-mt-24 py-16 lg:py-24">
        <div className="dotted pointer-events-none absolute inset-x-0 top-0 h-40 opacity-[.18]" />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <div>
              <p className="eyebrow">How it works</p>
              <h2 className="mt-3 font-display text-title text-ink">Start with your skills. We’ll help with the rest.</h2>
              <p className="mt-5 prose-khidmat">Four steps between the work you already do and customers who are looking for it today.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ActionButton kind="ember" onClick={onJoin} arrow>Join as a professional</ActionButton>
                <ActionButton kind="quiet" href="#/services">See how listings look</ActionButton>
              </div>
            </div>

            <ol className="relative space-y-3 border-l border-line pl-6 sm:pl-8">
              {steps.map((step, index) => (
                <li
                  key={step.n}
                  data-reveal
                  style={{ '--reveal-delay': `${index * 90}ms` } as CSSProperties}
                  className="step group relative overflow-hidden rounded-2xl border border-line bg-white/85 p-5 backdrop-blur-sm sm:p-6"
                >
                  <span className="step-numeral bleed-numeral absolute -right-2 -top-5 leading-none">{step.n}</span>
                  <div className="relative flex items-start gap-4">
                    <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-transform duration-500 ease-silk group-hover:rotate-6">
                      <Wrench size={16} />
                    </span>
                    <div>
                      <h3 className="font-display text-[1.05rem] font-bold tracking-[-.02em] text-ink">{step.title}</h3>
                      <p className="mt-2 text-[.92rem] leading-7 text-ink-muted">{step.text}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ categories -- */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Choose your lane</p>
            <h2 className="mt-3 font-display text-title text-ink">Bring your expertise to Kabul.</h2>
            <p className="mt-4 max-w-lg text-[.95rem] leading-7 text-ink-muted">Pick the field you already work in — each one is a category customers search by.</p>
          </div>
          <ActionButton kind="link" onClick={onJoin} arrow>List a service</ActionButton>
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

      {/* ------------------------------------------------------- why join --- */}
      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8 lg:pb-24">
        <div data-reveal className="band-ink relative overflow-hidden rounded-sheet px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-16">
          <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(79,168,127,.4),transparent_66%)] blur-2xl" />
          <div className="relative grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
            <div>
              <p className="eyebrow eyebrow-light">Why join Khidmat?</p>
              <h2 className="mt-4 font-display text-[clamp(1.7rem,3.4vw,2.5rem)] font-extrabold leading-[1.06] tracking-[-.05em]">
                Let your reputation travel further than your neighbourhood.
              </h2>
              <p className="mt-5 max-w-md leading-7 text-white/65">
                One profile that shows what you do, where you work, what it costs, and what past customers said afterwards.
              </p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-white/12 bg-white/12 sm:grid-cols-3">
              {pillars.map(({ icon: Icon, title, text }) => (
                <div key={title} className="group bg-ink-deep/35 p-5 transition-colors duration-500 hover:bg-ink-deep/60">
                  <Icon size={21} className="text-ember-400 transition-transform duration-700 ease-silk group-hover:-translate-y-1" />
                  <p className="mt-8 font-display text-[1rem] font-bold tracking-[-.02em]">{title}</p>
                  <p className="mt-2 text-[.85rem] leading-6 text-white/60">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- testimonials -- */}
      <section className="border-y border-line bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
          <div className="max-w-xl">
            <p className="eyebrow">From professionals like you</p>
            <h2 className="mt-3 font-display text-title text-ink">Work people can vouch for.</h2>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {quotes.map((quote, index) => (
              <figure
                key={quote.name}
                data-reveal
                style={{ '--reveal-delay': `${index * 110}ms` } as CSSProperties}
                className={`quote-card rounded-2xl border border-line bg-canvas p-6 ${index === 1 ? 'lg:-translate-y-4' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex gap-0.5 text-ember-600">
                    {[0, 1, 2, 3, 4].map((star) => (
                      <Star key={star} size={15} fill="currentColor" className="animate-star-in" style={{ animationDelay: `${star * 90 + index * 110}ms` }} />
                    ))}
                  </span>
                  <Quote size={20} className="text-brand-200" />
                </div>
                <blockquote className="mt-6 font-editorial text-[1.06rem] leading-8 text-ink-soft">“{quote.text}”</blockquote>
                <figcaption className="mt-7 flex items-center gap-3 border-t border-line pt-5">
                  <span className="quote-avatar grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-brand-50 font-display text-[.8rem] font-bold text-brand-700">
                    {quote.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                  </span>
                  <span>
                    <span className="block font-display text-[.92rem] font-bold text-ink">{quote.name}</span>
                    <span className="block text-[.78rem] text-ink-muted">{quote.role} · {quote.area}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>

          <p className="mt-8 flex items-center gap-2 text-xs text-ink-faint">
            <BadgeCheck size={14} className="text-brand-500" />
            Profiles on Khidmat show the reviews customers leave after a completed booking.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------- faq -- */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow">Questions, answered</p>
            <h2 className="mt-3 font-display text-display-sm text-ink">Everything you need to get started.</h2>

            <div className="mt-9 rounded-2xl border border-ember-400/40 bg-ember-soft p-6">
              <p className="font-display text-[1.02rem] font-bold text-ember-800">Ready to put your skills to work?</p>
              <p className="mt-1.5 text-[.88rem] leading-6 text-ember-800/75">Create your professional profile today — free, and live in minutes.</p>
              <div className="mt-5"><ActionButton kind="ember" size="sm" onClick={onJoin} arrow>Join Khidmat</ActionButton></div>
            </div>
          </div>

          <FaqAccordion items={faqs} />
        </div>
      </section>
    </main>
  );
}
