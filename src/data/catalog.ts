import { BriefcaseBusiness, Home, SlidersHorizontal, Sparkles, Wrench, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type Category = {
  name: string;
  slug: string;
  icon: LucideIcon;
  tint: string;
  accent: string;
  blurb: string;
};

export type Service = {
  id: string;
  title: string;
  category: string;
  provider: string;
  providerSlug: string;
  price: number;
  unit: string;
  rating: number;
  reviews: number;
  location: string;
  image: string;
  description: string;
  experience: number;
  jobsDone: number;
  responseTime: string;
};

export type BookingDraft = {
  name: string;
  phone: string;
  location: string;
  date: string;
  time: string;
  instructions: string;
};

/** Marketplace imagery. Every URL here is fetched by the browser at runtime. */
export const photos = {
  plumbing: 'https://images.pexels.com/photos/7859953/pexels-photo-7859953.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  cleaning: 'https://images.pexels.com/photos/6195275/pexels-photo-6195275.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  electrical: 'https://images.pexels.com/photos/20500461/pexels-photo-20500461.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  painting: 'https://images.pexels.com/photos/6474343/pexels-photo-6474343.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  carpentry: 'https://images.pexels.com/photos/5974064/pexels-photo-5974064.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  ac: 'https://images.pexels.com/photos/7347538/pexels-photo-7347538.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  heroTall: 'https://images.pexels.com/photos/6474343/pexels-photo-6474343.jpeg?auto=compress&cs=tinysrgb&h=900&w=760',
} as const;

export const categories: Category[] = [
  { name: 'Home cleaning', slug: 'home-cleaning', icon: Sparkles, tint: 'bg-tint-sage', accent: 'text-accent-sage', blurb: 'A spotless home, without the hassle.' },
  { name: 'Plumbing', slug: 'plumbing', icon: Wrench, tint: 'bg-tint-sky', accent: 'text-accent-sky', blurb: 'Leaks, taps and water lines fixed properly.' },
  { name: 'Electrical', slug: 'electrical', icon: Zap, tint: 'bg-tint-honey', accent: 'text-accent-honey', blurb: 'Safe wiring, outlets and lighting work.' },
  { name: 'Painting', slug: 'painting', icon: Home, tint: 'bg-tint-clay', accent: 'text-accent-clay', blurb: 'Fresh colour with careful finishing.' },
  { name: 'Carpentry', slug: 'carpentry', icon: BriefcaseBusiness, tint: 'bg-tint-moss', accent: 'text-accent-moss', blurb: 'Shelving, repairs and custom woodwork.' },
  { name: 'AC repair', slug: 'ac-repair', icon: SlidersHorizontal, tint: 'bg-tint-lagoon', accent: 'text-accent-lagoon', blurb: 'Servicing and repairs for every season.' },
];

export const services: Service[] = [
  {
    id: 'plumbing', title: 'Leak & pipe repair', category: 'Plumbing', provider: 'Ahmad Wali', providerSlug: 'ahmad-wali',
    price: 900, unit: 'starting price', rating: 4.9, reviews: 128, location: 'Karte Parwan', image: photos.plumbing,
    description: 'Fast diagnosis and repair for household leaks, taps, and water connections.',
    experience: 9, jobsDone: 240, responseTime: 'Under 1 hr',
  },
  {
    id: 'cleaning', title: 'Deep home cleaning', category: 'Home cleaning', provider: 'Farzana Sediqi', providerSlug: 'farzana-sediqi',
    price: 1200, unit: 'per visit', rating: 4.8, reviews: 94, location: 'Shahr-e-Naw', image: photos.cleaning,
    description: 'A detailed reset for kitchens, bathrooms, bedrooms, and shared spaces.',
    experience: 6, jobsDone: 180, responseTime: 'Same day',
  },
  {
    id: 'electrical', title: 'Electrical inspection', category: 'Electrical', provider: 'Omid Rahimi', providerSlug: 'omid-rahimi',
    price: 750, unit: 'starting price', rating: 5.0, reviews: 76, location: 'Wazir Akbar Khan', image: photos.electrical,
    description: 'A safety-first check for outlets, wiring, switches, and lighting.',
    experience: 11, jobsDone: 310, responseTime: 'Under 2 hrs',
  },
  {
    id: 'painting', title: 'Room painting', category: 'Painting', provider: 'Mariam Ahmadi', providerSlug: 'mariam-ahmadi',
    price: 1800, unit: 'per room', rating: 4.7, reviews: 61, location: 'Taimani', image: photos.painting,
    description: 'Smooth, clean color updates with careful preparation and finishing.',
    experience: 7, jobsDone: 150, responseTime: 'Within a day',
  },
  {
    id: 'carpentry', title: 'Custom shelving', category: 'Carpentry', provider: 'Samiullah Noor', providerSlug: 'samiullah-noor',
    price: 2500, unit: 'starting price', rating: 4.9, reviews: 43, location: 'Macroyan', image: photos.carpentry,
    description: 'Practical custom woodwork made to fit your home and routine.',
    experience: 12, jobsDone: 95, responseTime: 'Under 3 hrs',
  },
  {
    id: 'ac', title: 'AC service & repair', category: 'AC repair', provider: 'Najeeb Khan', providerSlug: 'najeeb-khan',
    price: 1100, unit: 'starting price', rating: 4.8, reviews: 38, location: 'Kabul City', image: photos.ac,
    description: 'Seasonal servicing, cleaning, and reliable repairs for home AC units.',
    experience: 8, jobsDone: 130, responseTime: 'Under 2 hrs',
  },
];

export const kabulAreas = [
  'Kabul, Shahr-e-Naw',
  'Kabul, Karte Parwan',
  'Kabul, Taimani',
  'Kabul, Wazir Akbar Khan',
  'Kabul, Macroyan',
  'Kabul, Khair Khan',
  'Kabul, Deh Mazang',
];

export const timeSlots = [
  'Morning, 8:00–11:00',
  'Midday, 11:00–14:00',
  'Afternoon, 14:00–17:00',
  'Evening, 17:00–20:00',
];

export const priceUnits = ['starting price', 'per visit', 'per room', 'per hour', 'per job'];

export function categoryByName(name: string) {
  return categories.find((category) => category.name === name);
}

export function serviceBySlug(slug: string | null) {
  if (!slug) return null;
  return services.find((service) => service.id === slug || service.providerSlug === slug) ?? null;
}

export function initialsOf(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2);
}
