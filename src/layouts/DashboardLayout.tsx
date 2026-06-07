import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { useAuthStore } from '../features/auth/store/authStore'

const paudAdminNavigation = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: 'D',
    isActive: (pathname: string) => pathname === '/dashboard',
  },
  {
    label: 'Children',
    to: '/dashboard/children',
    icon: 'C',
    isActive: (pathname: string) => pathname === '/dashboard/children',
  },
  {
    label: 'Add Measurement',
    to: '/dashboard/children',
    icon: 'M',
    isActive: (pathname: string) =>
      /^\/dashboard\/children\/[^/]+\/measurements\/new$/.test(pathname),
  },
  {
    label: 'Growth Results',
    to: '/dashboard/results',
    icon: 'G',
    isActive: (pathname: string) => pathname === '/dashboard/results',
  },
]

const superAdminNavigation = [
  {
    label: 'PAUDs',
    to: '/dashboard/admin/pauds',
    icon: 'P',
    isActive: (pathname: string) => pathname === '/dashboard/admin/pauds',
  },
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: 'D',
    isActive: (pathname: string) => pathname === '/dashboard',
  },
  {
    label: 'Global Results',
    to: '/dashboard/results',
    icon: 'G',
    isActive: (pathname: string) => pathname === '/dashboard/results',
  },
  {
    label: 'WHO Reference Data',
    to: '/dashboard/admin/who-reference',
    icon: 'W',
    isActive: (pathname: string) =>
      pathname === '/dashboard/admin/who-reference',
  },
  {
    label: 'Recalculation Jobs',
    to: '/dashboard/admin/recalculations',
    icon: 'R',
    isActive: (pathname: string) =>
      pathname === '/dashboard/admin/recalculations',
  },
]

export function DashboardLayout() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  const navigation =
    user?.role === 'super_admin' ? superAdminNavigation : paudAdminNavigation

  function handleSignOut() {
    clearSession()
    navigate('/auth/sign-in', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <SidebarContent navigation={navigation} />
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                ARUNA Curve
              </p>
              <h2 className="mt-1 truncate text-lg font-semibold tracking-tight">
                Dashboard
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">
                  {user?.name ?? 'PAUD Admin'}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.email ?? 'ARUNA Curve team'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:hidden">
          <nav className="flex gap-2 overflow-x-auto">
            {navigation.map((item) => (
              <NavItem key={item.to} item={item} compact />
            ))}
          </nav>
        </div>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ navigation }: { navigation: NavigationItem[] }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-5 py-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            AC
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
              Child Growth
            </p>
            <h1 className="text-lg font-semibold tracking-tight">
              ARUNA Curve
            </h1>
            <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
              Adaptive Risk Understanding for Nurturing Assessment
            </p>
          </div>
        </div>
      </div>

      <nav className="mt-10 space-y-1">
        {navigation.map((item) => (
          <NavItem key={item.to} item={item} />
        ))}
      </nav>

      <div className="mt-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-950">Screening cycle</p>
        <p className="mt-1 text-sm text-slate-600">May 2026 monitoring</p>
      </div>
    </div>
  )
}

type NavigationItem = {
  label: string
  to: string
  icon: string
  isActive: (pathname: string) => boolean
}

function NavItem({
  item,
  compact = false,
}: {
  item: NavigationItem
  compact?: boolean
}) {
  const { pathname } = useLocation()
  const isActive = item.isActive(pathname)

  return (
    <Link
      to={item.to}
      className={[
        'flex items-center gap-3 rounded-md text-sm font-medium transition',
        compact ? 'whitespace-nowrap px-3 py-2' : 'px-3 py-2.5',
        isActive
          ? 'bg-brand-50 text-brand-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
      ].join(' ')}
    >
      <span className="grid h-7 w-7 place-items-center rounded-md bg-white text-xs font-semibold shadow-sm ring-1 ring-slate-200">
        {item.icon}
      </span>
      {item.label}
    </Link>
  )
}
