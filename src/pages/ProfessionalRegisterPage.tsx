import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, BadgeCheck, CalendarCheck2, Lock, MailCheck, ShieldCheck, Star, Wrench } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  backendReady, createProviderProfile, fetchProfileByUser,
  type AuthUser,
} from '@/lib/backend';
import { kabulAreas, categories } from '@/data/catalog';
import ActionButton from '@/components/ActionButton';
import Notice from '@/components/Notice';
import { SelectField, TextAreaField, TextField } from '@/components/Field';

type Props = {
  user: AuthUser | null;
  navigate: (path: string) => void;
  onSignedIn: () => void;
};

type Errors = Partial<Record<'fullName' | 'email' | 'phone' | 'password' | 'bio' | 'experience', string>>;

const nextSteps = [
  { icon: Wrench, title: 'Publish your first service', text: 'Set a title, a price and the area you cover.' },
  { icon: CalendarCheck2, title: 'Answer booking requests', text: 'Accept or decline each request from your dashboard.' },
  { icon: Star, title: 'Collect reviews after the job', text: 'Completed bookings are the only ones that can be rated.' },
];

export default function ProfessionalRegisterPage({ user, navigate, onSignedIn }: Props) {
  const [form, setForm] = useState({
    fullName: '', email: user?.email ?? '', phone: '', password: '',
    category: categories[0].name, location: kabulAreas[0], bio: '', experience: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [problem, setProblem] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);

  const update = (key: keyof typeof form) => (value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setProblem('');
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (form.fullName.trim().length < 3) next.fullName = 'Enter your full name as customers should see it.';
    if (!user) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Enter a valid email address.';
      if (form.password.length < 6) next.password = 'Use at least 6 characters.';
    }
    if (form.phone.replace(/\D/g, '').length < 9) next.phone = 'Enter a reachable phone number (at least 9 digits).';
    if (form.bio.trim().length < 20) next.bio = `Add a little more detail — ${Math.max(0, 20 - form.bio.trim().length)} characters to go.`;
    const years = Number(form.experience);
    if (form.experience.trim() === '' || !Number.isFinite(years) || years < 0 || years > 60) {
      next.experience = 'Enter your years of experience as a number between 0 and 60.';
    }
    return next;
  };

  const saveProfile = async (userId: string) => {
    // A second profile for the same account would break the unique link, so say so first.
    const existing = await fetchProfileByUser(userId);
    if (existing.error) { setProblem(existing.error.message); return false; }
    if (existing.data) {
      setProblem(`This account already has a professional profile for ${existing.data.full_name}. Open your dashboard to edit it.`);
      return false;
    }

    const { error } = await createProviderProfile(userId, {
      full_name: form.fullName.trim(),
      professional_title: `${form.category} professional`,
      bio: form.bio.trim(),
      location: form.location,
      experience_years: Number(form.experience),
    });
    if (error) { setProblem(error.message); return false; }
    return true;
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setProblem('');
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    if (!supabase || !backendReady) {
      setProblem('Khidmat is not connected to its database right now, so a professional profile cannot be saved. Sign in again once the connection is restored.');
      return;
    }

    setSaving(true);
    try {
      if (!user) {
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: { data: { full_name: form.fullName.trim(), phone: form.phone.trim(), role: 'professional' } },
        });
        if (error) { setProblem(error.message); return; }
        if (!data.session || !data.user) {
          // Email confirmation is on: the account exists, the profile does not yet.
          setConfirming(true);
          return;
        }
        onSignedIn();
        const saved = await saveProfile(data.user.id);
        if (saved) navigate('/professional');
        return;
      }

      const saved = await saveProfile(user.id);
      if (saved) {
        onSignedIn();
        navigate('/professional');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="page-shell">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[1.15fr_.85fr] lg:gap-14 lg:px-8 lg:py-16">
        {/* ------------------------------------------------------------ form */}
        <div>
          <button
            type="button"
            onClick={() => navigate('/professionals')}
            className="inline-flex items-center gap-2 text-[.82rem] font-bold uppercase tracking-[.14em] text-ink-muted transition-all duration-300 hover:gap-3 hover:text-brand-600"
          >
            <ArrowLeft size={15} /> Back to For professionals
          </button>

          <p className="eyebrow mt-7">Professional registration</p>
          <h1 className="mt-3 font-display text-display-sm text-ink">Tell Kabul what you do best.</h1>
          <p className="mt-4 max-w-xl prose-khidmat">
            These details become your public profile. Everything is saved to the Khidmat database — nothing is faked, and you can edit it later from your dashboard.
          </p>

          <form onSubmit={submit} className="mt-9 space-y-5" noValidate>
            <fieldset className="space-y-5">
              <legend className="field-heading">Your identity</legend>
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  id="pro-name" label="Full name" value={form.fullName} onChange={update('fullName')}
                  placeholder="e.g. Ahmad Wali" error={errors.fullName} required
                />
                <TextField
                  id="pro-phone" label="Phone number" type="tel" value={form.phone} onChange={update('phone')}
                  placeholder="07X XXX XXXX" error={errors.phone}
                  hint="Saved on your account. Customers only see it after booking." required
                />
              </div>

              {user ? (
                <div className="rounded-2xl border border-line bg-mist/60 p-4">
                  <p className="flex items-center gap-2 text-[.7rem] font-extrabold uppercase tracking-[.16em] text-ink-faint">
                    <Lock size={13} /> Signed in account
                  </p>
                  <p className="mt-1.5 font-display text-[.95rem] font-bold text-ink">{user.email}</p>
                  <p className="mt-1 text-[.8rem] leading-6 text-ink-muted">
                    Your professional profile will be linked to this account. {user.isProfessional ? '' : 'You can still book services as a customer.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    id="pro-email" label="Email address" type="email" value={form.email} onChange={update('email')}
                    placeholder="you@example.com" error={errors.email} required
                  />
                  <TextField
                    id="pro-password" label="Password" type="password" value={form.password} onChange={update('password')}
                    placeholder="At least 6 characters" error={errors.password}
                    hint="Creates your Khidmat sign-in." required
                  />
                </div>
              )}
            </fieldset>

            <fieldset className="space-y-5">
              <legend className="field-heading">Your work</legend>
              <div className="grid gap-5 sm:grid-cols-2">
                <SelectField
                  id="pro-category" label="Service category" value={form.category}
                  onChange={update('category')} options={categories.map((category) => category.name)}
                  hint="This is the field customers can find you in."
                />
                <SelectField
                  id="pro-location" label="Location in Kabul" value={form.location}
                  onChange={update('location')} options={kabulAreas}
                />
              </div>
              <TextField
                id="pro-experience" label="Years of experience" type="number" value={form.experience}
                onChange={update('experience')} placeholder="e.g. 6" error={errors.experience} required
              />
              <TextAreaField
                id="pro-bio" label="Short professional description" value={form.bio} onChange={update('bio')}
                rows={4} placeholder="What you do, how you work, and what customers can expect."
                error={errors.bio} hint={`${form.bio.trim().length} characters — this appears on your public profile.`} required
              />
            </fieldset>

            {problem && <Notice kind="error" onDismiss={() => setProblem('')}>{problem}</Notice>}

            {confirming && (
              <Notice kind="success">
                <span className="flex items-start gap-2">
                  <MailCheck size={17} className="mt-0.5 shrink-0" />
                  <span>
                    <strong>Your account was created.</strong> Khidmat requires email confirmation, so your professional profile has
                    <em> not</em> been saved yet. Open the link in <strong>{form.email}</strong>, sign in, then return to this page —
                    your details will still be here once you re-enter them.
                    <span className="mt-3 block"><ActionButton kind="quiet" size="sm" onClick={() => navigate('/signin')}>Go to sign in</ActionButton></span>
                  </span>
                </span>
              </Notice>
            )}

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <ActionButton kind="brand" type="submit" size="lg" disabled={saving} arrow>
                {saving ? 'Saving your profile' : user ? 'Save profile and open dashboard' : 'Create professional account'}
              </ActionButton>
              <span className="text-[.8rem] text-ink-faint">Free to join. No payment details are collected.</span>
            </div>
          </form>

          {!user && (
            <p className="mt-7 border-t border-line pt-6 text-[.9rem] text-ink-muted">
              Already have a Khidmat account?{' '}
              <button type="button" onClick={() => navigate('/signin')} className="btn-link font-bold text-brand-600">Sign in first</button>{' '}
              and we will link your professional profile to it.
            </p>
          )}
        </div>

        {/* ----------------------------------------------------- side rail -- */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="overflow-hidden rounded-sheet border border-line bg-white shadow-card">
            <div className="band-ink px-6 py-7 text-white">
              <p className="eyebrow eyebrow-light">What happens next</p>
              <p className="mt-3 font-display text-[1.2rem] font-bold leading-snug tracking-[-.03em]">
                Three things to do once your profile is live.
              </p>
            </div>
            <ol className="divide-y divide-line">
              {nextSteps.map(({ icon: Icon, title, text }) => (
                <li key={title} className="group flex gap-4 px-6 py-5 transition-colors duration-300 hover:bg-canvas">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 transition-transform duration-500 ease-silk group-hover:-translate-y-0.5">
                    <Icon size={17} />
                  </span>
                  <span>
                    <span className="block font-display text-[.95rem] font-bold text-ink">{title}</span>
                    <span className="mt-1 block text-[.85rem] leading-6 text-ink-muted">{text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-5 rounded-2xl border border-line bg-canvas p-5">
            <p className="flex items-center gap-2 text-[.7rem] font-extrabold uppercase tracking-[.16em] text-ink-faint">
              <ShieldCheck size={14} className="text-brand-600" /> Saved where
            </p>
            <ul className="mt-3 space-y-2.5 text-[.86rem] leading-6 text-ink-muted">
              <li className="flex gap-2"><BadgeCheck size={15} className="mt-0.5 shrink-0 text-brand-500" /> Name, title, bio, area and experience go to <code className="rounded bg-mist px-1 py-0.5 text-[.78rem] text-ink-soft">provider_profiles</code>.</li>
              <li className="flex gap-2"><Lock size={15} className="mt-0.5 shrink-0 text-brand-500" /> Your email and password stay with the Khidmat auth service.</li>
              <li className="flex gap-2"><Wrench size={15} className="mt-0.5 shrink-0 text-brand-500" /> Services and prices are added next, in your dashboard.</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
