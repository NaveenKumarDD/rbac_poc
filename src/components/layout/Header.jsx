export default function Header() {
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

      <div className="w-48 shrink-0" aria-hidden="true" />
    </header>
  )
}
