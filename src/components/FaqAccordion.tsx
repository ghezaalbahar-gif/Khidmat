import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type Props = { items: [string, string][] };

export default function FaqAccordion({ items }: Props) {
  const [open, setOpen] = useState(0);

  return (
    <div className="divide-y divide-line overflow-hidden rounded-sheet border border-line bg-white">
      {items.map(([question, answer], index) => {
        const expanded = open === index;
        return (
          <div key={question}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(expanded ? -1 : index)}
                aria-expanded={expanded}
                aria-controls={`faq-panel-${index}`}
                className="faq-toggle flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-7"
              >
                <span className="font-display text-[1.02rem] font-bold tracking-[-.02em] text-ink-soft">{question}</span>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${expanded ? 'bg-brand-600 text-white' : 'bg-mist text-brand-600'}`}>
                  <ChevronDown size={16} className="faq-icon" />
                </span>
              </button>
            </h3>
            <div id={`faq-panel-${index}`} role="region" className="faq-body" data-open={expanded}>
              <p className="overflow-hidden px-5 pb-6 text-[.95rem] leading-7 text-ink-muted sm:px-7 sm:pr-16">{answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
