import { useMemo, useState } from 'react'

export default function BaseRolePicker({
  roles = [],
  selectedIds = [],
  onChange,
  error,
  loading = false,
}) {
  const [search, setSearch] = useState('')

  const filteredRoles = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return roles

    return roles.filter((role) =>
      (role.role_name ?? '').toLowerCase().includes(query),
    )
  }, [roles, search])

  const allFilteredSelected =
    filteredRoles.length > 0 &&
    filteredRoles.every((role) => selectedIds.includes(role.id))

  const toggleRole = (roleId) => {
    const next = selectedIds.includes(roleId)
      ? selectedIds.filter((id) => id !== roleId)
      : [...selectedIds, roleId]

    onChange?.(next)
  }

  const selectAllFiltered = () => {
    const ids = filteredRoles.map((role) => role.id)
    onChange?.([...new Set([...selectedIds, ...ids])])
  }

  const clearAll = () => onChange?.([])

  if (loading) {
    return <p className="text-sm text-slate-500">Loading roles...</p>
  }

  if (roles.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
        No existing roles to copy from. Create a fresh role instead.
      </p>
    )
  }

  return (
    <div>
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search roles..."
          className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAllFiltered}
            disabled={filteredRoles.length === 0 || allFilteredSelected}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Select {search.trim() ? 'filtered' : 'all'}
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={selectedIds.length === 0}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedIds.map((roleId) => {
            const role = roles.find((item) => item.id === roleId)
            if (!role) return null

            return (
              <button
                key={roleId}
                type="button"
                onClick={() => toggleRole(roleId)}
                className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-indigo-200 transition hover:bg-indigo-100"
              >
                {role.role_name}
                <span aria-hidden="true">×</span>
              </button>
            )
          })}
        </div>
      )}

      <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
        {filteredRoles.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-slate-500">No roles match your search.</p>
        ) : (
          filteredRoles.map((role) => {
            const isSelected = selectedIds.includes(role.id)
            const permissionCount = role.permissions?.length ?? 0

            return (
              <label
                key={role.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 transition ${
                  isSelected ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleRole(role.id)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="flex-1 text-sm font-medium text-slate-900">
                  {role.role_name ?? 'Unnamed role'}
                </span>
                <span className="text-xs text-slate-500">
                  {permissionCount} permission{permissionCount === 1 ? '' : 's'}
                </span>
              </label>
            )
          })
        )}
      </div>

      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  )
}
