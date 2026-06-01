import { isAxiosError } from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { getPauds, type Paud } from '../../admin/api/adminApi'
import { useAuthStore } from '../../auth/store/authStore'
import { getChildren, type ChildListItem } from '../api/childrenApi'

export function ChildListPage() {
  const isSuperAdmin = useAuthStore((state) => state.user?.role === 'super_admin')
  const [children, setChildren] = useState<ChildListItem[]>([])
  const [pauds, setPauds] = useState<Paud[]>([])
  const [selectedPaudId, setSelectedPaudId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingPauds, setIsLoadingPauds] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredChildren = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    if (!normalizedQuery) {
      return children
    }

    return children.filter((child) =>
      child.full_name.toLowerCase().includes(normalizedQuery),
    )
  }, [children, searchQuery])

  useEffect(() => {
    if (!isSuperAdmin) {
      return
    }

    let isMounted = true
    setIsLoadingPauds(true)
    getPauds()
      .then((items) => {
        if (!isMounted) {
          return
        }
        setPauds(items)
        setSelectedPaudId((current) => current ?? items[0]?.id ?? null)
      })
      .catch(() => {
        if (isMounted) {
          setError('Unable to load PAUD list.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingPauds(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [isSuperAdmin])

  useEffect(() => {
    let isMounted = true

    async function loadChildren() {
      if (isSuperAdmin && !selectedPaudId) {
        setChildren([])
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const data = await getChildren({
          paud_id: isSuperAdmin ? selectedPaudId : undefined,
        })

        if (isMounted) {
          setChildren(data)
        }
      } catch (caughtError) {
        if (isMounted) {
          setChildren([])
          setError(getChildrenErrorMessage(caughtError))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadChildren()

    return () => {
      isMounted = false
    }
  }, [isSuperAdmin, selectedPaudId])

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-700">
              Child Management
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Children
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              Manage registered children, review their measurement history, and
              add follow-up measurements as PAUD staff collect new data.
            </p>
          </div>

          <Link
            to="/dashboard/children/register"
            className="inline-flex rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Register child
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              {children.length} registered children
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Search by child name to quickly find measurement workflows.
            </p>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-2 lg:max-w-2xl">
            {isSuperAdmin ? (
              <label>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  PAUD
                </span>
                <select
                  value={selectedPaudId ?? ''}
                  onChange={(event) => setSelectedPaudId(Number(event.target.value))}
                  disabled={isLoadingPauds}
                  className={inputClassName}
                >
                  {pauds.map((paud) => (
                    <option key={paud.id} value={paud.id}>
                      {paud.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className={isSuperAdmin ? '' : 'sm:col-start-2'}>
              <span className="sr-only">Search child name</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search child name"
                className={inputClassName}
              />
            </label>
          </div>
        </div>
      </section>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {isLoading || isLoadingPauds ? (
        <LoadingState />
      ) : filteredChildren.length > 0 ? (
        <>
          <DesktopChildrenTable children={filteredChildren} paudID={selectedPaudId} />
          <MobileChildrenList children={filteredChildren} paudID={selectedPaudId} />
        </>
      ) : (
        <EmptyState
          hasSearch={Boolean(searchQuery.trim())}
          isSuperAdmin={isSuperAdmin}
        />
      )}
    </div>
  )
}

function DesktopChildrenTable({
  children,
  paudID,
}: {
  children: ChildListItem[]
  paudID: number | null
}) {
  return (
    <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:block">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {['Child', 'Gender', 'Date of Birth', 'Actions'].map((heading) => (
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
            {children.map((child) => (
              <tr key={child.id}>
                <td className="px-4 py-4">
                  <p className="text-sm font-semibold text-slate-950">
                    {child.full_name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">ID {child.id}</p>
                </td>
                <td className="px-4 py-4 text-sm capitalize text-slate-600">
                  {child.gender}
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {formatDate(child.date_of_birth)}
                </td>
                <td className="px-4 py-4">
                  <ChildActions childID={child.id} paudID={paudID} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MobileChildrenList({
  children,
  paudID,
}: {
  children: ChildListItem[]
  paudID: number | null
}) {
  return (
    <div className="space-y-3 md:hidden">
      {children.map((child) => (
        <article
          key={child.id}
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                {child.full_name}
              </p>
              <p className="mt-1 text-xs text-slate-500">ID {child.id}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">
              {child.gender}
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Born {formatDate(child.date_of_birth)}
          </p>
          <div className="mt-4">
            <ChildActions childID={child.id} paudID={paudID} />
          </div>
        </article>
      ))}
    </div>
  )
}

function ChildActions({ childID, paudID }: { childID: number; paudID: number | null }) {
  const query = paudID ? `?paud_id=${paudID}` : ''

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        to={`/dashboard/children/${childID}/measurements${query}`}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        View History
      </Link>
      <Link
        to={`/dashboard/children/${childID}/measurements/new${query}`}
        className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
      >
        Add Measurement
      </Link>
    </div>
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
  hasSearch,
  isSuperAdmin,
}: {
  hasSearch: boolean
  isSuperAdmin: boolean
}) {
  return (
    <section className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="text-sm font-medium text-brand-700">
        {hasSearch
          ? 'No matching children'
          : isSuperAdmin
            ? 'No children found for this PAUD'
            : 'No children registered'}
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
        {hasSearch
          ? 'Try another search term'
          : isSuperAdmin
            ? 'Select another PAUD or add children for this PAUD'
            : 'Start with child registration'}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
        {hasSearch
          ? 'The current search does not match any child names.'
          : isSuperAdmin
            ? 'There are no registered children for the selected PAUD.'
            : 'Register a child now, then add measurements later as PAUD staff collect them.'}
      </p>
      {!hasSearch ? (
        <Link
          to="/dashboard/children/register"
          className="mt-6 inline-flex rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          Register child
        </Link>
      ) : null}
    </section>
  )
}

const inputClassName =
  'block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100'

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function getChildrenErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.status === 401) {
      return 'Your session has expired. Please sign in again.'
    }

    if (error.response?.status === 400 || error.response?.status === 422) {
      return 'Unable to load children for this PAUD.'
    }
  }

  return 'Unable to load children. Please try again shortly.'
}
