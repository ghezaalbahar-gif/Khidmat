import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Compass, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRoute } from '@/lib/router';
import { useReveal, useTilt } from '@/lib/motion';
import { backendReady, useSession, type AuthUser } from '@/lib/backend';
import type { Service } from '@/data/catalog';
import { serviceBySlug } from '@/data/catalog';
import CustomCursor from '@/components/CustomCursor';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingModal from '@/components/BookingModal';
import ActionButton from '@/components/ActionButton';
import HomePage from '@/pages/HomePage';
import ServicesPage from '@/pages/ServicesPage';
import ProviderPage from '@/pages/ProviderPage';
import BookingsPage from '@/pages/BookingsPage';
import ProfessionalsPage from '@/pages/ProfessionalsPage';
import ProfessionalRegisterPage from '@/pages/ProfessionalRegisterPage';
import ProfessionalDashboardPage from '@/pages/ProfessionalDashboardPage';
import AuthPage from '@/pages/AuthPage';

const ALL = 'All services';

export default function App() {
  const { route, navigate } = useRoute();
  const { user, ready, refresh } = useSession();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(ALL);
  const [booking, setBooking] = useState<Service | null>(null);
  const [toast, setToast] = useState('');

  const key = `${route.view}:${route.slug ?? ''}:${route.query.toString()}`;
  useReveal(key);
  useTilt(key);

  /* The URL stays the source of truth for discovery filters. */
  useEffect(() => {
    if (route.view !== 'services') return;
    setCategory(route.query.get('category') ?? ALL);
    setSearch(route.query.get('q') ?? '');
  }, [route.view, route.query]);

  useEffect(() => {
    const html = document.documentElement;
    const previous = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    html.style.scrollBehavior = previous;
  }, [route.view, route.slug]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 4800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const goCategory = useCallback((name: string) => {
    setCategory(name);
    setSearch('');
    navigate(`/services?category=${encodeURIComponent(name)}`);
  }, [navigate]);

  const goSearch = useCallback((term: string) => {
    setSearch(term);
    setCategory(ALL);
    navigate(term ? `/services?q=${encodeURIComponent(term)}` : '/services');
  }, [navigate]);

  const openProvider = useCallback((service: Service) => navigate(`/provider/${service.providerSlug}`), [navigate]);

  /**
   * "Join as a professional" always lands somewhere real: guests sign up with the professional
   * role pre-selected, a professional opens their dashboard, and a customer gets the form that
   * links a profile to the account they are already using.
   */
  const join = useCallback(() => {
    if (!user) { navigate('/signup?role=professional'); return; }
    navigate(user.isProfessional ? '/professional' : '/register');
  }, [navigate, user]);

  const signIn = useCallback(() => navigate('/signin'), [navigate]);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
    void refresh();
    navigate('/');
  }, [navigate, refresh]);

  const onBookingSent = useCallback((service: Service) => {
    setBooking(null);
    setToast(`Your request for ${service.title} was sent. Follow it under My bookings.`);
    navigate('/bookings');
  }, [navigate]);

  const pickCategory = useCallback((value: string) => {
    setCategory(value);
    navigate(value === ALL ? '/services' : `/services?category=${encodeURIComponent(value)}`);
  }, [navigate]);

  const page = useMemo(() => {
    switch (route.view) {
      case 'services':
        return (
          <ServicesPage
            search={search}
            setSearch={setSearch}
            category={category}
            setCategory={pickCategory}
            onProvider={openProvider}
            onBook={setBooking}
            onBrowseCategories={() => document.getElementById('category-rail')?.scrollIntoView({ block: 'center' })}
          />
        );
      case 'provider': {
        const service = serviceBySlug(route.slug);
        if (!service) return <MissingService onBrowse={() => navigate('/services')} />;
        return <ProviderPage service={service} onBack={() => navigate('/services')} onBook={setBooking} />;
      }
      case 'bookings':
        return <BookingsPage user={user} onSignIn={signIn} onBrowse={() => navigate('/services')} onBook={setBooking} />;
      case 'professionals':
        return <ProfessionalsPage onJoin={join} onCategory={goCategory} />;
      case 'auth':
        return <AuthPage mode={route.authMode} role={route.authRole} navigate={navigate} onSignedIn={() => void refresh()} />;
      case 'professional-register':
        return <ProfessionalRegisterPage user={user} navigate={navigate} onSignedIn={() => void refresh()} />;
      case 'professional-dashboard':
        return ready && user
          ? <ProfessionalDashboardPage user={user} navigate={navigate} />
          : <DashboardGate user={user} ready={ready} onSignIn={signIn} onRegister={() => navigate('/register')} />;
      case 'home':
      default:
        return (
          <HomePage
            onSearch={goSearch}
            onBrowse={() => navigate('/services')}
            onCategory={goCategory}
            onProvider={openProvider}
            onBook={setBooking}
            onJoin={join}
          />
        );
    }
  }, [route, user, ready, search, category, navigate, signIn, join, goSearch, goCategory, openProvider, pickCategory, refresh]);

  return (
    <>
      <CustomCursor />
      <Header user={user} currentPath={pathOf(route.view, route.slug)} navigate={navigate} onSignOut={() => void signOut()} />
      <div key={key}>{page}</div>
      <Footer navigate={navigate} />

      {booking && (
        <BookingModal
          service={booking}
          user={user}
          onClose={() => setBooking(null)}
          onSuccess={onBookingSent}
          onSignIn={() => { setBooking(null); signIn(); }}
        />
      )}

      {!backendReady && ready && (
        <p className="fixed inset-x-0 bottom-0 z-50 bg-ember-soft px-5 py-3 text-center text-[.8rem] font-semibold text-ember-900">
          Khidmat is running without a database connection, so bookings and profiles cannot be saved.
        </p>
      )}

      {toast && (
        <div role="status" className="toast fixed bottom-6 left-1/2 z-[70] flex max-w-[min(92vw,30rem)] items-start gap-3 rounded-2xl border border-brand-200 bg-white px-4 py-3.5 shadow-sheet">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-brand-600" />
          <span className="flex-1 text-[.88rem] leading-6 text-ink-soft">{toast}</span>
          <button type="button" onClick={() => setToast('')} className="text-[.75rem] font-bold uppercase tracking-[.12em] text-ink-faint transition hover:text-brand-600">Close</button>
        </div>
      )}
    </>
  );
}

