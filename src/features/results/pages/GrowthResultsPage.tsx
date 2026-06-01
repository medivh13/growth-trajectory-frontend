import { isAxiosError } from 'axios'
import { useEffect, useMemo, useState } from 'react'

import { getPauds, type Paud } from '../../admin/api/adminApi'
import { useAuthStore } from '../../auth/store/authStore'
import { GrowthResultsTable } from '../components/GrowthResultsTable'
import { getGrowthResults, type GrowthResult } from '../api/resultsApi'
import { updateMeasurementNote } from '../../children/api/childrenApi'

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

export function GrowthResultsPage() {
  const isSuperAdmin = useAuthStore((state) => state.user?.role === 'super_admin')
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [pauds, setPauds] = useState<Paud[]>([])
  const [selectedPaudId, setSelectedPaudId] = useState<number | null>(null)
  const [results, setResults] = useState<GrowthResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const period = useMemo(
    () => ({
      ...getMonthPeriod(selectedYear, selectedMonth),
      paud_id: isSuperAdmin ? selectedPaudId : undefined,
    }),
    [selectedYear, selectedMonth, isSuperAdmin, selectedPaudId],
  )
  const summary = useMemo(() => summarizeResults(results), [results])
  const selectedPeriodLabel = `${months[selectedMonth].label} ${selectedYear}`

  useEffect(() => {
    if (!isSuperAdmin) {
      return
    }

    getPauds().then((items) => {
      setPauds(items)
      const firstPaudID = items[0]?.id ?? null
      setSelectedPaudId((current) => current ?? firstPaudID)
    })
  }, [isSuperAdmin])

  useEffect(() => {
    let isMounted = true

    async function loadResults() {
      if (isSuperAdmin && !selectedPaudId) {
        return
      }
      setIsLoading(true)
      setError(null)

      try {
        const data = await getGrowthResults(period)

        if (isMounted) {
          setResults(normalizeResults(data))
        }
      } catch (caughtError) {
        if (isMounted) {
          setResults([])
          setError(getResultsErrorMessage(caughtError))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadResults()

    return () => {
      isMounted = false
    }
  }, [period, isSuperAdmin, selectedPaudId])

  async function handleSaveNote(measurementID: number, notes: string) {
    await updateMeasurementNote({
      measurement_id: measurementID,
      notes,
      paud_id: period.paud_id,
    })
    const data = await getGrowthResults(period)
    setResults(normalizeResults(data))
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-700">
              Growth Results
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Screening results by month
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              Review anthropometric outcomes and nutrition risk flags from PAUD
              growth measurements.
            </p>
          </div>

          <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Screening period
              </p>
              <p className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                {selectedPeriodLabel}
              </p>
            </div>
            {isSuperAdmin ? (
              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  PAUD
                </span>
                <select
                  value={selectedPaudId ?? ''}
                  onChange={(event) => setSelectedPaudId(Number(event.target.value))}
                  className={dateInputClassName}
                >
                  {pauds.map((paud) => (
                    <option key={paud.id} value={paud.id}>
                      {paud.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Month
              </span>
              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(Number(event.target.value))}
                className={dateInputClassName}
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Year
              </span>
              <select
                value={selectedYear}
                onChange={(event) => setSelectedYear(Number(event.target.value))}
                className={dateInputClassName}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-sm leading-6 text-slate-600 sm:col-span-2">
              {period.start_date} to {period.end_date}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Total results" value={summary.total} />
        <SummaryCard label="Normal BMI" value={summary.normalBmi} />
        <SummaryCard label="Wasted" value={summary.wasted} />
        <SummaryCard label="Stunted" value={summary.stunted} />
      </section>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <LoadingState />
      ) : results.length > 0 ? (
        <GrowthResultsTable results={results} onSaveNote={handleSaveNote} />
      ) : (
        <EmptyState selectedPeriodLabel={selectedPeriodLabel} />
      )}
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    </article>
  )
}

function LoadingState() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <div className="space-y-4">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-14 animate-pulse rounded-md bg-slate-100" />
        ))}
      </div>
    </div>
  )
}

function EmptyState({
  selectedPeriodLabel,
}: {
  selectedPeriodLabel: string
}) {
  return (
    <section className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="text-sm font-medium text-brand-700">No results found</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
        No measurements found for {selectedPeriodLabel}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
        Choose another month or add measurements for this period to populate the
        growth results.
      </p>
    </section>
  )
}

function summarizeResults(results: GrowthResult[]) {
  const safeResults = normalizeResults(results)

  return {
    total: safeResults.length,
    normalBmi: safeResults.filter((result) =>
      isStatus(result.BmiStatus, 'normal'),
    ).length,
    wasted: safeResults.filter((result) => isStatus(result.WfhStatus, 'wasted'))
      .length,
    stunted: safeResults.filter((result) =>
      isStatus(result.LhfaStatus, 'stunted'),
    ).length,
  }
}

function normalizeResults(results: unknown): GrowthResult[] {
  return Array.isArray(results) ? results : []
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

function isStatus(status: string | null | undefined, target: string) {
  return status?.trim().toLowerCase() === target
}

function getResultsErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.status === 401) {
      return 'Your session has expired. Please sign in again.'
    }

    if (error.response?.status === 400 || error.response?.status === 422) {
      return 'Please check the selected date range and try again.'
    }
  }

  return 'Unable to load growth results. Please try again shortly.'
}

const dateInputClassName =
  'mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-emerald-100'
