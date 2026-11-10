import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { CalendarDays, CheckCircle2, Clock3, Inbox, MapPin, Phone, Star, X } from 'lucide-react';
import type { Service } from '@/data/catalog';
import { services } from '@/data/catalog';
import {
  createReview, fetchCustomerBookings, setBookingStatus,
  type AuthUser, type DbBooking,
} from '@/lib/backend';
import ActionButton from '@/components/ActionButton';
import StatusPill from '@/components/StatusPill';
import Notice from '@/components/Notice';
import { useCountUp } from '@/lib/motion';

type Props = { user: AuthUser | null; onSignIn: () => void; onBrowse: () => void; onBook: (service: Service) => void };

export default function BookingsPage({ user, onSignIn, onBrowse, onBook }: Props) {
  if (!user) return <SignedOut onSignIn={onSignIn} onBrowse={onBrowse} />;
  return <YourBookings user={user} onBrowse={onBrowse} onBook={onBook} />;
}

/* ------------------------------------------------------- signed-out view -- */

function SignedOut({ onSignIn, onBrowse }: { onSignIn: () => void; onBrowse: () => void }) {
  return (
    <main className="page-shell band relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_88%_10%,rgba(215,239,224,.9),transparent_68%)]" />
      <div className="dotted pointer-events-none absolute inset-x-0 bottom-0 h-52 opacity-40" />

      <section className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-[1.05fr_1fr] lg:px-8 lg:py-20">
        <div>
          <p className="eyebrow">Your bookings</p>
          <h1 className="mt-4 max-w-xl font-display text-display-sm text-ink">Your requests, all in one calm place.</h1>
          <p className="mt-5 max-w-lg prose-khidmat">
            Sign in to follow every booking from request to review — dates, contacts, notes and status in a single timeline.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              { icon: CalendarDays, title: 'See what is coming up', text: 'Dates, time windows and the professional assigned to each job.' },
              { icon: Clock3, title: 'Track the status', text: 'Awaiting response, accepted, in progress, or complete at a glance.' },
              { icon: CheckCircle2, title: 'Review the work', text: 'Leave a rating after a completed visit — it appears on their profile.' },
            ].map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-brand-600 shadow-card transition-transform duration-500 hover:-translate-y-0.5">
                  <Icon size={19} />
                </span>
                <div>
                  <p className="font-display text-[1rem] font-bold tracking-[-.02em] text-ink">{title}</p>
                  <p className="mt-1 text-[.9rem] leading-6 text-ink-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap gap-3">
            <ActionButton kind="brand" size="lg" onClick={onSignIn} arrow>Sign in to continue</ActionButton>
            <ActionButton kind="quiet" size="lg" onClick={onBrowse}>Browse services first</ActionButton>
          </div>
        </div>

        {/* A preview of the timeline the customer gets after signing in. */}
        <div data-reveal className="relative">
          <div className="absolute -inset-6 rounded-blob bg-[radial-gradient(circle_at_65%_25%,rgba(79,168,127,.32),transparent_65%)] blur-2xl" />
          <div className="relative overflow-hidden rounded-sheet border border-line bg-white p-6 shadow-sheet">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Preview</p>
              <span className="rounded-full bg-mist px-3 py-1 text-[.65rem] font-bold uppercase tracking-[.14em] text-ink-muted">Example view</span>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { title: 'Deep home cleaning', pro: 'Farzana Sediqi', when: 'Sat 14 Nov · Morning', status: 'accepted' },
                { title: 'Electrical inspection', pro: 'Omid Rahimi', when: 'Mon 16 Nov · Midday', status: 'pending' },
                { title: 'Room painting', pro: 'Mariam Ahmadi', when: 'Completed 02 Nov', status: 'completed' },
              ].map((row) => (
                <div key={row.title} className="rounded-2xl border border-line bg-canvas/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-[.95rem] font-bold tracking-[-.02em] text-ink">{row.title}</p>
                      <p className="mt-1 text-[.8rem] text-ink-muted">with {row.pro}</p>
                    </div>
                    <StatusPill status={row.status} />
                  </div>
                  <p className="mt-3 flex items-center gap-2 text-[.75rem] text-ink-faint"><CalendarDays size={13} /> {row.when}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[.75rem] leading-5 text-ink-faint">This is how your bookings appear once you sign in.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

/* -------------------------------------------------------- customer area -- */

function YourBookings({ user, onBrowse, onBook }: { user: AuthUser; onBrowse: () => void; onBook: (service: Service) => void }) {
  const [rows, setRows] = useState<DbBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await fetchCustomerBookings();
    if (error) setProblem(error.message);
    setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const pending = rows.filter((row) => row.status === 'pending').length;
  const done = rows.filter((row) => row.status === 'completed').length;
  const stats = [useCountUp(rows.length, { duration: 900 }), useCountUp(pending, { duration: 900 }), useCountUp(done, { duration: 900 })];

  const cancel = async (id: string) => {
    const { error } = await setBookingStatus(id, 'cancelled');
    if (error) { setProblem(error.message); return; }
    setRows((current) => current.map((row) => (row.id === id ? { ...row, status: 'cancelled' } : row)));
  };

  const bookAgain = (row: DbBooking) => {
    const match = services.find((service) => service.title === row.service_title);
    if (match) onBook(match);
    else onBrowse();
  };

  return (
    <main className="page-shell mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Customer dashboard</p>
          <h1 className="mt-3 font-display text-display-sm text-ink">Good to see you.</h1>
          <p className="mt-2 text-[.9rem] text-ink-muted">{user.email}</p>
        </div>
        <ActionButton kind="brand" onClick={onBrowse} arrow>Find a service</ActionButton>
      </div>

      <div className="mt-9 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total bookings', value: stats[0].display, ref: stats[0].ref, dark: true, icon: CalendarDays },
          { label: 'Awaiting response', value: stats[1].display, ref: stats[1].ref, dark: false, icon: Clock3 },
          { label: 'Completed jobs', value: stats[2].display, ref: stats[2].ref, dark: false, icon: CheckCircle2 },
        ].map(({ label, value, ref, dark, icon: Icon }) => (
          <div key={label} data-reveal className={`rounded-2xl p-5 ${dark ? 'band-ink text-white' : 'border border-line bg-white'}`}>
            <Icon size={20} className={dark ? 'text-ember-400' : 'text-brand-600'} />
            <span ref={ref} className={`mt-7 block font-display text-3xl font-extrabold tracking-[-.05em] ${dark ? 'text-white' : 'text-ink'}`}>{value}</span>
            <p className={`mt-1 text-sm ${dark ? 'text-white/60' : 'text-ink-muted'}`}>{label}</p>
          </div>
        ))}
      </div>

      {problem && <div className="mt-8"><Notice kind="error" onDismiss={() => setProblem('')}>{problem}</Notice></div>}

      <h2 className="mt-12 font-display text-title text-ink">Your requests</h2>

      {loading ? (
        <div className="mt-5 space-y-3">
          <div className="skeleton h-28 rounded-2xl" />
          <div className="skeleton h-28 rounded-2xl" />
        </div>
      ) : rows.length ? (
        <div className="mt-5 space-y-3">
          {rows.map((row, index) => (
            <BookingRow
              key={row.id}
              row={row}
              index={index}
              expanded={open === row.id}
              onToggle={() => setOpen(open === row.id ? null : row.id)}
              onCancel={() => void cancel(row.id)}
              onBookAgain={() => bookAgain(row)}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid overflow-hidden rounded-sheet border border-line bg-white sm:grid-cols-[1.2fr_1fr]">
          <div className="p-8 sm:p-10">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Inbox size={22} /></span>
            <h3 className="mt-5 font-display text-title text-ink">Nothing booked yet.</h3>
            <p className="mt-4 prose-khidmat">
              Once you send a request it lands here with its status, contact details and a place to review the job afterwards.
            </p>
            <div className="mt-7"><ActionButton kind="brand" onClick={onBrowse} arrow>Find a service</ActionButton></div>
          </div>
          <div className="relative min-h-[14rem]">
            <img src={services[0].image} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-canvas/90 via-canvas/25 to-transparent" />
          </div>
        </div>
      )}
    </main>
  );
}

/* -------------------------------------------------------------- one row -- */

function BookingRow({ row, index, expanded, onToggle, onCancel, onBookAgain }: {
  row: DbBooking;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onCancel: () => void;
  onBookAgain: () => void;
}) {
  return (
    <article data-reveal style={{ '--reveal-delay': `${index * 60}ms` } as CSSProperties} className="listing overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-display text-[1.05rem] font-bold tracking-[-.025em] text-ink">{row.service_title}</h3>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[.85rem] text-ink-muted">
            with <strong className="font-semibold text-ink-soft">{row.provider_name}</strong>
            <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} className="text-brand-500" />{row.preferred_date}</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 size={14} className="text-brand-500" />{row.preferred_time}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={row.status} />
          <button type="button" onClick={onToggle} aria-expanded={expanded} className="pill border border-line px-3 py-1.5 text-xs font-bold text-ink-soft hover:border-brand-300 hover:bg-brand-50">
            {expanded ? 'Hide details' : 'Details'}
          </button>
        </div>
      </div>

      <div className="faq-body" data-open={expanded}>
        <div className="overflow-hidden border-t border-line">
          <div className="grid gap-5 p-5 sm:grid-cols-2">
            <div>
              <p className="text-[.7rem] font-bold uppercase tracking-[.14em] text-ink-faint">Location</p>
              <p className="mt-1.5 flex items-center gap-2 text-[.9rem] text-ink-soft"><MapPin size={15} className="text-brand-600" />{row.location}</p>
              <p className="mt-3 text-[.7rem] font-bold uppercase tracking-[.14em] text-ink-faint">Contact on the request</p>
              <p className="mt-1.5 flex items-center gap-2 text-[.9rem] text-ink-soft"><Phone size={15} className="text-brand-600" />{row.phone}</p>
            </div>
            <div>
              <p className="text-[.7rem] font-bold uppercase tracking-[.14em] text-ink-faint">Your note to the professional</p>
              <p className="mt-1.5 text-[.9rem] leading-7 text-ink-muted">{row.instructions || 'No extra notes were added.'}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-line bg-canvas/60 px-5 py-4">
            {row.status === 'pending' && (
              <button type="button" onClick={onCancel} className="pill inline-flex items-center gap-1.5 border border-line bg-white px-3.5 py-2 text-xs font-bold text-ink-muted hover:border-danger/40 hover:text-danger">
                <X size={14} /> Cancel request
              </button>
            )}
            {['completed', 'rejected', 'cancelled'].includes(row.status) && (
              <button type="button" onClick={onBookAgain} className="pill bg-brand-50 px-3.5 py-2 text-xs font-bold text-brand-600 hover:bg-brand-600 hover:text-white">
                Book again
              </button>
            )}
            {row.status === 'completed' && row.provider_id && <ReviewComposer row={row} />}
          </div>
        </div>
      </div>
    </article>
  );
}

function ReviewComposer({ row }: { row: DbBooking }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [problem, setProblem] = useState('');
  const [saved, setSaved] = useState(false);

  const submit = async () => {
    if (!row.provider_id) return;
    setProblem('');
    if (comment.trim().length < 8) { setProblem('Add a sentence or two about the work.'); return; }
    setSaving(true);
    const { error } = await createReview({
      provider_id: row.provider_id,
      booking_id: row.id,
      rating,
      comment: comment.trim(),
    });
    setSaving(false);
    if (error) { setProblem(error.message); return; }
    setSaved(true);
    setOpen(false);
  };

  if (saved) return <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-2 text-xs font-bold text-brand-600"><CheckCircle2 size={14} /> Review published</span>;

  return (
    <div className="w-full">
      <button type="button" onClick={() => setOpen((current) => !current)} className="pill bg-ember-soft px-3.5 py-2 text-xs font-bold text-ember-800 hover:bg-ember-400 hover:text-ember-900">
        {open ? 'Close review' : 'Rate this job'}
      </button>

      <div className="faq-body" data-open={open}>
        <div className="overflow-hidden">
          <div className="mt-4 rounded-2xl border border-line bg-canvas/60 p-4">
            <div className="flex items-center gap-1.5" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} onMouseEnter={() => setHover(star)} aria-label={`${star} star${star > 1 ? 's' : ''}`} className="rounded-full p-1 transition-transform duration-300 hover:scale-125">
                  <Star size={18} fill={(hover || rating) >= star ? 'currentColor' : 'none'} className={(hover || rating) >= star ? 'text-ember-600' : 'text-line-strong'} />
                </button>
              ))}
              <span className="ml-2 text-xs text-ink-muted">for {row.provider_name}</span>
            </div>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={3}
              placeholder="How did the work go? Would you book again?"
              className="field-input mt-3 resize-none"
            />
            {problem && <p className="mt-2 text-xs font-semibold text-danger">{problem}</p>}
            <div className="mt-3 flex items-center gap-2">
              <ActionButton kind="brand" size="sm" onClick={() => void submit()} disabled={saving}>{saving ? 'Publishing' : 'Publish review'}</ActionButton>
              <span className="text-xs text-ink-faint">Only you and the professional see who wrote it.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