/* ---------------------------------------------------------- fallback views */

function pathOf(view: string, slug: string | null) {
  switch (view) {
    case 'home': return '/';
    case 'provider': return `/provider/${slug ?? ''}`;
    case 'professional-register': return '/register';
    case 'professional-dashboard': return '/professional';
    case 'auth': return '/signin';
    default: return `/${view}`;
  }
}

function MissingService({ onBrowse }: { onBrowse: () => void }) {
  return (
    <main className="page-shell band flex min-h-[60vh] items-center">
      <div className="mx-auto max-w-xl px-5 py-20 text-center lg:px-0">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-brand-600 shadow-card"><Compass size={24} /></span>
        <h1 className="mt-6 font-display text-title text-ink">That listing is not on Khidmat.</h1>
        <p className="mt-4 prose-khidmat">The link may be old, or the service was removed. Every professional currently taking requests is still one click away.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ActionButton kind="brand" onClick={onBrowse} arrow>Browse services</ActionButton>
          <ActionButton kind="quiet" href="#/">Back to home</ActionButton>
        </div>
      </div>
    </main>
  );
}

function DashboardGate({ user, ready, onSignIn, onRegister }: { user: AuthUser | null; ready: boolean; onSignIn: () => void; onRegister: () => void }) {
  return (
    <main className="page-shell band flex min-h-[60vh] items-center">
      <div className="mx-auto max-w-xl px-5 py-20 text-center lg:px-0">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-brand-600 shadow-card"><Sparkles size={24} /></span>
        <h1 className="mt-6 font-display text-title text-ink">
          {ready && user ? 'Your professional profile comes first.' : 'Sign in to open your dashboard.'}
        </h1>
        <p className="mt-4 prose-khidmat">
          {ready && user
            ? 'Create the profile that links this account to your booking requests, services and reviews.'
            : 'The professional dashboard reads requests straight from your signed-in account.'}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {ready && user
            ? <ActionButton kind="brand" onClick={onRegister} arrow>Complete registration</ActionButton>
            : <ActionButton kind="brand" onClick={onSignIn} arrow>Sign in</ActionButton>}
          <ActionButton kind="quiet" href="#/professionals">Read the details</ActionButton>
        </div>
      </div>
    </main>
  );
}
