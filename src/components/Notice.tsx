import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

type Props = { kind: 'success' | 'error' | 'info'; children: ReactNode; onDismiss?: () => void };

const skins = {
  success: { box: 'bg-brand-50 text-brand-700 border-brand-200/70', icon: CheckCircle2 },
  error: { box: 'bg-danger-soft text-danger border-danger/25', icon: AlertTriangle },
  info: { box: 'bg-ember-soft text-ember-800 border-ember-400/40', icon: Info },
};

export default function Notice({ kind, children, onDismiss }: Props) {
  const skin = skins[kind];
  const Icon = skin.icon;
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`animate-rise-in flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm leading-6 ${skin.box}`}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="flex-1">{children}</div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dismiss message" className="shrink-0 rounded-full p-1 opacity-60 transition hover:bg-white/60 hover:opacity-100">
          <X size={15} />
        </button>
      )}
    </div>
  );
}
