import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Service } from '@/data/catalog';

export type AuthUser = { id: string; email: string; isProfessional: boolean };

export type DbProvider = {
  id: string;
  full_name: string;
  professional_title: string;
  bio: string;
  location: string;
  experience_years: number;
  rating: number;
  review_count: number;
  avatar_url: string | null;
};

export type DbCategory = { id: string; name: string; slug: string };

export type DbBooking = {
  id: string;
  service_title: string;
  provider_name: string;
  customer_name: string;
  phone: string;
  location: string;
  preferred_date: string;
  preferred_time: string;
  instructions: string;
  status: string;
  provider_id: string | null;
  created_at: string;
};

export type DbReview = { id: string; rating: number; comment: string; created_at: string };

export type DbService = {
  id: string;
  provider_id: string;
  category_id: string;
  title: string;
  description: string;
  price: number;
  price_unit: string;
  image_url: string | null;
  location: string;
};

export type BackendError = { message: string };
export type Result<T = null> = { data: T | null; error: BackendError | null };

export const backendReady = Boolean(supabase);
const notConnected: BackendError = { message: 'Khidmat is not connected to a database yet, so this action could not be saved.' };

function fail(error: unknown, fallback: string): BackendError {
  if (error && typeof error === 'object' && 'message' in error) return { message: String((error as { message: unknown }).message) };
  return { message: fallback };
}

/* ------------------------------------------------------------- session --- */

export function useSession() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const client = supabase;
    if (!client) { setReady(true); return; }
    let active = true;

    const sync = async (sessionUser: { id: string; email?: string } | null) => {
      if (!sessionUser) { if (active) { setUser(null); setReady(true); } return; }
      const { data } = await client.from('provider_profiles').select('id').eq('user_id', sessionUser.id).maybeSingle();
      if (!active) return;
      setUser({ id: sessionUser.id, email: sessionUser.email ?? '', isProfessional: Boolean(data) });
      setReady(true);
    };

    void client.auth.getSession().then(({ data }) => sync(data.session?.user ?? null));
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => { void sync(session?.user ?? null); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    const sessionUser = data.session?.user ?? null;
    if (!sessionUser) { setUser(null); return; }
    const { data: profile } = await supabase.from('provider_profiles').select('id').eq('user_id', sessionUser.id).maybeSingle();
    setUser({ id: sessionUser.id, email: sessionUser.email ?? '', isProfessional: Boolean(profile) });
  }, []);

  return { user, ready, refresh };
}

/* ------------------------------------------------------------ directory -- */

type Directory = {
  providers: Map<string, DbProvider>;
  serviceIds: Map<string, string>;
  categories: DbCategory[];
  counts: { providers: number; services: number; reviews: number; avgRating: number };
};

let directoryPromise: Promise<Directory> | null = null;

function emptyDirectory(): Directory {
  return { providers: new Map(), serviceIds: new Map(), categories: [], counts: { providers: 0, services: 0, reviews: 0, avgRating: 0 } };
}

/** Loads the live directory once per session; every read below is served from it. */
export function loadDirectory(): Promise<Directory> {
  const client = supabase;
  if (!client) return Promise.resolve(emptyDirectory());
  if (!directoryPromise) {
    directoryPromise = (async () => {
      try {
        const [providers, servicesList, categories, reviewCount] = await Promise.all([
          client.from('provider_profiles').select('id, full_name, professional_title, bio, location, experience_years, rating, review_count, avatar_url').eq('is_active', true),
          client.from('services').select('id, provider_id, title').eq('is_active', true),
          client.from('categories').select('id, name, slug').order('name'),
          client.from('reviews').select('id', { count: 'exact', head: true }),
        ]);

        const providerMap = new Map<string, DbProvider>();
        (providers?.data as DbProvider[] | null)?.forEach((row) => providerMap.set(row.full_name.toLowerCase(), row));
        const serviceMap = new Map<string, string>();
        const dbServices = (servicesList?.data as Pick<DbService, 'id' | 'title'>[] | null) ?? [];
        dbServices.forEach((row) => serviceMap.set(row.title.toLowerCase(), row.id));

        const rated = [...providerMap.values()];
        return {
          providers: providerMap,
          serviceIds: serviceMap,
          categories: (categories?.data as DbCategory[] | null) ?? [],
          counts: {
            providers: providerMap.size,
            services: dbServices.length,
            reviews: reviewCount?.count ?? 0,
            avgRating: rated.length ? Number((rated.reduce((sum, row) => sum + Number(row.rating), 0) / rated.length).toFixed(2)) : 0,
          },
        };
      } catch (error) {
        console.warn('Khidmat directory load failed', error);
        return emptyDirectory();
      }
    })();
  }
  return directoryPromise;
}

