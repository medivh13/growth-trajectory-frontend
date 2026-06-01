import { useState, type FormEvent } from 'react'

type MeasurementNoteEditorProps = {
  title?: string
  notes?: string | null
  isProminent?: boolean
  onSave: (notes: string) => Promise<void>
}

export function MeasurementNoteEditor({
  title = 'Follow-up note',
  notes,
  isProminent = false,
  onSave,
}: MeasurementNoteEditorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState(notes ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSaving(true)
    try {
      await onSave(draft)
      setIsOpen(false)
    } catch {
      setError('Unable to save follow-up note. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setDraft(notes ?? '')
          setError(null)
          setIsOpen(true)
        }}
        className={[
          'rounded-md px-3 py-1.5 text-xs font-semibold transition',
          isProminent
            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
            : 'border border-slate-300 text-slate-700 hover:bg-slate-50',
        ].join(' ')}
      >
        {notes ? 'Edit note' : 'Add note'}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-30 grid place-items-center bg-slate-950/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
          >
            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
              {title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Add an interpretation or action note after reviewing the calculated
              growth result.
            </p>
            <textarea
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value)
                setError(null)
              }}
              rows={5}
              className="mt-5 block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-emerald-100"
              placeholder="Need nutrition counseling before next measurement."
            />
            {error ? (
              <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isSaving}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-400"
              >
                {isSaving ? 'Saving...' : 'Save note'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  )
}
