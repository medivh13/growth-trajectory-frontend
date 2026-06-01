import { useEffect, useMemo, useState } from 'react'

import {
  getWhoReferenceRows,
  getWhoReferenceTables,
  updateWhoReferenceRow,
  type WhoReferenceRow,
  type WhoReferenceTableInfo,
} from '../api/adminApi'

const editableColumns = [
  'l',
  'm',
  's',
  'sd',
  'sd3_neg',
  'sd2_neg',
  'sd1_neg',
  'sd0',
  'sd1',
  'sd2',
  'sd3',
]

export function WhoReferenceDataPage() {
  const [tables, setTables] = useState<WhoReferenceTableInfo[]>([])
  const [selectedTable, setSelectedTable] = useState('')
  const [rows, setRows] = useState<WhoReferenceRow[]>([])
  const [search, setSearch] = useState('')
  const [editingRow, setEditingRow] = useState<WhoReferenceRow | null>(null)
  const [reason, setReason] = useState('')
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const selectedInfo = tables.find((table) => table.table_name === selectedTable)
  const keyColumn = selectedInfo?.key_column ?? 'id'

  useEffect(() => {
    getWhoReferenceTables().then((items) => {
      setTables(items)
      setSelectedTable(items[0]?.table_name ?? '')
    })
  }, [])

  useEffect(() => {
    if (!selectedTable) {
      return
    }
    setIsLoading(true)
    getWhoReferenceRows({ tableName: selectedTable, search })
      .then(setRows)
      .finally(() => setIsLoading(false))
  }, [selectedTable, search])

  const columns = useMemo(() => Object.keys(rows[0] ?? {}), [rows])

  function openEdit(row: WhoReferenceRow) {
    setEditingRow(row)
    setReason('')
    setDraft(
      Object.fromEntries(
        editableColumns
          .filter((column) => column in row)
          .map((column) => [column, String(row[column] ?? '')]),
      ),
    )
  }

  async function saveEdit() {
    if (!editingRow || !selectedTable || !reason.trim()) {
      return
    }

    const values = Object.fromEntries(
      Object.entries(draft)
        .filter(([, value]) => value !== '')
        .map(([key, value]) => [key, Number(value)]),
    )

    await updateWhoReferenceRow({
      tableName: selectedTable,
      id: String(editingRow[keyColumn]),
      values,
      reason,
    })

    setEditingRow(null)
    const refreshed = await getWhoReferenceRows({ tableName: selectedTable, search })
    setRows(refreshed)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-brand-700">Super Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          WHO Reference Data
        </h1>
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Changing WHO reference data may affect calculated growth results.
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
          <label>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Table
            </span>
            <select
              value={selectedTable}
              onChange={(event) => setSelectedTable(event.target.value)}
              className={inputClassName}
            >
              {tables.map((table) => (
                <option key={table.table_name} value={table.table_name}>
                  {table.table_name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Search key
            </span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className={inputClassName}
              placeholder="Age, week, or height"
            />
          </label>
        </div>
      </section>

      <section className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading WHO rows...</p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {columns.map((column) => (
                  <th key={column} className="px-4 py-3 font-semibold">
                    {column}
                  </th>
                ))}
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={String(row[keyColumn])}>
                  {columns.map((column) => (
                    <td key={column} className="whitespace-nowrap px-4 py-3">
                      {String(row[column] ?? '')}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {editingRow ? (
        <div className="fixed inset-0 z-20 grid place-items-center bg-slate-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-950">
              Edit {selectedTable} row {String(editingRow[keyColumn])}
            </h2>
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Changing WHO reference data may affect calculated growth results.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {Object.entries(draft).map(([column, value]) => (
                <label key={column}>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {column}
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={value}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        [column]: event.target.value,
                      }))
                    }
                    className={inputClassName}
                  />
                </label>
              ))}
            </div>

            <label className="mt-4 block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reason
              </span>
              <textarea
                required
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                className={inputClassName}
                rows={3}
              />
            </label>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingRow(null)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!reason.trim()}
                onClick={saveEdit}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-400"
              >
                Save with audit
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

const inputClassName =
  'mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100'