export function resetDirectory() { directoryPromise = null; }

/** Keys a catalogue service to its real database rows so bookings are traceable. */
export async function linkFor(service: Service): Promise<{ provider_id: string | null; service_id: string | null }> {
  const directory = await loadDirectory();
  const provider = directory.providers.get(service.provider.toLowerCase());
  return { provider_id: provider?.id ?? null, service_id: directory.serviceIds.get(service.title.toLowerCase()) ?? null };
}

export async function dbProviderFor(name: string): Promise<DbProvider | null> {
  const directory = await loadDirectory();
  return directory.providers.get(name.toLowerCase()) ?? null;
}

export async function dbCategories(): Promise<DbCategory[]> {
  return (await loadDirectory()).categories;
}

/** Categories are referenced by uuid, so a service can only be saved when the name really exists. */
export async function resolveCategoryId(name: string): Promise<string | null> {
  const list = await dbCategories();
  return list.find((category) => category.name.toLowerCase() === name.toLowerCase())?.id ?? null;
}

export async function marketplaceCounts() {
  return (await loadDirectory()).counts;
}

/* ------------------------------------------------------------- bookings -- */

export async function createBooking(service: Service, draft: { name: string; phone: string; location: string; date: string; time: string; instructions: string }): Promise<Result> {
  if (!supabase) return { data: null, error: notConnected };
  const links = await linkFor(service);
  const { error } = await supabase.from('bookings').insert({
    customer_name: draft.name,
    phone: draft.phone,
    service_title: service.title,
    provider_name: service.provider,
    location: draft.location,
    preferred_date: draft.date,
    preferred_time: draft.time,
    instructions: draft.instructions,
    service_id: links.service_id,
    provider_id: links.provider_id,
  });
  if (error) return { data: null, error: fail(error, 'Your booking request could not be sent.') };
  return { data: null, error: null };
}

export async function fetchCustomerBookings(): Promise<Result<DbBooking[]>> {
  if (!supabase) return { data: null, error: notConnected };
  const { data, error } = await supabase
    .from('bookings')
    .select('id, service_title, provider_name, customer_name, phone, location, preferred_date, preferred_time, instructions, status, provider_id, created_at')
    .order('created_at', { ascending: false });
  if (error) return { data: null, error: fail(error, 'Your bookings could not be loaded.') };
  return { data: (data as DbBooking[]) ?? [], error: null };
}

export async function fetchProviderBookings(providerId: string): Promise<Result<DbBooking[]>> {
  if (!supabase) return { data: null, error: notConnected };
  const { data, error } = await supabase
    .from('bookings')
    .select('id, service_title, provider_name, customer_name, phone, location, preferred_date, preferred_time, instructions, status, provider_id, created_at')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false });
  if (error) return { data: null, error: fail(error, 'Booking requests could not be loaded.') };
  return { data: (data as DbBooking[]) ?? [], error: null };
}

export async function setBookingStatus(id: string, status: string): Promise<Result> {
  if (!supabase) return { data: null, error: notConnected };
  const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
  if (error) return { data: null, error: fail(error, 'That booking could not be updated.') };
  return { data: null, error: null };
}

/* ------------------------------------------------------------- reviews --- */

