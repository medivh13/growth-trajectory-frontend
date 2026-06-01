import { useEffect, useState } from 'react'

import { getPauds, type Paud } from '../api/adminApi'

export function PaudsPage() {
  const [pauds, setPauds] = useState<Paud[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getPauds()
      .then(setPauds)
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-brand-700">Super Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          PAUDs
        </h1>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading PAUDs...</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {pauds.map((paud) => (
              <article key={paud.id} className="p-5">
                <p className="font-semibold text-slate-950">{paud.name}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {[paud.city, paud.province].filter(Boolean).join(', ') ||
                    'Location not set'}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
