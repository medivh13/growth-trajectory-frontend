import { isAxiosError } from 'axios'
import { useMemo, useState, type FormEvent } from 'react'

import {
  createChildWithMeasurement,
  type CreateChildWithMeasurementPayload,
} from '../api/childrenApi'

type ChildFormState = {
  full_name: string
  gender: '' | CreateChildWithMeasurementPayload['gender']
  date_of_birth: string
  measurement_date: string
  weight_kg: string
  height_cm: string
}

type FormErrors = Partial<Record<keyof ChildFormState, string>>

const initialFormState: ChildFormState = {
  full_name: '',
  gender: '',
  date_of_birth: '',
  measurement_date: '',
  weight_kg: '',
  height_cm: '',
}

export function ChildRegistrationPage() {
  const [form, setForm] = useState<ChildFormState>(initialFormState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit = useMemo(
    () =>
      form.full_name.trim() &&
      form.gender &&
      form.date_of_birth &&
      form.measurement_date &&
      form.weight_kg &&
      form.height_cm,
    [form],
  )

  function updateField<Field extends keyof ChildFormState>(
    field: Field,
    value: ChildFormState[Field],
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

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await createChildWithMeasurement(toPayload(form))
      setSuccessMessage('Child registration and first measurement saved.')
      setForm(initialFormState)
    } catch (error) {
      setSubmitError(getSubmitErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div>
            <p className="text-sm font-medium text-brand-700">
              Child Registration
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Register child with first measurement
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              Add a child profile and capture the first growth measurement in
              one workflow for faster PAUD screening intake.
            </p>
          </div>

          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-5">
            <p className="text-sm font-medium text-emerald-800">
              Measurement intake
            </p>
            <p className="mt-2 text-sm leading-6 text-emerald-900/80">
              Weight and height are submitted with the child profile to
              establish the first growth baseline.
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:p-8"
      >
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <section>
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              Child profile
            </h2>
            <div className="mt-5 space-y-5">
              <FormField
                label="Full name"
                htmlFor="full_name"
                error={errors.full_name}
              >
                <input
                  id="full_name"
                  type="text"
                  value={form.full_name}
                  onChange={(event) =>
                    updateField('full_name', event.target.value)
                  }
                  className={inputClassName}
                  placeholder="Aisha Ayudia Fitriani"
                />
              </FormField>

              <FormField label="Gender" htmlFor="gender" error={errors.gender}>
                <select
                  id="gender"
                  value={form.gender}
                  onChange={(event) =>
                    updateField(
                      'gender',
                      event.target
                        .value as ChildFormState['gender'],
                    )
                  }
                  className={inputClassName}
                >
                  <option value="">Select gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </FormField>

              <FormField
                label="Date of birth"
                htmlFor="date_of_birth"
                error={errors.date_of_birth}
              >
                <input
                  id="date_of_birth"
                  type="date"
                  value={form.date_of_birth}
                  onChange={(event) =>
                    updateField('date_of_birth', event.target.value)
                  }
                  className={inputClassName}
                />
              </FormField>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">
              First measurement
            </h2>
            <div className="mt-5 space-y-5">
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

              <div className="grid gap-5 sm:grid-cols-2">
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
                    onChange={(event) =>
                      updateField('weight_kg', event.target.value)
                    }
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
                    onChange={(event) =>
                      updateField('height_cm', event.target.value)
                    }
                    className={inputClassName}
                    placeholder="102"
                  />
                </FormField>

              </div>
            </div>
          </section>
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
            {isSubmitting ? 'Saving registration...' : 'Save registration'}
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

function validateForm(form: ChildFormState) {
  const errors: FormErrors = {}

  if (!form.full_name.trim()) {
    errors.full_name = 'Full name is required.'
  }

  if (!form.gender) {
    errors.gender = 'Gender is required.'
  }

  if (!form.date_of_birth) {
    errors.date_of_birth = 'Date of birth is required.'
  }

  if (!form.measurement_date) {
    errors.measurement_date = 'Measurement date is required.'
  }

  validatePositiveNumber(form.weight_kg, 'weight_kg', 'Weight', errors)
  validatePositiveNumber(form.height_cm, 'height_cm', 'Height', errors)

  if (
    form.date_of_birth &&
    form.measurement_date &&
    form.measurement_date < form.date_of_birth
  ) {
    errors.measurement_date =
      'Measurement date cannot be before date of birth.'
  }

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

function toPayload(form: ChildFormState): CreateChildWithMeasurementPayload {
  return {
    full_name: form.full_name.trim(),
    gender: form.gender as CreateChildWithMeasurementPayload['gender'],
    date_of_birth: form.date_of_birth,
    measurement_date: form.measurement_date,
    weight_kg: Number(form.weight_kg),
    height_cm: Number(form.height_cm),
  }
}

function getSubmitErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.status === 401) {
      return 'Your session has expired. Please sign in again.'
    }

    if (error.response?.status === 409) {
      return 'A child with this name already exists in this PAUD.'
    }

    if (error.response?.status === 422 || error.response?.status === 400) {
      return 'Please check the child and measurement data, then try again.'
    }
  }

  return 'Unable to save registration. Please try again shortly.'
}

const inputClassName =
  'block w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-emerald-100'
