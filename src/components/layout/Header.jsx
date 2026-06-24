import { useAuth } from '../../context/useAuth'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="flex shrink-0 items-center border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex w-48 shrink-0 items-center">
        <img
          src="/duodecimal-logo.png"
          alt="DuoDecimal"
          className="h-8 w-auto object-contain"
        />
      </div>

      <h1 className="flex-1 text-center text-lg font-semibold tracking-tight text-slate-900">
        Qsuite Access Control Portal
      </h1>

      <div className="flex w-48 shrink-0 items-center justify-end gap-3">
        {user?.qid && (
          <span className="hidden text-xs text-slate-500 sm:inline">{user.qid}</span>
        )}
        <button
          type="button"
          onClick={logout}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
