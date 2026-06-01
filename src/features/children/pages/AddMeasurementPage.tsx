import { isAxiosError } from 'axios'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { createMeasurement } from '../api/childrenApi'

type MeasurementFormState = {
  measurement_date: string
  weight_kg: string
  height_cm: string
}

type FormErrors = Partial<Record<keyof MeasurementFormState, string>>

const initialFormState: MeasurementFormState = {
  measurement_date: '',
  weight_kg: '',
  height_cm: '',
}

export function AddMeasurementPage() {
  const navigate = useNavigate()
  const { childId } = useParams()
  const [searchParams] = useSearchParams()
  const paudID = searchParams.get('paud_id')
  const paudQuery = paudID ? `?paud_id=${paudID}` : ''
  const parsedChildID = Number(childId)
  const [form, setForm] = useState<MeasurementFormState>(initialFormState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isChildIDValid = Number.isInteger(parsedChildID) && parsedChildID > 0
  const canSubmit =
    isChildIDValid && form.measurement_date && form.weight_kg && form.height_cm

  function updateField<Field extends keyof MeasurementFormState>(
    field: Field,
    value: MeasurementFormState[Field],
  ) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setSubmitError(null)
    setSuccessMessage(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(null)
    setSuccessMessage(null)

    const validationErrors = validateForm(form)
    setErrors(validationErrors)

    if (!isChildIDValid) {
      setSubmitError('Invalid child selected.')
      return
    }

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await createMeasurement({
        child_id: parsedChildID,
        measurement_date: form.measurement_date,
        weight_kg: Number(form.weight_kg),
        height_cm: Number(form.height_cm),
        paud_id: paudID ? Number(paudID) : undefined,
      })
      setSuccessMessage('Measurement saved successfully.')
      setForm(initialFormState)
      setTimeout(() => {
        navigate(`/dashboard/children/${parsedChildID}/measurements${paudQuery}`)
      }, 600)
    } catch (error) {
      setSubmitError(getSubmitErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-700">
              Add Measurement
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Record a new growth measurement
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              Add weight and height for child ID {isChildIDValid ? parsedChildID : '-'}.
              The backend will compute WHO growth indicators after saving.
            </p>
          </div>
          {isChildIDValid ? (
            <Link
              to={`/dashboard/children/${parsedChildID}/measurements${paudQuery}`}
              className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              View history
            </Link>
          ) : null}
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <FormField
            label="Measurement date"
            htmlFor="measurement_date"
            error={errors.measurement_date}
          >
            <input
              id="measurement_date"
              type="date"
              value={form.measurement_date}
              onChange={(event) =>
                updateField('measurement_date', event.target.value)
              }
              className={inputClassName}
            />
          </FormField>

          <FormField
            label="Weight (kg)"
            htmlFor="weight_kg"
            error={errors.weight_kg}
          >
            <input
              id="weight_kg"
              type="number"
              min="0"
              step="0.1"
              value={form.weight_kg}
              onChange={(event) => updateField('weight_kg', event.target.value)}
              className={inputClassName}
              placeholder="13.4"
            />
          </FormField>

          <FormField
            label="Height (cm)"
            htmlFor="height_cm"
            error={errors.height_cm}
          >
            <input
              id="height_cm"
              type="number"
              min="0"
              step="0.1"
              value={form.height_cm}
              onChange={(event) => updateField('height_cm', event.target.value)}
              className={inputClassName}
              placeholder="102"
            />
          </FormField>
        </div>

        {submitError ? (
          <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </p>
        ) : null}

        {successMessage ? (
          <p className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={() => {
              setForm(initialFormState)
              setErrors({})
              setSubmitError(null)
              setSuccessMessage(null)
            }}
            className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Clear form
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !canSubmit}
            className="rounded-md bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? 'Saving measurement...' : 'Save measurement'}
          </button>
        </div>
      </form>
    </div>
  )
}

function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  )
}

function validateForm(form: MeasurementFormState) {
  const errors: FormErrors = {}

  if (!form.measurement_date) {
    errors.measurement_date = 'Measurement date is required.'
  }

  validatePositiveNumber(form.weight_kg, 'weight_kg', 'Weight', errors)
  validatePositiveNumber(form.height_cm, 'height_cm', 'Height', errors)

  return errors
}

function validatePositiveNumber(
  value: string,
  field: keyof FormErrors,
  label: string,
  errors: FormErrors,
) {
  const numericValue = Number(value)

  if (!value) {
    errors[field] = `${label} is required.`
    return
  }

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    errors[field] = `${label} must be greater than 0.`
  }
}

function getSubmitErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.status === 401) {
      return 'Your session has expired. Please sign in again.'
    }

    if (error.response?.status === 400 || error.response?.status === 422) {
      return 'Please check the measurement data, then try again.'
    }
  }

  return 'Unable to save measurement. Please try again shortly.'
}

const inputClassName =
  'block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-emerald-100'
