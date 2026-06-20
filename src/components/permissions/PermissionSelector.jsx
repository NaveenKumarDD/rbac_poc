import { useEffect, useMemo, useState } from 'react'
import { getPermissions } from '../../services/permissionsService'
import { groupPermissionsByBundleAndType } from '../../utils/groupPermissions'

export default function PermissionSelector({
  selectedIds = [],
  onChange,
  error,
  requireSelection = true,
}) {
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const groupedPermissions = useMemo(
    () => groupPermissionsByBundleAndType(permissions),
    [permissions],
  )

  useEffect(() => {
    let cancelled = false

    async function fetchPermissions() {
      setLoading(true)
      setLoadError(null)

      try {
        const { data } = await getPermissions()
        if (!cancelled) {
          setPermissions(data?.data?.permissions ?? [])
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.message)
          setPermissions([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchPermissions()

    return () => {
      cancelled = true
    }
  }, [])

  const togglePermission = (permissionId) => {
    const current = selectedIds ?? []
    const next = current.includes(permissionId)
      ? current.filter((id) => id !== permissionId)
      : [...current, permissionId]

    onChange?.(next)
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading permissions...</p>
  }

  if (loadError) {
    return <p className="text-sm text-red-600">{loadError}</p>
  }

  if (permissions.length === 0) {
    return <p className="text-sm text-slate-500">No permissions available.</p>
  }

  return (
    <div>
      <div className="max-h-96 space-y-4 overflow-y-auto rounded-lg border border-slate-200 p-4">
        {groupedPermissions.map(({ bundleName, types }) => (
          <section key={bundleName} className="space-y-3">
            <h4 className="border-b border-slate-200 pb-2 text-sm font-semibold text-slate-900">
              {bundleName}
            </h4>

            {types.map(({ type, items }) => (
              <div key={`${bundleName}-${type}`} className="space-y-2 pl-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  {type}
                </p>

                <div className="space-y-1">
                  {items.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-1.5 hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds?.includes(permission.id) ?? false}
                        onChange={() => togglePermission(permission.id)}
                        className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-slate-900">
                        {permission.name || 'Unnamed permission'}
                        {permission.tag ? ` · ${permission.tag}` : ''}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>

      {requireSelection && error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
