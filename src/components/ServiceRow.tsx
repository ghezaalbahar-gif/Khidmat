import { ArrowRight, BadgeCheck, Clock3, MapPin } from 'lucide-react';
import type { Service } from '@/data/catalog';
import Rating from '@/components/Rating';
import { useStagger } from '@/lib/motion';

type Props = { service: Service; onProvider: (service: Service) => void; onBook: (service: Service) => void; index?: number };

/**
 * Result row for discovery, in the manner of a quote board: photo, person,
 * proof, price and action on one line, and the whole row is tappable.
 */
export default function ServiceRow({ service, onProvider, onBook, index = 0 }: Props) {
  const delay = useStagger(index, 55);

  return (
    <article data-reveal style={delay} className="listing card group grid gap-5 p-4 sm:grid-cols-[132px_1fr] sm:p-5 lg:grid-cols-[148px_1fr_auto] lg:items-center">
      <button type="button" onClick={() => onProvider(service)} className="listing-media relative h-32 overflow-hidden rounded-2xl sm:h-[104px]" aria-label={`View ${service.provider}'s profile`}>
        <img src={service.image} alt="" loading="lazy" className="h-full w-full object-cover" />
        <span className="absolute inset-0 bg-ink-deep/0 transition-colors duration-500 group-hover:bg-ink-deep/10" />
      </button>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <button type="button" onClick={() => onProvider(service)} className="font-display text-[1.05rem] font-bold tracking-[-.02em] text-ink transition-colors hover:text-brand-600">
            {service.provider}
          </button>
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[.65rem] font-bold uppercase tracking-[.12em] text-brand-600">
            <BadgeCheck size={12} /> Verified
          </span>
          <Rating value={service.rating} count={service.reviews} size={13} />
        </div>

        <h3 className="mt-1.5 text-[.98rem] font-semibold text-ink-soft">{service.title}</h3>
        <p className="mt-1 line-clamp-2 text-[.88rem] leading-6 text-ink-muted">{service.description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-faint">
          <span className="inline-flex items-center gap-1.5"><MapPin size={13} />{service.location}, Kabul</span>
          <span className="inline-flex items-center gap-1.5"><Clock3 size={13} />Replies {service.responseTime.toLowerCase()}</span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-brand-600">{service.category}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-line pt-4 sm:col-span-2 sm:border-0 sm:pt-0 lg:flex-col lg:items-end lg:border-l lg:pl-6 lg:pt-0">
        <p className="text-right">
          <span className="block font-display text-lg font-bold leading-none text-ink">AFN {service.price.toLocaleString()}</span>
          <span className="mt-1 block text-[.7rem] uppercase tracking-[.12em] text-ink-faint">{service.unit}</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onBook(service)}
            className="pill inline-flex items-center gap-1.5 bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_22px_-12px_rgba(18,105,79,.8)] hover:bg-brand-700"
          >
            Request quote <ArrowRight size={15} data-arrow className="transition-transform duration-500 group-hover:translate-x-1" />
          </button>
          <button type="button" onClick={() => onProvider(service)} className="listing-arrow hidden text-brand-600 lg:inline-flex" aria-label={`Open ${service.provider} profile`}>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
