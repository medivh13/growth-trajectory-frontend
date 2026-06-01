import { useEffect, useState } from 'react'

import { enqueueRecalculation, getPauds, type Paud } from '../api/adminApi'

export function RecalculationJobsPage() {
  const [pauds, setPauds] = useState<Paud[]>([])
  const [selectedPaudId, setSelectedPaudId] = useState<string>('all')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    getPauds().then(setPauds)
  }, [])

  async function handleEnqueue() {
    setIsSubmitting(true)
    setMessage(null)
    try {
      const run = await enqueueRecalculation(
        selectedPaudId === 'all' ? null : Number(selectedPaudId),
      )
      setMessage(`Recalculation queued. Run ID: ${run?.run_id ?? '-'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-brand-700">Super Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          Recalculation Jobs
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Queue recalculation after WHO reference data changes. Processing runs
          asynchronously through the backend queue processor.
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <label className="block max-w-md">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Scope
          </span>
          <select
            value={selectedPaudId}
            onChange={(event) => setSelectedPaudId(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
          >
            <option value="all">All PAUDs</option>
            {pauds.map((paud) => (
              <option key={paud.id} value={paud.id}>
                {paud.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleEnqueue}
          className="mt-5 rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:bg-slate-400"
        >
          {isSubmitting ? 'Queueing...' : 'Queue recalculation'}
        </button>

        {message ? (
          <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}
      </section>
    </div>
  )
}