export async function fetchReviewsForProvider(providerId: string): Promise<Result<DbReview[]>> {  if (!supabase) return { data: null, error: notConnected };
  const { data, error } = await supabase.from('reviews').select('id, rating, comment, created_at').eq('provider_id', providerId).order('created_at', { ascending: false });
  if (error) return { data: null, error: fail(error, 'Reviews could not be loaded.') };
  return { data: (data as DbReview[]) ?? [], error: null };
}

export async function createReview(input: { provider_id: string; booking_id: string; rating: number; comment: string }): Promise<Result> {
  if (!supabase) return { data: null, error: notConnected };
  const { error } = await supabase.from('reviews').insert(input);
  if (error) return { data: null, error: fail(error, 'Your review could not be saved.') };
  return { data: null, error: null };
}

/* ------------------------------------------------------------- profile --- */

export async function fetchProfileByUser(userId: string): Promise<Result<DbProvider>> {
  if (!supabase) return { data: null, error: notConnected };
  const { data, error } = await supabase
    .from('provider_profiles')
    .select('id, full_name, professional_title, bio, location, experience_years, rating, review_count, avatar_url')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) return { data: null, error: fail(error, 'Your professional profile could not be loaded.') };
  return { data: (data as DbProvider) ?? null, error: null };
}

export async function createProviderProfile(userId: string, input: {
  full_name: string; professional_title: string; bio: string; location: string; experience_years: number;
}): Promise<Result<DbProvider>> {
  if (!supabase) return { data: null, error: notConnected };
  const { data, error } = await supabase
    .from('provider_profiles')
    .insert({
      user_id: userId,
      full_name: input.full_name,
      professional_title: input.professional_title,
      bio: input.bio,
      location: input.location,
      experience_years: input.experience_years,
      avatar_url: null,
    })
    .select('id, full_name, professional_title, bio, location, experience_years, rating, review_count, avatar_url')
    .maybeSingle();
  if (error) return { data: null, error: fail(error, 'Your professional profile could not be saved.') };
  resetDirectory();
  return { data: (data as DbProvider) ?? null, error: null };
}

export async function updateProviderProfile(id: string, input: { full_name: string; professional_title: string; bio: string; location: string; experience_years: number }): Promise<Result> {
  if (!supabase) return { data: null, error: notConnected };
  const { error } = await supabase.from('provider_profiles').update(input).eq('id', id);
  if (error) return { data: null, error: fail(error, 'Your profile could not be updated.') };
  return { data: null, error: null };
}

/* ------------------------------------------------------------- services -- */

export async function fetchProviderServices(providerId: string): Promise<Result<DbService[]>> {
  if (!supabase) return { data: null, error: notConnected };
  const { data, error } = await supabase
    .from('services')
    .select('id, provider_id, category_id, title, description, price, price_unit, image_url, location')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false });
  if (error) return { data: null, error: fail(error, 'Your services could not be loaded.') };
  return { data: (data as DbService[]) ?? [], error: null };
}

export async function createProviderService(input: {
  provider_id: string; category_id: string; title: string; description: string; price: number; price_unit: string; location: string;
}): Promise<Result> {
  if (!supabase) return { data: null, error: notConnected };
  // is_active is deliberately not sent: the column grant reserves activation for the database default.
  const { error } = await supabase.from('services').insert(input);
  if (error) return { data: null, error: fail(error, 'This service could not be published.') };
  resetDirectory();
  return { data: null, error: null };
}

export async function updateProviderService(id: string, input: {
  category_id: string; title: string; description: string; price: number; price_unit: string; location: string;
}): Promise<Result> {
  if (!supabase) return { data: null, error: notConnected };
  const { error } = await supabase.from('services').update(input).eq('id', id);
  if (error) return { data: null, error: fail(error, 'This service could not be updated.') };
  resetDirectory();
  return { data: null, error: null };
}

export async function removeProviderService(id: string): Promise<Result> {
  if (!supabase) return { data: null, error: notConnected };
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) return { data: null, error: fail(error, 'This service could not be removed.') };
  resetDirectory();
  return { data: null, error: null };
}
