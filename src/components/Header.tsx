import { useEffect, useRef, useState } from 'react';
import { CalendarDays, ChevronDown, LayoutDashboard, Menu, UserRound, X } from 'lucide-react';
import Logo from '@/components/Logo';
import ActionButton from '@/components/ActionButton';
import type { AuthUser } from '@/lib/backend';

const links = [
  { label: 'Home', path: '/' },
  { label: 'Find a service', path: '/services' },
  { label: 'My bookings', path: '/bookings' },
  { label: 'For professionals', path: '/professionals' },
];

type Props = { user: AuthUser | null; currentPath: string; navigate: (path: string) => void; onSignOut: () => void };

export default function Header({ user, currentPath, navigate, onSignOut }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) setAccountOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setAccountOpen(false); setMenuOpen(false); }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const go = (path: string) => {
    navigate(path);
    setMenuOpen(false);
    setAccountOpen(false);
  };

  const isActive = (path: string) => (path === '/' ? currentPath === '/' : currentPath.startsWith(path));

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-500 ${
        scrolled ? 'border-line bg-canvas/88 shadow-[0_10px_30px_-26px_rgba(23,60,54,.5)] backdrop-blur-xl' : 'border-transparent bg-canvas/70 backdrop-blur'
      }`}
    >
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        <a href="#/" onClick={() => go('/')} className="shrink-0" aria-label="Khidmat home">
          <Logo size="md" />
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {links.map((link) => (
            <a
              key={link.path}
              href={`#${link.path}`}
              onClick={() => go(link.path)}
              className="nav-link"
              aria-current={isActive(link.path) ? 'page' : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block" ref={accountRef}>
            <button
              type="button"
              onClick={() => (user ? setAccountOpen((open) => !open) : go('/signin'))}
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              className="pill inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-brand-50 hover:text-brand-700"
            >
              <UserRound size={18} />
              {user ? 'Account' : 'Sign in'}
              {user && <ChevronDown size={14} className={`transition-transform duration-300 ${accountOpen ? 'rotate-180' : ''}`} />}
            </button>
            {accountOpen && user && (
              <div role="menu" className="nav-sheet absolute right-0 top-[calc(100%+10px)] w-60 rounded-2xl border border-line bg-white p-2 shadow-float">
                <p className="px-3 pb-2 pt-2 text-xs text-ink-faint">{user.email}</p>
                <MenuLink icon={CalendarDays} label="My bookings" onClick={() => go('/bookings')} />
                {user.isProfessional
                  ? <MenuLink icon={LayoutDashboard} label="Professional dashboard" onClick={() => go('/professional')} />
                  : <MenuLink icon={UserRound} label="Become a professional" onClick={() => go('/register')} />}
                <div className="my-1 h-px bg-line" />
                <button type="button" role="menuitem" onClick={() => { setAccountOpen(false); onSignOut(); }} className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-ink-muted transition hover:bg-mist hover:text-danger">
                  Sign out
                </button>
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <ActionButton kind="brand" size="sm" onClick={() => go('/services')} arrow={false}>Book a pro</ActionButton>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="pill grid h-10 w-10 place-items-center text-ink-soft hover:bg-brand-50 md:hidden"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="nav-sheet absolute inset-x-4 top-[82px] z-40 rounded-2xl border border-line bg-white p-3 shadow-float md:hidden">
          {links.map((link) => (
            <a
              key={link.path}
              href={`#${link.path}`}
              onClick={() => go(link.path)}
              className={`block rounded-xl px-4 py-3 text-[.95rem] font-semibold transition ${
                isActive(link.path) ? 'bg-brand-50 text-brand-700' : 'text-ink-soft hover:bg-mist'
              }`}
              aria-current={isActive(link.path) ? 'page' : undefined}
            >
              {link.label}
            </a>
          ))}
          <div className="my-2 h-px bg-line" />
          <button
            type="button"
            onClick={() => go(user ? (user.isProfessional ? '/professional' : '/bookings') : '/signin')}
            className="block w-full rounded-xl px-4 py-3 text-left text-[.95rem] font-semibold text-ink-soft transition hover:bg-mist"
          >
            {user ? 'Your account' : 'Sign in'}
          </button>
          <div className="mt-2 px-1 pb-1">
            <ActionButton kind="brand" size="sm" full onClick={() => go('/services')}>Book a pro</ActionButton>
          </div>
        </div>
      )}
    </header>
  );
}

function MenuLink({ icon: Icon, label, onClick }: { icon: typeof CalendarDays; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold text-ink-soft transition hover:bg-brand-50 hover:text-brand-700"
    >
      <Icon size={16} /> {label}
    </button>
  );
}
