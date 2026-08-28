import { isAxiosError } from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import {
  deleteMeasurement,
  getChildMeasurementHistory,
  updateMeasurementNote,
  type ChildListItem,
  type MeasurementHistory,
} from '../api/childrenApi'
import { GrowthTrendChart } from '../components/GrowthTrendChart'
import { MeasurementNoteEditor } from '../components/MeasurementNoteEditor'
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog'
import { StatusBadge } from '../../results/components/StatusBadge'

export function MeasurementHistoryPage() {
  const { childId } = useParams()
  const [searchParams] = useSearchParams()
  const paudID = searchParams.get('paud_id')
  const paudQuery = paudID ? `?paud_id=${paudID}` : ''
  const parsedChildID = Number(childId)
  const isChildIDValid = Number.isInteger(parsedChildID) && parsedChildID > 0
  const [child, setChild] = useState<ChildListItem | null>(null)
  const [history, setHistory] = useState<MeasurementHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [measurementToDelete, setMeasurementToDelete] =
    useState<MeasurementHistory | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const progression = useMemo(() => {
    const first = history[0]
    const latest = history[history.length - 1]

    return {
      total: history.length,
      weightChange:
        first && latest ? latest.weight_kg - first.weight_kg : 0,
      heightChange:
        first && latest ? latest.height_cm - first.height_cm : 0,
      latestHeadCircumference: latest?.head_circumference_cm ?? null,
      latest,
    }
  }, [history])

  useEffect(() => {
    let isMounted = true

    async function loadHistory() {
      if (!isChildIDValid) {
        setError('Invalid child selected.')
        setChild(null)
        setHistory([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await getChildMeasurementHistory(parsedChildID, {
          paud_id: paudID ? Number(paudID) : undefined,
        })

        if (isMounted) {
          setChild(data.child)
          setHistory(data.measurements)
          setSuccessMessage(null)
        }
      } catch (caughtError) {
        if (isMounted) {
          setChild(null)
          setHistory([])
          setError(getHistoryErrorMessage(caughtError))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadHistory()

    return () => {
      isMounted = false
    }
  }, [isChildIDValid, parsedChildID, paudID])

  async function handleSaveNote(measurementID: number, notes: string) {
    await updateMeasurementNote({
      measurement_id: measurementID,
      notes,
      paud_id: paudID ? Number(paudID) : undefined,
    })
    const data = await getChildMeasurementHistory(parsedChildID, {
      paud_id: paudID ? Number(paudID) : undefined,
    })
    setChild(data.child)
    setHistory(data.measurements)
  }

  async function handleConfirmDeleteMeasurement() {
    if (!measurementToDelete) {
      return
    }

    setIsDeleting(true)
    setDeleteError(null)

    try {
      await deleteMeasurement(measurementToDelete.measurement_id, {
        paud_id: paudID ? Number(paudID) : undefined,
      })
      const data = await getChildMeasurementHistory(parsedChildID, {
        paud_id: paudID ? Number(paudID) : undefined,
      })
      setChild(data.child)
      setHistory(data.measurements)
      setSuccessMessage('Measurement was deleted.')
      setMeasurementToDelete(null)
    } catch (caughtError) {
      setDeleteError(getDeleteMeasurementErrorMessage(caughtError))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-700">
              Measurement History
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {child?.full_name ??
                (isChildIDValid ? `Child ID ${parsedChildID}` : 'Child growth progression')}
            </h1>
            {child ? (
              <p className="mt-2 text-sm font-medium text-slate-500">
                Child ID {child.id}
              </p>
            ) : null}
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              Review measurement trends and WHO status changes.
            </p>
          </div>
          {isChildIDValid ? (
            <Link
              to={`/dashboard/children/${parsedChildID}/measurements/new${paudQuery}`}
              className="rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              Add measurement
            </Link>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Measurements" value={progression.total.toString()} />
        <SummaryCard
          label="Weight change"
          value={`${formatSignedNumber(progression.weightChange)} kg`}
        />
        <SummaryCard
          label="Height change"
          value={`${formatSignedNumber(progression.heightChange)} cm`}
        />
        <SummaryCard
          label="Latest head circ."
          value={formatNullableMeasurement(
            progression.latestHeadCircumference,
            'cm',
          )}
        />
      </section>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {successMessage ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </p>
      ) : null}

      {isLoading ? (
        <LoadingState />
      ) : history.length > 0 ? (
        <>
          <GrowthTrendChart history={history} />
          <section className="grid gap-6 xl:grid-cols-[360px_1fr]">
            <Timeline
              history={history}
              onSaveNote={handleSaveNote}
              onRequestDelete={setMeasurementToDelete}
            />
            <HistoryTable
              history={history}
              onSaveNote={handleSaveNote}
              onRequestDelete={setMeasurementToDelete}
            />
          </section>
        </>
      ) : (
        <EmptyState
          childID={parsedChildID}
          isChildIDValid={isChildIDValid}
          paudQuery={paudQuery}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(measurementToDelete)}
        title="Delete this measurement?"
        description="Deleting this measurement will remove the calculated result for this date."
        confirmLabel="Delete measurement"
        isSubmitting={isDeleting}
        error={deleteError}
        onConfirm={handleConfirmDeleteMeasurement}
        onClose={() => {
          if (!isDeleting) {
            setMeasurementToDelete(null)
            setDeleteError(null)
          }
        }}
      />
    </div>
  )
}

function Timeline({
  history,
  onSaveNote,
  onRequestDelete,
}: {
  history: MeasurementHistory[]
  onSaveNote: (measurementID: number, notes: string) => Promise<void>
  onRequestDelete: (measurement: MeasurementHistory) => void
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">Timeline</p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
        Measurement progression
      </h2>
      <div className="mt-6 space-y-5">
        {history.map((item) => (
          <div key={item.measurement_id} className="relative pl-6">
            <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-brand-600 ring-4 ring-brand-50" />
            <p className="text-sm font-semibold text-slate-950">
              {formatDate(item.measurement_date)}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {item.weight_kg} kg · {item.height_cm} cm · Head circ.{' '}
              {formatNullableMeasurement(item.head_circumference_cm, 'cm')} ·
              BMI {formatNumber(item.bmi)}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge status={item.hcfa_status} />
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                HCFA Z {formatNullableZScore(item.hcfa_zscore)}
              </span>
            </div>
            {item.notes ? (
              <p className="mt-2 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
                {item.notes}
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-400">
                No follow-up note yet.
              </p>
            )}
            <div className="mt-2">
              <div className="flex flex-wrap gap-2">
                <MeasurementNoteEditor
                  notes={item.notes}
                  isProminent={needsFollowUp(item)}
                  onSave={(notes) => onSaveNote(item.measurement_id, notes)}
                />
                <button
                  type="button"
                  onClick={() => onRequestDelete(item)}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

function HistoryTable({
  history,
  onSaveNote,
  onRequestDelete,
}: {
  history: MeasurementHistory[]
  onSaveNote: (measurementID: number, notes: string) => Promise<void>
  onRequestDelete: (measurement: MeasurementHistory) => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1040px] divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {[
                'Date',
                'Weight',
                'Height',
                'Head Circ.',
                'BMI',
                'Notes',
                'WFA',
                'LHFA',
                'WFH',
                'HCFA',
                'Actions',
              ].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {history.map((item) => (
              <tr key={item.measurement_id}>
                <td className="px-4 py-4 text-sm font-medium text-slate-950">
                  {formatDate(item.measurement_date)}
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {item.weight_kg} kg
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {item.height_cm} cm
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {formatNullableMeasurement(item.head_circumference_cm, 'cm')}
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {formatNumber(item.bmi)}
                </td>
                <td className="max-w-[220px] px-4 py-4 text-sm text-slate-600">
                  {item.notes ? item.notes : <span className="text-slate-400">No follow-up note yet.</span>}
                  <div className="mt-2">
                    <MeasurementNoteEditor
                      notes={item.notes}
                      isProminent={needsFollowUp(item)}
                      onSave={(notes) => onSaveNote(item.measurement_id, notes)}
                    />
                  </div>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={item.wfa_status} />
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={item.lhfa_status} />
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={item.wfh_status} />
                </td>
                <td className="px-4 py-4">
                  <div className="space-y-1.5">
                    <StatusBadge status={item.hcfa_status} />
                    <p className="text-xs font-medium text-slate-500">
                      Z {formatNullableZScore(item.hcfa_zscore)}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => onRequestDelete(item)}
                    className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function needsFollowUp(item: MeasurementHistory) {
  return [item.wfh_status, item.lhfa_status, item.hcfa_status].some((status) => {
    const normalized = status?.toLowerCase() ?? ''
    return (
      normalized.includes('wasted') ||
      normalized.includes('stunted') ||
      normalized.includes('low head circumference') ||
      normalized.includes('high head circumference')
    )
  })
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
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
  childID,
  isChildIDValid,
  paudQuery,
}: {
  childID: number
  isChildIDValid: boolean
  paudQuery: string
}) {
  return (
    <section className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="text-sm font-medium text-brand-700">No measurements found</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
        This child does not have measurement history yet
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
        Add a new measurement to start tracking growth progression.
      </p>
      {isChildIDValid ? (
        <Link
          to={`/dashboard/children/${childID}/measurements/new${paudQuery}`}
          className="mt-6 inline-flex rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          Add measurement
        </Link>
      ) : null}
    </section>
  )
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(2)
}

function formatNullableMeasurement(value: number | null | undefined, unit: string) {
  if (value === null || value === undefined) {
    return '-'
  }

  return `${formatNumber(value)} ${unit}`
}

function formatNullableZScore(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return '-'
  }

  return value.toFixed(2)
}

function formatSignedNumber(value: number) {
  if (value > 0) {
    return `+${formatNumber(value)}`
  }

  return formatNumber(value)
}

function getHistoryErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.status === 401) {
      return 'Your session has expired. Please sign in again.'
    }

    if (error.response?.status === 400 || error.response?.status === 422) {
      return 'Unable to load this child measurement history.'
    }
  }

  return 'Unable to load measurement history. Please try again shortly.'
}

function getDeleteMeasurementErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.status === 401) {
      return 'Your session has expired. Please sign in again.'
    }

    if (
      error.response?.status === 400 ||
      error.response?.status === 404 ||
      error.response?.status === 422
    ) {
      return 'This measurement could not be deleted. It may no longer exist or may belong to another PAUD.'
    }
  }

  return 'Unable to delete measurement. Please try again shortly.'
}
