import { Link } from 'react-router-dom'

import { MeasurementNoteEditor } from '../../children/components/MeasurementNoteEditor'
import { StatusBadge } from './StatusBadge'
import type { GrowthResult } from '../api/resultsApi'

type GrowthResultsTableProps = {
  results: GrowthResult[]
  paudID?: number | null
  onSaveNote: (measurementID: number, notes: string) => Promise<void>
  onRequestDelete: (result: GrowthResult) => void
}

export function GrowthResultsTable({
  results,
  paudID,
  onSaveNote,
  onRequestDelete,
}: GrowthResultsTableProps) {
  const query = paudID ? `?paud_id=${paudID}` : ''

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1040px] divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {[
                'Child',
                'Gender',
                'Measurement',
                'Weight',
                'Height',
                'BMI',
                'Notes',
                'WFA',
                'LHFA',
                'WFH',
                'BMI Status',
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
            {results.map((result) => (
              <tr key={result.MeasurementID}>
                <td className="px-4 py-4">
                  <p className="text-sm font-semibold text-slate-950">
                    {result.FullName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    ID {result.ChildID}
                  </p>
                </td>
                <td className="px-4 py-4 text-sm capitalize text-slate-600">
                  {result.Gender}
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {formatDate(result.MeasurementDate)}
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {result.WeightKg} kg
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {result.HeightCm} cm
                </td>
                <td className="px-4 py-4 text-sm font-medium text-slate-800">
                  {result.BMI}
                </td>
                <td className="max-w-[220px] px-4 py-4 text-sm text-slate-600">
                  {result.Notes ? (
                    <span title={result.Notes} className="line-clamp-2">
                      {result.Notes}
                    </span>
                  ) : (
                    <span className="text-slate-400">No follow-up note yet.</span>
                  )}
                  <div className="mt-2">
                    <MeasurementNoteEditor
                      notes={result.Notes}
                      isProminent={needsFollowUp(result)}
                      onSave={(notes) => onSaveNote(result.MeasurementID, notes)}
                    />
                  </div>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={result.WfaStatus} />
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={result.LhfaStatus} />
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={result.WfhStatus} />
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={result.BmiStatus} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/dashboard/children/${result.ChildID}/measurements${query}`}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View History
                    </Link>
                    <Link
                      to={`/dashboard/children/${result.ChildID}/measurements/new${query}`}
                      className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
                    >
                      Add Measurement
                    </Link>
                    <button
                      type="button"
                      onClick={() => onRequestDelete(result)}
                      className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function needsFollowUp(result: GrowthResult) {
  return [result.WfhStatus, result.LhfaStatus].some((status) => {
    const normalized = status.toLowerCase()
    return normalized.includes('wasted') || normalized.includes('stunted')
  })
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}
