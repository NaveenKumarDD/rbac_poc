import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import {
  createUserRole,
  deleteUserRole,
  getUserRoles,
  updateUserRole,
} from '../services/userRolesService'

const defaultValues = {
  roleName: '',
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

export default function RoleManagementPage() {
  const [userRoles, setUserRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues, mode: 'onSubmit' })

  useEffect(() => {
    let cancelled = false

    async function fetchUserRoles() {
      setLoading(true)
      setError(null)

      try {
        const { data } = await getUserRoles()
        if (!cancelled) {
          setUserRoles(data?.data?.user_roles ?? [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          setUserRoles([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchUserRoles()

    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const refreshUserRoles = () => setRefreshKey((current) => current + 1)

  const onSubmit = async (values) => {
    setSubmitting(true)
    setError(null)

    const payload = {
      role_name: values.roleName.trim(),
    }

    try {
      if (editingId) {
        await updateUserRole(editingId, payload)
      } else {
        await createUserRole(payload)
      }

      reset(defaultValues)
      setEditingId(null)
      refreshUserRoles()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (userRole) => {
    setEditingId(userRole.id)
    setValue('roleName', userRole.role_name ?? '')
    setError(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    reset(defaultValues)
    setError(null)
  }

  const handleDelete = async (userRoleId) => {
    const confirmed = window.confirm('Delete this role?')
    if (!confirmed) return

    setSubmitting(true)
    setError(null)

    try {
      await deleteUserRole(userRoleId)

      if (editingId === userRoleId) {
        handleCancelEdit()
      }

      refreshUserRoles()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 items-start justify-center p-6">
      <div className="w-full max-w-5xl space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Role Management</h2>
            <p className="mt-1 text-sm text-slate-500">
              Create and manage roles via{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5">/api/v1/user-roles</code>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="border-b border-slate-200 px-6 py-5">
            <label htmlFor="roleName" className="mb-1.5 block text-sm font-medium text-slate-700">
              {editingId ? 'Update role name' : 'Create role'}
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="roleName"
                type="text"
                placeholder="e.g. MANAGER"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                {...register('roleName', {
                  required: 'Name is required',
                  validate: (value) => value.trim().length > 0 || 'Name is required',
                })}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-300"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
            {errors.roleName && (
              <p className="mt-1 text-sm text-red-600">{errors.roleName.message}</p>
            )}
          </form>

          {error && (
            <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="px-6 py-5">
            {loading ? (
              <p className="text-sm text-slate-500">Loading roles...</p>
            ) : userRoles.length === 0 ? (
              <p className="text-sm text-slate-500">No roles found.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Created At
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Permission Management
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {userRoles.map((userRole) => (
                      <tr key={userRole.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-700">{userRole.id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {userRole.role_name ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {formatDate(userRole.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/role-management/${userRole.id}/permissions`}
                            className="inline-flex rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-50"
                          >
                            Add Permissions
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(userRole)}
                              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(userRole.id)}
                              disabled={submitting}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
