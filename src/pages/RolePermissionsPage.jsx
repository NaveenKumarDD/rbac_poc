import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PermissionSelector from '../components/permissions/PermissionSelector'
import { getPermissions } from '../services/permissionsService'
import { getUserRoleById, updateUserRole } from '../services/userRolesService'

function resolveSelectedPermissionIds(rolePermissions, allPermissions) {
  if (!rolePermissions?.length) return []

  if (typeof rolePermissions[0] === 'string') {
    const rbacSet = new Set(rolePermissions)
    return allPermissions.filter((permission) => rbacSet.has(permission.rbac)).map((p) => p.id)
  }

  return rolePermissions.map(Number)
}

export default function RolePermissionsPage() {
  const { roleId } = useParams()
  const navigate = useNavigate()

  const [roleName, setRoleName] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchRolePermissions() {
      setLoading(true)
      setError(null)

      try {
        const [roleResponse, permissionsResponse] = await Promise.all([
          getUserRoleById(roleId),
          getPermissions(),
        ])

        if (cancelled) return

        const role = roleResponse.data?.data
        const permissions = permissionsResponse.data?.data?.permissions ?? []

        setRoleName(role?.role_name ?? '')
        setSelectedIds(resolveSelectedPermissionIds(role?.permissions, permissions))
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchRolePermissions()

    return () => {
      cancelled = true
    }
  }, [roleId])

  const handleSave = async () => {
    setSubmitting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      await updateUserRole(roleId, {
        permissions: selectedIds.map(Number),
      })

      setSuccessMessage('Permissions updated successfully.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 items-start justify-center p-6">
      <div className="w-full max-w-4xl rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <Link
            to="/role-management"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            ← Back to Role Management
          </Link>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">Manage Permissions</h2>
          <p className="mt-1 text-sm text-slate-500">
            {roleName ? `Role: ${roleName}` : 'Loading role...'}
          </p>
        </div>

        <div className="px-6 py-5">
          {loading ? (
            <p className="text-sm text-slate-500">Loading role permissions...</p>
          ) : (
            <>
              {successMessage && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {successMessage}
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <label className="mb-2 block text-sm font-medium text-slate-700">Permissions</label>
              <PermissionSelector
                selectedIds={selectedIds}
                onChange={setSelectedIds}
                requireSelection={false}
              />
            </>
          )}
        </div>

        <div className="flex gap-2 border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || submitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {submitting ? 'Saving...' : 'Save Permissions'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/role-management')}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
