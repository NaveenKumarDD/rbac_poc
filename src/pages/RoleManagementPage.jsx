import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import PermissionSelector from '../components/permissions/PermissionSelector'
import BaseRolePicker from '../components/roles/BaseRolePicker'
import {
  createUserRole,
  deleteUserRole,
  getUserRoles,
  updateUserRole,
} from '../services/userRolesService'
import { unionRolePermissionIds } from '../utils/rolePermissions'

const defaultValues = {
  roleName: '',
}

const CREATE_MODES = {
  FRESH: 'fresh',
  FROM_EXISTING: 'fromExisting',
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

function StepBadge({ number, label, active, done }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          done
            ? 'bg-indigo-600 text-white'
            : active
              ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-600'
              : 'bg-slate-100 text-slate-500'
        }`}
      >
        {number}
      </span>
      <span
        className={`text-sm font-medium ${active || done ? 'text-slate-900' : 'text-slate-400'}`}
      >
        {label}
      </span>
    </div>
  )
}

export default function RoleManagementPage() {
  const [userRoles, setUserRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [createMode, setCreateMode] = useState(CREATE_MODES.FRESH)
  const [baseRoleIds, setBaseRoleIds] = useState([])
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([])
  const [baseRoleError, setBaseRoleError] = useState(null)
  const [permissionError, setPermissionError] = useState(null)

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

  const resetCreateState = () => {
    setCreateMode(CREATE_MODES.FRESH)
    setBaseRoleIds([])
    setSelectedPermissionIds([])
    setBaseRoleError(null)
    setPermissionError(null)
  }

  const closeCreateForm = () => {
    setShowCreateForm(false)
    reset(defaultValues)
    resetCreateState()
    setError(null)
  }

  const handleCreateModeChange = (mode) => {
    setCreateMode(mode)
    setBaseRoleIds([])
    setSelectedPermissionIds([])
    setBaseRoleError(null)
    setPermissionError(null)
  }

  const handleBaseRolesChange = (nextRoleIds) => {
    setBaseRoleIds(nextRoleIds)
    setSelectedPermissionIds(unionRolePermissionIds(nextRoleIds, userRoles))
    setBaseRoleError(null)
  }

  const onSubmit = async (values) => {
    setSubmitting(true)
    setError(null)
    setBaseRoleError(null)
    setPermissionError(null)

    const roleName = values.roleName.trim()

    if (!editingId && createMode === CREATE_MODES.FROM_EXISTING && baseRoleIds.length === 0) {
      setBaseRoleError('Select at least one role to copy permissions from.')
      setSubmitting(false)
      return
    }

    if (!editingId && selectedPermissionIds.length === 0) {
      setPermissionError('Select at least one permission for the role.')
      setSubmitting(false)
      return
    }

    const payload = editingId
      ? { role_name: roleName }
      : {
          role_name: roleName,
          permissions: selectedPermissionIds.map(Number),
        }

    try {
      if (editingId) {
        await updateUserRole(editingId, payload)
      } else {
        await createUserRole(payload)
      }

      reset(defaultValues)
      setEditingId(null)
      closeCreateForm()
      refreshUserRoles()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (userRole) => {
    setEditingId(userRole.id)
    setShowCreateForm(true)
    setValue('roleName', userRole.role_name ?? '')
    resetCreateState()
    setError(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    closeCreateForm()
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

  const isCreating = !editingId
  const showBaseRoleStep = isCreating && createMode === CREATE_MODES.FROM_EXISTING
  const showPermissionsStep =
    isCreating &&
    (createMode === CREATE_MODES.FRESH ||
      (createMode === CREATE_MODES.FROM_EXISTING && baseRoleIds.length > 0))

  return (
    <div className="flex flex-1 items-start justify-center p-6">
      <div className="w-full max-w-5xl space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Role Management</h2>
              <p className="mt-1 text-sm text-slate-500">
                Create and manage roles for the access control portal.
              </p>
            </div>
            {!showCreateForm && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  reset(defaultValues)
                  resetCreateState()
                  setError(null)
                  setShowCreateForm(true)
                }}
                className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                + Create role
              </button>
            )}
          </div>

          {(showCreateForm || editingId) && (
            <form onSubmit={handleSubmit(onSubmit)} className="border-b border-slate-200 px-6 py-5">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  {editingId ? 'Update role name' : 'Create role'}
                </h3>
                {!editingId && (
                  <button
                    type="button"
                    onClick={closeCreateForm}
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {isCreating && (
                <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2">
                  <StepBadge number={1} label="Start from" active={!showBaseRoleStep} done />
                  {showBaseRoleStep && (
                    <>
                      <span className="hidden text-slate-300 sm:inline">→</span>
                      <StepBadge number={2} label="Copy from roles" active={baseRoleIds.length === 0} done={baseRoleIds.length > 0} />
                    </>
                  )}
                  <span className="hidden text-slate-300 sm:inline">→</span>
                  <StepBadge
                    number={showBaseRoleStep ? 3 : 2}
                    label="Name & permissions"
                    active={showPermissionsStep}
                    done={false}
                  />
                </div>
              )}

              <div className="space-y-6">
                {isCreating && (
                  <section>
                    <p className="mb-3 text-sm font-medium text-slate-700">How do you want to start?</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => handleCreateModeChange(CREATE_MODES.FRESH)}
                        className={`rounded-xl border p-4 text-left transition ${
                          createMode === CREATE_MODES.FRESH
                            ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600/20'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <p className="text-sm font-semibold text-slate-900">Fresh new role</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Start with no permissions and pick them manually.
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCreateModeChange(CREATE_MODES.FROM_EXISTING)}
                        className={`rounded-xl border p-4 text-left transition ${
                          createMode === CREATE_MODES.FROM_EXISTING
                            ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600/20'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <p className="text-sm font-semibold text-slate-900">From existing role(s)</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Combine permissions from one or more roles, then customize.
                        </p>
                      </button>
                    </div>
                  </section>
                )}

                {showBaseRoleStep && (
                  <section>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Copy permissions from
                    </label>
                    <p className="mb-3 text-sm text-slate-500">
                      Select roles below. Their permissions will be merged into your starting set.
                    </p>
                    <BaseRolePicker
                      roles={userRoles}
                      selectedIds={baseRoleIds}
                      onChange={handleBaseRolesChange}
                      error={baseRoleError}
                      loading={loading}
                    />
                  </section>
                )}

                {isCreating && showBaseRoleStep && !showPermissionsStep && (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    Select at least one role above to continue with the role name and permissions.
                  </div>
                )}

                {(editingId || showPermissionsStep || createMode === CREATE_MODES.FRESH) && (
                  <>
                    <section>
                      <label
                        htmlFor="roleName"
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        Role name
                      </label>
                      <input
                        id="roleName"
                        type="text"
                        placeholder="e.g. MANAGER"
                        className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        {...register('roleName', {
                          required: 'Name is required',
                          validate: (value) => value.trim().length > 0 || 'Name is required',
                        })}
                      />
                      {errors.roleName && (
                        <p className="mt-1 text-sm text-red-600">{errors.roleName.message}</p>
                      )}
                    </section>

                    {isCreating && showPermissionsStep && (
                      <section>
                        <div className="mb-2 flex items-baseline justify-between gap-4">
                          <label className="text-sm font-medium text-slate-700">Permissions</label>
                          {createMode === CREATE_MODES.FROM_EXISTING && baseRoleIds.length > 0 && (
                            <span className="text-xs text-slate-500">
                              {selectedPermissionIds.length} from {baseRoleIds.length} role
                              {baseRoleIds.length === 1 ? '' : 's'} — adjust as needed
                            </span>
                          )}
                        </div>
                        <PermissionSelector
                          selectedIds={selectedPermissionIds}
                          onChange={(ids) => {
                            setSelectedPermissionIds(ids)
                            setPermissionError(null)
                          }}
                          error={permissionError}
                          requireSelection
                        />
                      </section>
                    )}
                  </>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-300"
                  >
                    {submitting ? 'Saving...' : editingId ? 'Update' : 'Create role'}
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
            </form>
          )}

          {error && (
            <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="px-6 py-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Existing roles</h3>
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
                        Permissions
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
                          {userRole.permissions?.length ?? 0}
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
