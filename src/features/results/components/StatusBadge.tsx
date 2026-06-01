type StatusBadgeProps = {
  status: string
}

const statusStyles: Record<string, string> = {
  normal: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  wasted: 'border-amber-200 bg-amber-50 text-amber-700',
  stunted: 'border-rose-200 bg-rose-50 text-rose-700',
  underweight: 'border-orange-200 bg-orange-50 text-orange-700',
  overweight: 'border-sky-200 bg-sky-50 text-sky-700',
  obese: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.trim().toLowerCase()
  const className =
    statusStyles[normalizedStatus] ??
    'border-slate-200 bg-slate-50 text-slate-700'

  return (
    <span
      className={[
        'inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize',
        className,
      ].join(' ')}
    >
      {status || 'Unknown'}
    </span>
  )
}
