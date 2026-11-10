import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  BadgeCheck, CalendarDays, Check, CheckCircle2, ChevronRight, Clock3, Inbox,
  MapPin, Pencil, Phone, Plus, RefreshCw, Star, Trash2, X,
} from 'lucide-react';
import {
  dbCategories, fetchProfileByUser, fetchProviderBookings, fetchProviderServices, fetchReviewsForProvider,
  createProviderService, removeProviderService, resolveCategoryId, setBookingStatus, updateProviderProfile,
  updateProviderService, type AuthUser, type DbBooking, type DbCategory, type DbProvider, type DbReview, type DbService,
} from '@/lib/backend';
import { kabulAreas, priceUnits } from '@/data/catalog';
import ActionButton from '@/components/ActionButton';
import Notice from '@/components/Notice';
import StatusPill from '@/components/StatusPill';
import Rating from '@/components/Rating';
import { SelectField, TextAreaField, TextField } from '@/components/Field';
import { useCountUp } from '@/lib/motion';

type Props = { user: AuthUser; navigate: (path: string) => void };

type Tab = 'requests' | 'services' | 'reviews' | 'profile';

const tabs: { id: Tab; label: string }[] = [
  { id: 'requests', label: 'Requests' },
  { id: 'services', label: 'My services' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'profile', label: 'Profile' },
];

const emptyDraft = { title: '', category: '', description: '', price: '', unit: priceUnits[0], location: kabulAreas[0] };

