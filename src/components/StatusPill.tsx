const statuses: Record<string, { label: string; classes: string; dot: string }> = {
  pending: { label: 'Awaiting response', classes: 'bg-ember-soft text-ember-800', dot: 'bg-ember-600' },
  accepted: { label: 'Accepted', classes: 'bg-brand-50 text-brand-600', dot: 'bg-brand-500' },
  in_progress: { label: 'In progress', classes: 'bg-tint-sky text-accent-sky', dot: 'bg-accent-sky' },
  completed: { label: 'Completed', classes: 'bg-brand-100 text-brand-700', dot: 'bg-brand-600' },
  rejected: { label: 'Declined', classes: 'bg-danger-soft text-danger', dot: 'bg-danger-dot' },
  cancelled: { label: 'Cancelled', classes: 'bg-mist text-ink-muted', dot: 'bg-ink-faint' },
};

export default function StatusPill({ status }: { status: string }) {
  const meta = statuses[status] ?? statuses.pending;
  return (
    <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[.7rem] font-bold tracking-wide ${meta.classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}
