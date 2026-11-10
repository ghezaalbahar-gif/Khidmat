import { useEffect, useState } from 'react';
import { ArrowLeft, BadgeCheck, Clock3, MapPin, Quote, ShieldCheck, Star } from 'lucide-react';
import type { Service } from '@/data/catalog';
import { services } from '@/data/catalog';
import { dbProviderFor, fetchReviewsForProvider, type DbProvider, type DbReview } from '@/lib/backend';
import ActionButton from '@/components/ActionButton';
import Rating from '@/components/Rating';
import Notice from '@/components/Notice';

type Props = { service: Service; onBack: () => void; onBook: (service: Service) => void };

export default function ProviderPage({ service, onBack, onBook }: Props) {
  const [record, setRecord] = useState<DbProvider | null>(null);
  const [reviews, setReviews] = useState<DbReview[]>([]);
  const [loading, setLoading] = useState(true);

  const listed = services.filter((item) => item.provider === service.provider);
  const first = service.provider.split(' ')[0];

  useEffect(() => {
    let active = true;
    setLoading(true);
    void (async () => {
      const provider = await dbProviderFor(service.provider);
      if (!active) return;
      setRecord(provider);
      if (provider) {
        const { data } = await fetchReviewsForProvider(provider.id);
        if (active) setReviews(data ?? []);
      }
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [service.provider]);

  const experience = record?.experience_years ?? service.experience;
  const rating = record ? Number(record.rating) : service.rating;
  const reviewCount = record?.review_count ?? service.reviews;
  const avatar = record?.avatar_url ?? service.image;
  const title = record?.professional_title ?? `${service.category} specialist`;

  return (
    <main className="page-shell">
      <section className="band relative overflow-hidden border-b border-line">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-[radial-gradient(60%_100%_at_15%_0%,rgba(215,239,224,.95),transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-14">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 transition hover:gap-3 hover:text-brand-700">
            <ArrowLeft size={16} /> Back to services
          </button>

          <div className="mt-8 flex flex-col gap-7 sm:flex-row sm:items-start">
            <div className="relative shrink-0">
              <div className="absolute -inset-2 rounded-[2rem] bg-[radial-gradient(circle_at_30%_20%,rgba(79,168,127,.45),transparent_70%)] blur-xl" />
              <img src={avatar} alt={service.provider} className="relative h-28 w-28 rounded-3xl object-cover shadow-float sm:h-32 sm:w-32" />
              <span className="absolute -bottom-2 -right-2 grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-white shadow-float"><BadgeCheck size={17} /></span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="eyebrow">Verified professional · Kabul</p>
              <h1 className="mt-3 font-display text-display-sm text-ink">{service.provider}</h1>
              <p className="mt-2 text-[.95rem] text-ink-muted">{title}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Rating value={rating} count={reviewCount} size={16} animate />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-[.7rem] font-bold uppercase tracking-[.12em] text-brand-600">
                  <ShieldCheck size={13} /> Identity checked
                </span>
              </div>
            </div>
          </div>

          <dl className="mt-9 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Experience', value: `${experience} years`, icon: Clock3 },
              { label: 'Jobs in profiles', value: `${service.jobsDone}+`, icon: Star },
              { label: 'Typical reply', value: service.responseTime, icon: Clock3 },
              { label: 'Works in', value: service.location, icon: MapPin },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="group bg-white p-5 transition-colors duration-300 hover:bg-brand-50/60">
                <dt className="flex items-center gap-2 text-xs text-ink-faint">
                  <Icon size={14} className="text-brand-500 transition-transform duration-500 group-hover:-translate-y-0.5" />
                  {label}
                </dt>
                <dd className="mt-2 font-display text-[1.1rem] font-bold tracking-[-.03em] text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[1.35fr_1fr] lg:px-8 lg:py-16">
        <div className="min-w-0">
          <p className="eyebrow">About the work</p>
          <p className="mt-4 prose-khidmat">
            {record?.bio || service.description}
          </p>
          <p className="mt-4 prose-khidmat">
            {first} works across {service.location} and nearby parts of Kabul, with clear pricing agreed before any job starts.
          </p>

          <div className="mt-10">
            <p className="eyebrow">Services offered</p>
            <div className="mt-4 space-y-3">
              {listed.map((item) => (
                <article key={item.id} className="listing group grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 border border-line bg-white p-3.5 sm:flex sm:items-center sm:gap-4 sm:p-4">
                  <div className="listing-media row-span-2 h-14 w-20 overflow-hidden rounded-xl sm:h-16 sm:w-24">
                    <img src={item.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-[.98rem] font-bold tracking-[-.02em] text-ink">{item.title}</h3>
                    <p className="mt-1 line-clamp-1 text-[.85rem] text-ink-muted">{item.description}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:contents">
                    <p className="sm:shrink-0 sm:text-right">
                      <span className="block font-display text-[.98rem] font-bold text-ink">AFN {item.price.toLocaleString()}</span>
                      <span className="hidden text-[.68rem] uppercase tracking-[.1em] text-ink-faint sm:block">{item.unit}</span>
                    </p>
                    <button type="button" onClick={() => onBook(item)} className="pill shrink-0 bg-brand-50 px-3 py-2 text-[.8rem] font-bold text-brand-600 transition hover:bg-brand-600 hover:text-white sm:px-3.5">
                      Book
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <div className="flex items-center justify-between gap-4">
              <p className="eyebrow">What customers say</p>
              {!loading && reviews.length > 0 && <span className="text-xs text-ink-faint">{reviews.length} from completed jobs</span>}
            </div>

            {loading ? (
              <div className="mt-4 space-y-3">
                <div className="skeleton h-24 rounded-2xl" />
                <div className="skeleton h-24 rounded-2xl" />
              </div>
            ) : reviews.length ? (
              <div className="mt-4 space-y-3">
                {reviews.map((review) => (
                  <figure key={review.id} className="quote-card rounded-2xl border border-line bg-white p-5">
                    <div className="flex items-center gap-1 text-ember-600">
                      {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={13} fill={star <= review.rating ? 'currentColor' : 'none'} />)}
                    </div>
                    <blockquote className="mt-3 text-[.95rem] leading-7 text-ink-soft">{review.comment}</blockquote>
                    <figcaption className="mt-3 text-xs text-ink-faint">{new Date(review.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <Notice kind="info">
                  Reviews appear here automatically once a customer marks a job complete. Nothing is added by hand.
                </Notice>
                <figure className="mt-4 rounded-2xl border border-line bg-white p-5">
                  <Quote size={16} className="text-ember-600" />
                  <blockquote className="mt-2 font-editorial text-[1rem] italic leading-8 text-ink-soft">
                    “Sample review — this is how feedback from a completed job will look on your profile.”
                  </blockquote>
                  <figcaption className="mt-3 text-xs font-semibold uppercase tracking-[.12em] text-ink-faint">Example layout, not a real review</figcaption>
                </figure>
              </div>
            )}
          </div>
        </div>

        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <div className="band-ink overflow-hidden rounded-sheet p-6 text-white sm:p-7">
            <p className="text-[.7rem] font-bold uppercase tracking-[.16em] text-brand-200">Ready when you are</p>
            <h2 className="mt-3 font-display text-[1.65rem] font-extrabold leading-tight tracking-[-.045em]">Book {first}.</h2>
            <p className="mt-3 text-[.9rem] leading-7 text-white/65">Share a few details and your request lands in their dashboard right away.</p>

            <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-5">
              <div>
                <p className="font-display text-2xl font-extrabold tracking-[-.04em]">AFN {service.price.toLocaleString()}</p>
                <p className="mt-1 text-xs text-white/55">{service.unit}</p>
              </div>
              <Rating value={rating} size={14} />
            </div>

            <div className="mt-6 space-y-3">
              <ActionButton kind="ember" full arrow onClick={() => onBook(service)}>Request this service</ActionButton>
              <ul className="space-y-2 text-[.8rem] text-white/60">
                {['No payment on Khidmat', 'Direct phone contact after booking', 'Free to cancel before the visit'].map((item) => (
                  <li key={item} className="flex items-center gap-2"><BadgeCheck size={14} className="text-brand-300" /> {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