export default function ProfessionalDashboardPage({ user, navigate }: Props) {
  const [profile, setProfile] = useState<DbProvider | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [tab, setTab] = useState<Tab>('requests');
  const [problem, setProblem] = useState('');
  const [flash, setFlash] = useState('');

  const [bookings, setBookings] = useState<DbBooking[]>([]);
  const [myServices, setMyServices] = useState<DbService[]>([]);
  const [reviews, setReviews] = useState<DbReview[]>([]);
  const [categoriesList, setCategoriesList] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const loadAll = useCallback(async (providerId: string) => {
    setLoading(true);
    const [requests, listings, feedback, categoriesRows] = await Promise.all([
      fetchProviderBookings(providerId),
      fetchProviderServices(providerId),
      fetchReviewsForProvider(providerId),
      dbCategories(),
    ]);
    const issues = [requests.error, listings.error, feedback.error].filter(Boolean).map((item) => item?.message ?? '');
    setBookings(requests.data ?? []);
    setMyServices(listings.data ?? []);
    setReviews(feedback.data ?? []);
    setCategoriesList(categoriesRows);
    setProblem(issues[0] ?? '');
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data, error } = await fetchProfileByUser(user.id);
      if (!active) return;
      setProfile(data ?? null);
      setProblem(error?.message ?? '');
      setLoadingProfile(false);
      if (data) await loadAll(data.id);
    })();
    return () => { active = false; };
  }, [user.id, loadAll]);

  const changeStatus = async (row: DbBooking, status: string) => {
    setBusy(row.id);
    const { error } = await setBookingStatus(row.id, status);
    setBusy(null);
    if (error) { setProblem(error.message); return; }
    setBookings((current) => current.map((item) => (item.id === row.id ? { ...item, status } : item)));
    setFlash(status === 'accepted' ? `You accepted ${row.customer_name}'s request.` : status === 'rejected' ? 'The request was declined.' : status === 'in_progress' ? 'The job is marked in progress.' : 'The job is marked completed.');
  };

  const saveService = async (draft: typeof emptyDraft, editingId: string | null) => {
    const categoryId = await resolveCategoryId(draft.category);
    if (!categoryId) { setProblem('That category is not in the Khidmat database yet, so the service cannot be saved.'); return false; }
    const payload = {
      category_id: categoryId,
      title: draft.title.trim(),
      description: draft.description.trim(),
      price: Number(draft.price),
      price_unit: draft.unit,
      location: draft.location,
    };
    const { error } = editingId
      ? await updateProviderService(editingId, payload)
      : await createProviderService({ ...payload, provider_id: profile?.id ?? '' });
    if (error) { setProblem(error.message); return false; }
    if (!profile) return true;
    await loadAll(profile.id);
    setFlash(editingId ? 'Your service was updated.' : 'Your service is live on Khidmat.');
    return true;
  };

  const deleteService = async (row: DbService) => {
    if (!profile) return;
    setBusy(row.id);
    const { error } = await removeProviderService(row.id);
    setBusy(null);
    if (error) { setProblem(error.message); return; }
    setMyServices((current) => current.filter((item) => item.id !== row.id));
    setFlash(`“${row.title}” is no longer listed.`);
  };

  const saveProfile = async (input: { full_name: string; professional_title: string; bio: string; location: string; experience_years: number }) => {
    if (!profile) return false;
    const { error } = await updateProviderProfile(profile.id, input);
    if (error) { setProblem(error.message); return false; }
    setProfile({ ...profile, ...input });
    setProblem('');
    setFlash('Your profile is updated.');
    return true;
  };

  const categoryNames = categoriesList.map((category) => category.name);
  const categoryLabel = (id: string) => categoriesList.find((category) => category.id === id)?.name ?? 'Your category';
  const pendingCount = bookings.filter((row) => row.status === 'pending').length;
  const activeCount = bookings.filter((row) => ['accepted', 'in_progress'].includes(row.status)).length;
  const doneCount = bookings.filter((row) => row.status === 'completed').length;
  const stats = [useCountUp(pendingCount, { duration: 900 }), useCountUp(activeCount, { duration: 900 }), useCountUp(doneCount, { duration: 900 })];
  const tabIndex = tabs.findIndex((item) => item.id === tab);

  /* ------------------------------------------------------- gated states -- */

  if (loadingProfile) {
    return (
      <main className="page-shell mx-auto max-w-6xl px-5 py-14 lg:px-8">
        <div className="skeleton h-9 w-48 rounded-full" />
        <div className="skeleton mt-5 h-12 w-2/3 rounded-2xl" />
        <div className="skeleton mt-10 h-16 rounded-2xl" />
        <div className="mt-4 space-y-3"><div className="skeleton h-32 rounded-2xl" /><div className="skeleton h-32 rounded-2xl" /></div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="page-shell band mx-auto flex min-h-[60vh] max-w-3xl flex-col justify-center px-5 py-16 lg:px-8">
        <p className="eyebrow">No profile yet</p>
        <h1 className="mt-3 font-display text-display-sm text-ink">This account has no professional profile.</h1>
        <p className="mt-5 prose-khidmat">
          You are signed in as <strong className="text-ink-soft">{user.email}</strong>. Finish the short registration form and your
          dashboard opens with requests, services, prices and reviews in one place.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ActionButton kind="brand" size="lg" onClick={() => navigate('/register')} arrow>Complete professional registration</ActionButton>
          <ActionButton kind="quiet" size="lg" onClick={() => navigate('/bookings')}>View my bookings instead</ActionButton>
        </div>
        {problem && <div className="mt-7"><Notice kind="error" onDismiss={() => setProblem('')}>{problem}</Notice></div>}
      </main>
    );
  }

  return (
    <main className="page-shell mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16">
      {/* ---------------------------------------------------------- header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-4">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover" />
          ) : (
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-50 font-display text-lg font-extrabold text-brand-700">
              {profile.full_name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
            </span>
          )}
          <div>
            <p className="eyebrow">Professional dashboard</p>
            <h1 className="mt-2 font-display text-title text-ink">{profile.full_name}</h1>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[.85rem] text-ink-muted">
              <span className="inline-flex items-center gap-1.5"><BadgeCheck size={14} className="text-brand-600" />{profile.professional_title}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-brand-500" />{profile.location}</span>
              <Rating value={Number(profile.rating)} count={profile.review_count} size={13} />
            </p>
          </div>
        </div>
        <ActionButton kind="quiet" size="sm" onClick={() => void loadAll(profile.id)} icon={<RefreshCw size={15} />}>Refresh data</ActionButton>
      </div>

      {/* ------------------------------------------------------ stat strip */}
      <div className="mt-9 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
        {[
          { label: 'Awaiting your answer', ref: stats[0].ref, value: stats[0].display, icon: Inbox },
          { label: 'Active jobs', ref: stats[1].ref, value: stats[1].display, icon: Clock3 },
          { label: 'Completed', ref: stats[2].ref, value: stats[2].display, icon: CheckCircle2 },
        ].map(({ label, ref, value, icon: Icon }) => (
          <div key={label} className="bg-white p-5">
            <Icon size={18} className="text-brand-600" />
            <span ref={ref} className="mt-5 block font-display text-3xl font-extrabold tracking-[-.05em] text-ink">{value}</span>
            <p className="mt-1 text-[.82rem] text-ink-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* -------------------------------------------------------------- tabs */}
      <div className="relative mt-8 grid grid-cols-2 rounded-2xl border border-line bg-white p-1.5 shadow-card sm:grid-cols-4">
        <span
          aria-hidden="true"
          className="absolute inset-y-1.5 left-1.5 hidden w-[calc(25%-0.1875rem)] rounded-xl bg-brand-50 transition-transform duration-500 ease-silk sm:block"
          style={{ transform: `translateX(calc(${Math.max(tabIndex, 0)} * 100%))` }}
        />
        {tabs.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => { setTab(item.id); setFlash(''); }}
              aria-current={active ? 'true' : undefined}
              className={`relative z-10 rounded-xl px-3 py-3 text-center text-[.85rem] font-bold transition-colors duration-300 ${
                active ? 'text-brand-700' : 'text-ink-muted hover:text-ink-soft'
              }`}
            >
              {item.label}
              {item.id === 'requests' && pendingCount > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-ember-400 px-1.5 text-[.68rem] font-extrabold text-ember-900">{pendingCount}</span>
              )}
            </button>
          );
        })}
      </div>

      {problem && <div className="mt-6"><Notice kind="error" onDismiss={() => setProblem('')}>{problem}</Notice></div>}
      {flash && <div className="mt-6"><Notice kind="success" onDismiss={() => setFlash('')}>{flash}</Notice></div>}

      {/* -------------------------------------------------------- requests */}
      {tab === 'requests' && (
        <section className="mt-8">
          <h2 className="font-display text-title text-ink">Booking requests</h2>
          <p className="mt-2 text-[.9rem] text-ink-muted">Only requests assigned to your profile appear here.</p>

          {loading ? (
            <div className="mt-5 space-y-3"><div className="skeleton h-36 rounded-2xl" /><div className="skeleton h-36 rounded-2xl" /></div>
          ) : bookings.length ? (
            <div className="mt-5 space-y-3">
              {bookings.map((row, index) => (
                <RequestRow
                  key={row.id}
                  row={row}
                  index={index}
                  busy={busy === row.id}
                  onStatus={(status) => void changeStatus(row, status)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<CalendarDays size={22} />}
              title="No requests yet."
              text="When a customer books one of your services, the request lands here with their date, area and notes. Publish a service to get discoverable."
              action={<ActionButton kind="quiet" onClick={() => setTab('services')} arrow>Go to my services</ActionButton>}
            />
          )}
        </section>
      )}

      {/* -------------------------------------------------------- services */}
      {tab === 'services' && (
        <section className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_.75fr] lg:items-start">
          <div>
            <h2 className="font-display text-title text-ink">Your listings</h2>
            <p className="mt-2 text-[.9rem] text-ink-muted">Customers see these titles, prices and descriptions.</p>
            {loading ? (
              <div className="mt-5 space-y-3"><div className="skeleton h-24 rounded-2xl" /><div className="skeleton h-24 rounded-2xl" /></div>
            ) : myServices.length ? (
              <div className="mt-5 space-y-3">
                {myServices.map((row, index) => (
                  <article key={row.id} data-reveal style={{ '--reveal-delay': `${index * 60}ms` } as CSSProperties} className="listing rounded-2xl border border-line bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-display text-[1.02rem] font-bold tracking-[-.025em] text-ink">{row.title}</h3>
                        <p className="mt-1 text-[.82rem] text-ink-muted">{categoryLabel(row.category_id)} · {row.location}</p>
                        {row.description && <p className="mt-2.5 text-[.88rem] leading-6 text-ink-muted">{row.description}</p>}
                      </div>
                      <p className="font-display text-[1.15rem] font-extrabold tracking-[-.04em] text-ink">
                        AFN {Number(row.price).toLocaleString()}
                        <span className="ml-1 text-[.7rem] font-bold uppercase tracking-[.12em] text-ink-faint">{row.price_unit}</span>
                      </p>
                    </div>
                    <div className="mt-4 flex gap-2 border-t border-line pt-4">
                      <ServiceEditor
                        row={row}
                        categoryName={categoryLabel(row.category_id)}
                        categoryNames={categoryNames.length ? categoryNames : [categoryLabel(row.category_id)]}
                        onSave={(draft) => saveService(draft, row.id)}
                        onDelete={() => void deleteService(row)}
                        busy={busy === row.id}
                      />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Plus size={22} />}
                title="Nothing published yet."
                text="Add the first service you want to be hired for. It appears in search for your category as soon as it is saved."
              />
            )}
          </div>

          <div className="lg:sticky lg:top-28">
            <h2 className="font-display text-[1.15rem] font-bold tracking-[-.03em] text-ink">Add a service</h2>
            <ServiceForm categoryNames={categoryNames} onSave={(draft) => saveService(draft, null)} />
          </div>
        </section>
      )}

      {/* --------------------------------------------------------- reviews */}
      {tab === 'reviews' && (
        <section className="mt-8">
          <h2 className="font-display text-title text-ink">Customer reviews</h2>
          <p className="mt-2 text-[.9rem] text-ink-muted">Reviews can only be left after a booking you completed.</p>
          {loading ? (
            <div className="mt-5 space-y-3"><div className="skeleton h-24 rounded-2xl" /></div>
          ) : reviews.length ? (
            <ul className="mt-5 space-y-3">
              {reviews.map((review, index) => (
                <li key={review.id} data-reveal style={{ '--reveal-delay': `${index * 70}ms` } as CSSProperties} className="rounded-2xl border border-line bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Rating value={Number(review.rating)} size={15} />
                    <span className="text-[.75rem] text-ink-faint">{new Date(review.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <p className="mt-3 text-[.95rem] leading-7 text-ink-soft">{review.comment}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<Star size={22} />}
              title="No reviews yet."
              text="After you mark a job completed, the customer can rate it and the review shows up here and on your public profile."
              action={<ActionButton kind="quiet" onClick={() => setTab('requests')} arrow>Open requests</ActionButton>}
            />
          )}
        </section>
      )}

      {/* --------------------------------------------------------- profile */}
      {tab === 'profile' && (
        <section className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
          <div>
            <h2 className="font-display text-title text-ink">Your public profile</h2>
            <p className="mt-2 text-[.9rem] text-ink-muted">This is what households read before they send a request.</p>
            <ProfileForm profile={profile} onSave={saveProfile} />
          </div>
          <aside className="space-y-5">
            <div className="rounded-2xl border border-line bg-white p-5">
              <p className="text-[.7rem] font-extrabold uppercase tracking-[.16em] text-ink-faint">Account</p>
              <p className="mt-2.5 break-words text-[.92rem] font-semibold text-ink">{user.email}</p>
              <p className="mt-1 text-[.82rem] leading-6 text-ink-muted">Your login is managed by Khidmat sign-in. Rating and review counts come from completed jobs and cannot be edited here.</p>
            </div>
            <div className="rounded-2xl border border-line bg-canvas p-5">
              <p className="text-[.7rem] font-extrabold uppercase tracking-[.16em] text-ink-faint">Profile completeness</p>
              <ul className="mt-3 space-y-2.5 text-[.88rem]">
                {[
                  { done: Boolean(profile.bio.trim()), text: 'A short professional description' },
                  { done: myServices.length > 0, text: 'At least one published service' },
                  { done: myServices.some((row) => row.description.trim().length > 0), text: 'A description on a service' },
                  { done: reviews.length > 0, text: 'Your first review' },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-2.5">
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${item.done ? 'bg-brand-600 text-white' : 'border border-line-strong text-line-strong'}`}>
                      {item.done ? <Check size={12} /> : <ChevronRight size={12} />}
                    </span>
                    <span className={item.done ? 'text-ink-muted line-through decoration-line-strong' : 'text-ink-soft'}>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </section>
      )}
    </main>
  );
}

/* --------------------------------------------------------------- pieces -- */

function RequestRow({ row, index, busy, onStatus }: { row: DbBooking; index: number; busy: boolean; onStatus: (status: string) => void }) {
  return (
    <article data-reveal style={{ '--reveal-delay': `${index * 60}ms` } as CSSProperties} className="listing rounded-2xl border border-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display text-[1.05rem] font-bold tracking-[-.025em] text-ink">{row.service_title}</h3>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[.85rem] text-ink-muted">
            <span className="inline-flex items-center gap-1.5"><Phone size={14} className="text-brand-500" />{row.customer_name} · {row.phone}</span>
            <span className="inline-flex items-center gap-1.5"><CalendarDays size={14} className="text-brand-500" />{row.preferred_date}</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 size={14} className="text-brand-500" />{row.preferred_time}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-brand-500" />{row.location}</span>
          </p>
        </div>
        <StatusPill status={row.status} />
      </div>

      {row.instructions && (
        <p className="mt-4 rounded-xl bg-canvas px-4 py-3 text-[.88rem] leading-6 text-ink-muted">
          <span className="font-bold text-ink-soft">Customer note: </span>{row.instructions}
        </p>
      )}

      <div className="mt-4 flex gap-2 border-t border-line pt-4">
        {row.status === 'pending' && (
          <>
            <ActionButton kind="brand" size="sm" disabled={busy} onClick={() => onStatus('accepted')} icon={<Check size={15} />}>Accept request</ActionButton>
            <ActionButton kind="quiet" size="sm" disabled={busy} onClick={() => onStatus('rejected')} icon={<X size={15} />}>Decline</ActionButton>
          </>
        )}
        {row.status === 'accepted' && (
          <ActionButton kind="brand" size="sm" disabled={busy} onClick={() => onStatus('in_progress')}>Start job</ActionButton>
        )}
        {row.status === 'in_progress' && (
          <ActionButton kind="ember" size="sm" disabled={busy} onClick={() => onStatus('completed')} icon={<CheckCircle2 size={15} />}>Mark completed</ActionButton>
        )}
        {['completed', 'rejected', 'cancelled'].includes(row.status) && (
          <span className="inline-flex items-center gap-2 text-[.82rem] text-ink-faint">
            <Clock3 size={14} /> Requested on {new Date(row.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
          </span>
        )}
        {busy && <span className="inline-flex items-center gap-2 text-[.82rem] text-ink-muted"><RefreshCw size={14} className="animate-spin" />Saving</span>}
      </div>
    </article>
  );
}

function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="mt-6 flex flex-col gap-5 rounded-sheet border border-line bg-white p-7 sm:flex-row sm:items-start sm:p-9">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">{icon}</span>
      <div>
        <h3 className="font-display text-title text-ink">{title}</h3>
        <p className="mt-3 max-w-xl prose-khidmat">{text}</p>
        {action && <div className="mt-6">{action}</div>}
      </div>
    </div>
  );
}

function ServiceForm({ categoryNames, onSave, initial = emptyDraft, submitLabel = 'Publish service', onCancel }: {
  categoryNames: string[];
  onSave: (draft: typeof emptyDraft) => Promise<boolean>;
  initial?: typeof emptyDraft;
  submitLabel?: string;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const options = categoryNames.length ? categoryNames : ['Home cleaning'];

  const update = (key: keyof typeof emptyDraft) => (value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const submit = async () => {
    setError('');
    if (draft.title.trim().length < 4) { setError('Give the service a clear title (at least 4 characters).'); return; }
    const price = Number(draft.price);
    if (!Number.isFinite(price) || price <= 0) { setError('Set a price above zero in AFN.'); return; }
    setSaving(true);
    const ok = await onSave({ ...draft, category: draft.category || options[0] });
    setSaving(false);
    if (ok) { setDraft({ ...emptyDraft, category: options[0] }); onCancel?.(); }
  };

  return (
    <div className="mt-5 space-y-4 rounded-2xl border border-line bg-white p-5">
      <TextField label="Service title" value={draft.title} onChange={update('title')} placeholder="e.g. Deep home cleaning" />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Category" value={draft.category || options[0]} onChange={update('category')} options={options} />
        <SelectField label="Location" value={draft.location} onChange={update('location')} options={kabulAreas} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Price (AFN)" type="number" value={draft.price} onChange={update('price')} placeholder="1200" />
        <SelectField label="Price applies" value={draft.unit} onChange={update('unit')} options={priceUnits} />
      </div>
      <TextAreaField label="What the customer gets" value={draft.description} onChange={update('description')} rows={3} placeholder="Scope, materials, how long the visit usually takes." />
      {error && <Notice kind="error" onDismiss={() => setError('')}>{error}</Notice>}
      <div className="flex flex-wrap gap-2">
        <ActionButton kind="brand" size="sm" disabled={saving} onClick={() => void submit()} arrow>{saving ? 'Saving' : submitLabel}</ActionButton>
        {onCancel && <ActionButton kind="quiet" size="sm" onClick={onCancel}>Cancel</ActionButton>}
      </div>
    </div>
  );
}

function ServiceEditor({ row, categoryName, categoryNames, onSave, onDelete, busy }: {
  row: DbService;
  categoryName: string;
  categoryNames: string[];
  onSave: (draft: typeof emptyDraft) => Promise<boolean>;
  onDelete: () => void;
  busy: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const initial = {
    title: row.title,
    category: categoryNames.includes(categoryName) ? categoryName : categoryNames[0] ?? categoryName,
    description: row.description,
    price: String(row.price),
    unit: priceUnits.includes(row.price_unit) ? row.price_unit : priceUnits[0],
    location: kabulAreas.includes(row.location) ? row.location : kabulAreas[0],
  };

  return (
    <>
      <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} className="pill inline-flex items-center gap-1.5 border border-line px-3.5 py-2 text-xs font-bold text-ink-soft hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700">
        <Pencil size={14} /> {open ? 'Close editor' : 'Edit & price'}
      </button>
      <button
        type="button"
        onClick={() => (confirming ? onDelete() : setConfirming(true))}
        disabled={busy}
        className={`pill inline-flex items-center gap-1.5 border px-3.5 py-2 text-xs font-bold transition ${
          confirming ? 'border-danger/40 bg-danger-soft text-danger' : 'border-line text-ink-muted hover:border-danger/40 hover:text-danger'
        }`}
      >
        <Trash2 size={14} /> {confirming ? 'Tap again to remove' : 'Remove'}
      </button>

      <div className="faq-body w-full" data-open={open}>
        <div className="w-full overflow-hidden">
          <ServiceForm
            categoryNames={categoryNames}
            initial={initial}
            submitLabel="Save changes"
            onSave={async (draft) => { const ok = await onSave(draft); if (ok) setOpen(false); return ok; }}
            onCancel={() => setOpen(false)}
          />
        </div>
      </div>
    </>
  );
}

function ProfileForm({ profile, onSave }: { profile: DbProvider; onSave: (input: { full_name: string; professional_title: string; bio: string; location: string; experience_years: number }) => Promise<boolean> }) {
  const [draft, setDraft] = useState({
    fullName: profile.full_name,
    title: profile.professional_title,
    location: kabulAreas.includes(profile.location) ? profile.location : kabulAreas[0],
    experience: String(profile.experience_years),
    bio: profile.bio,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const update = (key: keyof typeof draft) => (value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setError('');
    setSaved(false);
  };

  const submit = async () => {
    setError('');
    if (draft.fullName.trim().length < 3) { setError('Your full name is required.'); return; }
    if (draft.title.trim().length < 3) { setError('Add a short job title, e.g. "Master Plumber".'); return; }
    const years = Number(draft.experience);
    if (!Number.isFinite(years) || years < 0 || years > 60) { setError('Years of experience must be a number between 0 and 60.'); return; }
    setSaving(true);
    const ok = await onSave({
      full_name: draft.fullName.trim(),
      professional_title: draft.title.trim(),
      bio: draft.bio.trim(),
      location: draft.location,
      experience_years: years,
    });
    setSaving(false);
    setSaved(ok);
  };

  return (
    <div className="mt-5 space-y-4 rounded-2xl border border-line bg-white p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Full name" value={draft.fullName} onChange={update('fullName')} />
        <TextField label="Professional title" value={draft.title} onChange={update('title')} hint="Shown next to your name everywhere." />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Location in Kabul" value={draft.location} onChange={update('location')} options={kabulAreas} />
        <TextField label="Years of experience" type="number" value={draft.experience} onChange={update('experience')} />
      </div>
      <TextAreaField label="Short professional description" value={draft.bio} onChange={update('bio')} rows={4} />
      {error && <Notice kind="error" onDismiss={() => setError('')}>{error}</Notice>}
      <div className="flex flex-wrap items-center gap-3">
        <ActionButton kind="brand" size="sm" disabled={saving} onClick={() => void submit()} arrow>{saving ? 'Saving' : 'Save profile'}</ActionButton>
        {saved && <span className="inline-flex items-center gap-1.5 text-[.82rem] font-bold text-brand-600"><CheckCircle2 size={15} /> Saved to Khidmat</span>}
      </div>
    </div>
  );
}
