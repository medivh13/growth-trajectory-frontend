import { Link } from 'react-router-dom'

export function NotFoundRoute() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
      <section className="text-center">
        <p className="text-sm font-medium text-brand-700">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Route not found
        </h1>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
        >
          Return to dashboard
        </Link>
      </section>
    </main>
  )
}
