import { useState } from 'react';
import { ArrowRight, BadgeCheck, Heart, MapPin } from 'lucide-react';
import type { Service } from '@/data/catalog';
import Rating from '@/components/Rating';
import { useStagger } from '@/lib/motion';

type Props = { service: Service; onProvider: (service: Service) => void; onBook: (service: Service) => void; index?: number };

export default function ServiceCard({ service, onProvider, onBook, index = 0 }: Props) {
  const [loved, setLoved] = useState(false);
  const delay = useStagger(index);

  return (
    <article data-reveal style={delay} className="svc card group flex flex-col">
      <div className="svc-media relative h-48 overflow-hidden sm:h-52">
        <img src={service.image} alt={service.title} loading="lazy" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/45 via-transparent to-transparent opacity-70" />
        <button
          type="button"
          onClick={() => setLoved((current) => !current)}
          aria-pressed={loved}
          aria-label={loved ? `Remove ${service.title} from favourites` : `Save ${service.title} to favourites`}
          data-on={loved}
          className="heart-btn absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/92 text-ink-muted backdrop-blur hover:text-love"
        >
          <Heart size={16} fill={loved ? 'currentColor' : 'none'} />
        </button>
        <span className="svc-chip absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-ink-deep/85 px-3 py-1 text-[.68rem] font-bold uppercase tracking-[.12em] text-white/90">
          {service.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-[1.06rem] font-bold leading-snug tracking-[-.02em] text-ink">{service.title}</h3>
            <button
              type="button"
              onClick={() => onProvider(service)}
              className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink-muted transition hover:text-brand-600"
            >
              <BadgeCheck size={14} className="text-brand-500" />
              {service.provider}
            </button>
          </div>
          <span className="svc-star shrink-0"><Rating value={service.rating} size={14} /></span>
        </div>

        <p className="mt-3 line-clamp-2 text-[.9rem] leading-6 text-ink-muted">{service.description}</p>

        <div className="mt-3 flex items-center gap-2 text-xs text-ink-faint">
          <MapPin size={13} />
          {service.location}
          <span className="h-1 w-1 rounded-full bg-line-strong" />
          {service.reviews} reviews
        </div>

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
          <p>
            <span className="font-display text-lg font-bold text-ink">AFN {service.price.toLocaleString()}</span>
            <span className="ml-1.5 text-xs text-ink-faint">{service.unit}</span>
          </p>
          <button
            type="button"
            onClick={() => onBook(service)}
            className="svc-cta inline-flex translate-x-1 items-center gap-1.5 rounded-full bg-brand-50 px-4 py-2 text-sm font-bold text-brand-600 hover:bg-brand-600 hover:text-white"
          >
            Book <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}
