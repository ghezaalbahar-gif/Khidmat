import { useCallback, useEffect, useState } from 'react';

export type View =
  | 'home' | 'services' | 'provider' | 'bookings'
  | 'professionals' | 'auth' | 'professional-register' | 'professional-dashboard';

export type Route = {
  view: View;
  slug: string | null;
  query: URLSearchParams;
  authMode: 'login' | 'signup';
  authRole: 'customer' | 'professional';
};

const VIEWS: Record<string, View> = {
  '': 'home',
  home: 'home',
  services: 'services',
  provider: 'provider',
  bookings: 'bookings',
  professionals: 'professionals',
  signin: 'auth',
  signup: 'auth',
  register: 'professional-register',
  professional: 'professional-dashboard',
};

export function parseRoute(hash: string): Route {
  const [path, query] = hash.replace(/^#\/?/, '').split('?');
  const params = new URLSearchParams(query ?? '');
  const [head, slug] = path.split('/');
  const view = VIEWS[head ?? ''] ?? 'home';
  const isSignup = head === 'signup' || params.get('mode') === 'signup';
  return {
    view,
    slug: slug ? decodeURIComponent(slug) : null,
    query: params,
    authMode: isSignup ? 'signup' : 'login',
    authRole: params.get('role') === 'professional' ? 'professional' : 'customer',
  };
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));

  useEffect(() => {
    const sync = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const navigate = useCallback((path: string) => {
    const next = path.startsWith('#') ? path : `#${path}`;
    if (window.location.hash === next) setRoute(parseRoute(next));
    else window.location.hash = next;
  }, []);

  return { route, navigate };
}

/** The URL that renders a view, so links and navigation can never drift apart. */
export function pathFor(view: View, slug?: string | null): string {
  switch (view) {
    case 'home': return '/';
    case 'services': return '/services';
    case 'provider': return `/provider/${slug ?? ''}`;
    case 'bookings': return '/bookings';
    case 'professionals': return '/professionals';
    case 'professional-register': return '/register';
    case 'professional-dashboard': return '/professional';
    case 'auth': return '/signin';
  }
}

export function authPath(mode: 'login' | 'signup', role: 'customer' | 'professional' = 'customer') {
  return mode === 'signup' && role === 'professional' ? '/signup?role=professional' : `/${mode === 'signup' ? 'signup' : 'signin'}`;
}
