import { isAxiosError } from 'axios'
import { useEffect, useMemo, useState } from 'react'

import { getPauds, type Paud } from '../../admin/api/adminApi'
import { useAuthStore } from '../../auth/store/authStore'
import {
  emptyDashboardSummary,
  getDashboardSummary,
  type DashboardSummary,
} from '../api/dashboardApi'
import { DashboardStatCard } from '../components/DashboardStatCard'

const months = [
  { label: 'January', value: 0 },
  { label: 'February', value: 1 },
  { label: 'March', value: 2 },
  { label: 'April', value: 3 },
  { label: 'May', value: 4 },
  { label: 'June', value: 5 },
  { label: 'July', value: 6 },
  { label: 'August', value: 7 },
  { label: 'September', value: 8 },
  { label: 'October', value: 9 },
  { label: 'November', value: 10 },
  { label: 'December', value: 11 },
] as const

const currentDate = new Date()
const currentMonth = currentDate.getMonth()
const currentYear = currentDate.getFullYear()
const years = Array.from({ length: 6 }, (_, index) => currentYear - 4 + index)

export function DashboardPage() {
  const isSuperAdmin = useAuthStore((state) => state.user?.role === 'super_admin')
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [pauds, setPauds] = useState<Paud[]>([])
  const [selectedPaudId, setSelectedPaudId] = useState<number | null>(null)
  const [summary, setSummary] = useState<DashboardSummary>(
    emptyDashboardSummary,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const period = useMemo(
    () => ({
      ...getMonthPeriod(selectedYear, selectedMonth),
      paud_id: isSuperAdmin ? selectedPaudId : undefined,
    }),
    [selectedYear, selectedMonth, isSuperAdmin, selectedPaudId],
  )

  const selectedPeriodLabel = `${months[selectedMonth].label} ${selectedYear}`
  const hasData = summary.total_children > 0

  const stats = useMemo(
    () => [
      {
        title: 'Total Children',
        value: summary.total_children.toString(),
        caption: 'Children with latest measurements in the selected period.',
        tone: 'sky' as const,
      },
      {
        title: 'Normal',
        value: summary.normal.toString(),
        caption: 'Children without wasted or stunted status flags.',
        tone: 'emerald' as const,
        percentage: summary.normal_percentage,
      },
      {
        title: 'Wasted',
        value: summary.wasted.toString(),
        caption: 'Children whose WFH status contains wasted.',
        tone: 'amber' as const,
        percentage: summary.wasted_percentage,
      },
      {
        title: 'Stunted',
        value: summary.stunted.toString(),
        caption: 'Children whose LHFA status contains stunted.',
        tone: 'rose' as const,
        percentage: summary.stunted_percentage,
      },
    ],
    [summary],
  )

  const cohortItems = useMemo(
    () => [
      {
        label: 'Normal',
        value: summary.normal_percentage,
        count: summary.normal,
        className: 'bg-emerald-500',
      },
      {
        label: 'Wasted',
        value: summary.wasted_percentage,
        count: summary.wasted,
        className: 'bg-amber-500',
      },
      {
        label: 'Stunted',
        value: summary.stunted_percentage,
        count: summary.stunted,
        className: 'bg-rose-500',
      },
    ],
    [summary],
  )

  useEffect(() => {
    if (!isSuperAdmin) {
      return
    }

    getPauds().then((items) => {
      setPauds(items)
      setSelectedPaudId((current) => current ?? items[0]?.id ?? null)
    })
  }, [isSuperAdmin])

  useEffect(() => {
    let isMounted = true

    async function loadSummary() {
      if (isSuperAdmin && !selectedPaudId) {
        return
      }
      setIsLoading(true)
      setError(null)

      try {
        const data = await getDashboardSummary(period)

        if (isMounted) {
          setSummary(data)
        }
      } catch (caughtError) {
        if (isMounted) {
          setSummary(emptyDashboardSummary)
          setError(getDashboardErrorMessage(caughtError))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadSummary()

    return () => {
      isMounted = false
    }
  }, [period, isSuperAdmin, selectedPaudId])

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_360px] lg:p-8">
          <div>
            <p className="text-sm font-medium text-brand-700">
              ARUNA Curve
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Child Growth & Development Trajectory
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              Adaptive Risk Understanding for Nurturing Assessment helps PAUD
              health teams track child growth status, detect nutrition risks
              early, and stay aligned on follow-up priorities.
            </p>
          </div>

          <div className="rounded-lg border border-brand-100 bg-brand-50 p-5">
            <p className="text-sm font-medium text-brand-700">
              Screening period
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
              {selectedPeriodLabel}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {isSuperAdmin ? (
                <label className="sm:col-span-2 lg:col-span-1 xl:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    PAUD
                  </span>
                  <select
                    value={selectedPaudId ?? ''}
                    onChange={(event) =>
                      setSelectedPaudId(Number(event.target.value))
                    }
                    className={selectClassName}
                  >
                    {pauds.map((paud) => (
                      <option key={paud.id} value={paud.id}>
                        {paud.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
              <label>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Month
                </span>
                <select
                  value={selectedMonth}
                  onChange={(event) =>
                    setSelectedMonth(Number(event.target.value))
                  }
                  className={selectClassName}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Year
                </span>
                <select
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(Number(event.target.value))}
                  className={selectClassName}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {period.start_date} to {period.end_date}
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <DashboardStatCard key={stat.title} {...stat} isLoading={isLoading} />
        ))}
      </section>

      {!isLoading && !error && !hasData ? (
        <EmptyState selectedPeriodLabel={selectedPeriodLabel} />
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Screening summary
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                Growth status distribution
              </h2>
            </div>
            <span className="rounded-md bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
              {isLoading ? 'Loading...' : `${summary.total_children} children`}
            </span>
          </div>

          <div className="mt-8 space-y-5">
            {cohortItems.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    {item.label}
                  </span>
                  <span className="text-slate-500">
                    {item.count} children · {formatPercentage(item.value)}%
                  </span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={['h-full rounded-full', item.className].join(
                      ' ',
                    )}
                    style={{ width: `${Math.min(item.value, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Priority queue</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Follow-up focus
          </h2>

          <div className="mt-6 space-y-3">
            {[
              ['Nutrition counseling', `${summary.wasted} children`],
              ['Height follow-up', `${summary.stunted} children`],
              ['Normal trajectory', `${formatPercentage(summary.normal_percentage)}%`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
              >
                <span className="text-sm font-medium text-slate-700">
                  {label}
                </span>
                <span className="text-sm text-slate-500">
                  {isLoading ? 'Loading...' : value}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}

function EmptyState({
  selectedPeriodLabel,
}: {
  selectedPeriodLabel: string
}) {
  return (
    <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="text-sm font-medium text-brand-700">No dashboard data</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
        No measurements found for {selectedPeriodLabel}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
        Choose another month or add measurements for this period to populate the
        dashboard analytics.
      </p>
    </section>
  )
}

function getMonthPeriod(year: number, month: number) {
  return {
    start_date: formatDateParam(new Date(year, month, 1)),
    end_date: formatDateParam(new Date(year, month + 1, 0)),
  }
}

function formatDateParam(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatPercentage(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1)
}

function getDashboardErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.status === 401) {
      return 'Your session has expired. Please sign in again.'
    }

    if (error.response?.status === 400 || error.response?.status === 422) {
      return 'Please check the selected period and try again.'
    }
  }

  return 'Unable to load dashboard analytics. Please try again shortly.'
}

const selectClassName =
  'mt-2 block w-full rounded-md border border-brand-200 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-emerald-100'
