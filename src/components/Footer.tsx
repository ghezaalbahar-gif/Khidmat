import { MapPin, ShieldCheck } from 'lucide-react';
import Logo from '@/components/Logo';
import { categories } from '@/data/catalog';

type Props = { navigate: (path: string) => void };

export default function Footer({ navigate }: Props) {
  return (
    <footer className="band-ink relative overflow-hidden text-white/80">
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(60%_100%_at_20%_0%,rgba(79,168,127,.28),transparent_70%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.1fr] lg:px-8">
        <div>
          <button type="button" onClick={() => navigate('/')} aria-label="Khidmat home"><Logo tone="light" /></button>
          <p className="mt-4 max-w-xs text-[.92rem] leading-7 text-white/60">
            Good work starts with the right person. Khidmat connects Kabul households with local professionals they can book with confidence.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/55">
            <span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-ember-400" />Kabul, Afghanistan</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-ember-400" />Verified professionals</span>
          </div>
        </div>

        <FooterColumn
          title="Explore"
          items={[
            ['Home', '/'],
            ['Find a service', '/services'],
            ['My bookings', '/bookings'],
            ['For professionals', '/professionals'],
          ]}
          navigate={navigate}
        />

        <FooterColumn
          title="Popular categories"
          items={categories.slice(0, 4).map((category) => [category.name, `/services?category=${encodeURIComponent(category.name)}`] as [string, string])}
          navigate={navigate}
        />

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-[.14em] text-white/45">Work with us</h3>
          <div className="mt-4 space-y-3 text-sm">
            <button type="button" onClick={() => navigate('/signup?role=professional')} className="foot-link block text-white/70">Become a professional</button>
            <button type="button" onClick={() => navigate('/register')} className="foot-link block text-white/70">Create a professional profile</button>
            <button type="button" onClick={() => navigate('/professional')} className="foot-link block text-white/70">Professional dashboard</button>
          </div>
          <p className="mt-5 rounded-2xl bg-white/5 p-4 text-[.82rem] leading-6 text-white/60">
            Support is available Saturday to Thursday, 9:00–18:00.
          </p>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>© 2026 Khidmat. Built for Kabul.</span>
          <span>Trusted local help, thoughtfully connected.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, items, navigate }: { title: string; items: [string, string][]; navigate: (path: string) => void }) {
  return (
    <div>
      <h3 className="font-display text-sm font-bold uppercase tracking-[.14em] text-white/45">{title}</h3>
      <div className="mt-4 space-y-3 text-sm">
        {items.map(([label, path]) => (
          <button key={label} type="button" onClick={() => navigate(path)} className="foot-link block text-white/70">{label}</button>
        ))}
      </div>
    </div>
  );
}
