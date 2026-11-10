import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, BadgeCheck, MailCheck, ShieldCheck, Sparkles, UserRound, Wrench } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { backendReady } from '@/lib/backend';
import { photos } from '@/data/catalog';
import ActionButton from '@/components/ActionButton';
import Notice from '@/components/Notice';
import Logo from '@/components/Logo';
import { TextField } from '@/components/Field';

type Props = {
  mode: 'login' | 'signup';
  role: 'customer' | 'professional';
  navigate: (path: string) => void;
  onSignedIn: () => void;
};

export default function AuthPage({ mode, role, navigate, onSignedIn }: Props) {
  const [form, setForm] = useState({ email: '', password: '', name: '', phone: '' });
  const [choice, setChoice] = useState<'customer' | 'professional'>(role);
  const [problem, setProblem] = useState('');
  const [pending, setPending] = useState(false);
  const [working, setWorking] = useState(false);

  const update = (key: keyof typeof form) => (value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setProblem('');
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending) { navigate('/signin'); return; }
    setProblem('');
    if (!supabase) { setProblem('Account access is not configured yet, so sign in cannot run. Connect Khidmat to Supabase to enable it.'); return; }
    if (!form.email.includes('@')) { setProblem('Enter a valid email address.'); return; }
    if (form.password.length < 6) { setProblem('Use at least 6 characters for your password.'); return; }
    if (mode === 'signup' && !backendReady) { setProblem('Registration needs the Khidmat database connection. It is not available right now.'); return; }

    setWorking(true);
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email: form.email.trim(), password: form.password })
      : await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: { data: { full_name: form.name.trim(), role: choice } },
      });
    setWorking(false);

    if (result.error) { setProblem(result.error.message); return; }

    // With email confirmation on, no session exists yet: say so instead of pretending.
    if (mode === 'signup' && !result.data.session) { setPending(true); return; }

    onSignedIn();
    if (mode === 'signup') navigate(choice === 'professional' ? '/register' : '/bookings');
    else navigate('/bookings');
  };

  return (
    <main className="page-shell grid lg:grid-cols-[1fr_1.05fr]">
      {/* ------------------------------------------------------- brand side */}
      <section className="band-ink relative hidden overflow-hidden px-10 py-14 text-white lg:flex lg:flex-col lg:justify-between xl:px-14">
        <div className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(79,168,127,.45),transparent_65%)] blur-2xl" />
        <div className="relative">
          <Logo tone="light" />
          <h2 className="mt-10 max-w-md font-display text-[2.35rem] font-extrabold leading-[1.06] tracking-[-.05em]">
            The trusted way to get things done in Kabul.
          </h2>
          <p className="mt-5 max-w-sm leading-7 text-white/65">
            One account for booking home help, tracking requests, and — if you do the work — running your professional profile.
          </p>
          <ul className="mt-9 space-y-3.5 text-[.92rem] text-white/70">
            {[
              { icon: ShieldCheck, text: 'Verified professionals with checked identities' },
              { icon: BadgeCheck, text: 'Prices and reviews visible before you book' },
              { icon: Sparkles, text: 'Free for professionals to list their services' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-ember-400 transition-transform duration-500 hover:-translate-y-0.5"><Icon size={17} /></span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative mt-10 overflow-hidden rounded-2xl border border-white/12">
          <img src={photos.plumbing} alt="A professional at work in a Kabul home" className="h-40 w-full object-cover opacity-85" />
        </div>
      </section>

      {/* --------------------------------------------------------- form side */}
      <section className="relative flex items-center justify-center px-5 py-14 lg:px-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden"><Logo /></div>

          <p className="eyebrow mt-6 lg:mt-0">{mode === 'login' ? 'Welcome back' : 'Create your account'}</p>
          <h1 className="mt-3 font-display text-title text-ink">
            {mode === 'login' ? 'Sign in to Khidmat.' : 'Join Khidmat.'}
          </h1>
          <p className="mt-3 text-[.95rem] leading-7 text-ink-muted">
            {mode === 'login'
              ? 'Your bookings, requests and reviews are waiting.'
              : choice === 'professional'
                ? 'Start with your account, then build your professional profile.'
                : 'Book trusted professionals and keep every request in one place.'}
          </p>

          {mode === 'signup' && (
            <div className="relative mt-7 grid grid-cols-2 rounded-2xl border border-line bg-white p-1.5 shadow-card">
              <span
                aria-hidden="true"
                className={`absolute inset-y-1.5 left-1.5 w-[calc(50%-0.375rem)] rounded-xl transition-transform duration-500 ease-silk ${choice === 'customer' ? 'translate-x-0 bg-brand-50' : 'translate-x-full bg-ember-soft'}`}
              />
              {(['customer', 'professional'] as const).map((option) => {
                const Icon = option === 'customer' ? UserRound : Wrench;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setChoice(option)}
                    aria-pressed={choice === option}
                    className={`relative z-10 flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-[.85rem] font-bold transition-colors duration-300 ${
                      choice === option ? (option === 'customer' ? 'text-brand-700' : 'text-ember-800') : 'text-ink-muted hover:text-ink-soft'
                    }`}
                  >
                    <Icon size={16} /> {option === 'customer' ? 'I need a service' : 'I offer services'}
                  </button>
                );
              })}
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === 'signup' && (
              <TextField label="Full name" value={form.name} onChange={update('name')} placeholder="e.g. Ahmad Wali" />
            )}
            <TextField label="Email address" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" required />
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={update('password')}
              placeholder="At least 6 characters"
              hint={mode === 'signup' ? 'Khidmat uses email/password sign-up. Nothing is charged.' : undefined}
              required
            />
            {mode === 'signup' && choice === 'professional' && (
              <TextField label="Phone number" value={form.phone} onChange={update('phone')} placeholder="07X XXX XXXX" hint="Customers only see this after booking." />
            )}

            {problem && <Notice kind="error" onDismiss={() => setProblem('')}>{problem}</Notice>}
            {pending && (
              <Notice kind="success">
                <span className="flex items-start gap-2">
                  <MailCheck size={17} className="mt-0.5" />
                  <span>
                    We sent a confirmation link to <strong>{form.email}</strong>. Open it, then sign in — your professional profile
                    {choice === 'professional' ? ' can be completed right after.' : ' settings stay ready for you.'}
                  </span>
                </span>
              </Notice>
            )}

            <ActionButton kind="brand" type="submit" full size="lg" disabled={working} arrow>
              {working ? 'Please wait' : mode === 'login' ? 'Sign in' : pending ? 'Go to sign in' : choice === 'professional' ? 'Create professional account' : 'Create customer account'}
            </ActionButton>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="text-ink-muted">
              {mode === 'login' ? 'New to Khidmat?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => navigate(mode === 'login' ? (choice === 'professional' ? '/signup?role=professional' : '/signup') : '/signin')}
                className="btn-link font-bold text-brand-600"
              >
                {mode === 'login' ? 'Create an account' : 'Sign in instead'}
              </button>
            </span>
            <button type="button" onClick={() => navigate('/')} className="inline-flex items-center gap-1.5 text-[.85rem] font-semibold text-ink-muted transition hover:gap-2.5 hover:text-brand-600">
              Back to home <ArrowRight size={15} />
            </button>
          </div>

          {mode === 'login' && (
            <button type="button" onClick={() => navigate('/signup?role=professional')} className="mt-7 flex w-full items-center justify-between gap-4 rounded-2xl border border-line bg-white p-4 text-left transition hover:border-brand-300 hover:bg-brand-50/60">
              <span>
                <span className="block font-display text-[.95rem] font-bold text-ink">Work in home services?</span>
                <span className="mt-0.5 block text-[.82rem] text-ink-muted">Join as a professional and list your services for free.</span>
              </span>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ember-400 text-ink"><Wrench size={16} /></span>
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
