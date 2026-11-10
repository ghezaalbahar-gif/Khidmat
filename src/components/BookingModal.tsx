import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { BadgeCheck, MapPin, X } from 'lucide-react';
import type { Service } from '@/data/catalog';
import { timeSlots } from '@/data/catalog';
import { createBooking, type AuthUser } from '@/lib/backend';
import { SelectField, TextAreaField, TextField } from '@/components/Field';
import ActionButton from '@/components/ActionButton';
import Notice from '@/components/Notice';
import Rating from '@/components/Rating';

type Props = {
  service: Service;
  user: AuthUser | null;
  onClose: () => void;
  onSuccess: (service: Service) => void;
  onSignIn: () => void;
};

type Errors = Partial<Record<'name' | 'phone' | 'date' | 'time', string>>;

export default function BookingModal({ service, user, onClose, onSuccess, onSignIn }: Props) {
  const [form, setForm] = useState({ name: '', phone: '', location: service.location, date: '', time: '', instructions: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [problem, setProblem] = useState('');
  const [saving, setSaving] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const update = (key: keyof typeof form) => (value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector<HTMLElement>('input, select, textarea, button')?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setProblem('');
    if (!user) { onSignIn(); return; }

    const next: Errors = {};
    if (form.name.trim().length < 2) next.name = 'Tell the professional who to expect.';
    if (form.phone.replace(/\D/g, '').length < 9) next.phone = 'Enter a reachable phone number.';
    if (!form.date) next.date = 'Choose a date.';
    if (!form.time) next.time = 'Choose a time window.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    const { error } = await createBooking(service, {
      name: form.name.trim(),
      phone: form.phone.trim(),
      location: form.location.trim() || 'Kabul',
      date: form.date,
      time: form.time,
      instructions: form.instructions.trim(),
    });
    setSaving(false);
    if (error) { setProblem(error.message); return; }
    onSuccess(service);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink-deep/55 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-label={`Book ${service.title}`} className="max-h-[94vh] w-full max-w-xl animate-rise-in overflow-y-auto rounded-t-sheet bg-white sm:rounded-sheet sm:shadow-sheet">
        <div className="relative">
          <img src={service.image} alt="" className="h-28 w-full object-cover sm:h-32" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/80 via-ink-deep/25 to-transparent" />
          <button type="button" onClick={onClose} aria-label="Close booking form" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink-soft backdrop-blur transition hover:bg-white hover:text-danger">
            <X size={18} />
          </button>
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <p className="eyebrow eyebrow-light">Booking request</p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-[-.045em]">{service.title}</h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[.85rem] text-white/75">
              <span className="inline-flex items-center gap-1.5"><BadgeCheck size={14} className="text-brand-300" />{service.provider}</span>
              <span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-brand-300" />{service.location}</span>
              <Rating value={service.rating} count={service.reviews} size={13} />
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4 p-5 sm:p-7">
          {!user && (
            <Notice kind="info">
              Please sign in before sending a request — bookings are saved to your account so you can track them later.
              <div className="mt-3"><ActionButton kind="quiet" size="sm" onClick={onSignIn}>Sign in or create an account</ActionButton></div>
            </Notice>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Your name" value={form.name} onChange={update('name')} placeholder="e.g. Laila Ahmad" error={errors.name} required />
            <TextField label="Phone number" value={form.phone} onChange={update('phone')} placeholder="07X XXX XXXX" error={errors.phone} required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Preferred date" type="date" value={form.date} onChange={update('date')} error={errors.date} required />
            <SelectField label="Preferred time" value={form.time} onChange={update('time')} options={['', ...timeSlots]} error={errors.time} required />
          </div>

          <TextField label="Service location" value={form.location} onChange={update('location')} placeholder="Neighbourhood or full address" hint="We share this only with the professional you choose." />
          <TextAreaField label="Anything the professional should know?" value={form.instructions} onChange={update('instructions')} rows={3} placeholder="Tell us about the task, access, or timing." />

          {problem && <Notice kind="error" onDismiss={() => setProblem('')}>{problem}</Notice>}

          <ActionButton kind="brand" type="submit" full size="lg" disabled={saving} arrow>
            {saving ? 'Sending your request' : user ? 'Send booking request' : 'Sign in to continue'}
          </ActionButton>
          <p className="text-center text-xs text-ink-faint">No payment is taken here. You agree on details with the professional first.</p>
        </form>
      </div>
    </div>
  );
}
