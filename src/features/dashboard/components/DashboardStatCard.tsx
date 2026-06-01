type DashboardStatCardProps = {
  title: string
  value: string
  caption: string
  tone: 'emerald' | 'sky' | 'amber' | 'rose'
  percentage?: number
  isLoading?: boolean
}

const toneClasses: Record<DashboardStatCardProps['tone'], string> = {
  emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  sky: 'border-sky-100 bg-sky-50 text-sky-700',
  amber: 'border-amber-100 bg-amber-50 text-amber-700',
  rose: 'border-rose-100 bg-rose-50 text-rose-700',
}

export function DashboardStatCard({
  title,
  value,
  caption,
  tone,
  percentage,
  isLoading = false,
}: DashboardStatCardProps) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          {isLoading ? (
            <div className="mt-4 h-9 w-20 animate-pulse rounded-md bg-slate-100" />
          ) : (
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {value}
            </p>
          )}
        </div>
        <span
          className={[
            'grid h-10 w-10 place-items-center rounded-md border text-lg font-semibold',
            toneClasses[tone],
          ].join(' ')}
          aria-hidden="true"
        >
          +
        </span>
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-600">{caption}</p>
      {typeof percentage === 'number' ? (
        <p className="mt-3 text-sm font-semibold text-slate-700">
          {formatPercentage(percentage)}% of screened children
        </p>
      ) : null}
    </article>
  )
}

function formatPercentage(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1)
}
