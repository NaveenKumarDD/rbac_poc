import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  createRoleBundle,
  deleteRoleBundle,
  getRoleBundles,
  updateRoleBundle,
} from '../services/roleBundlesService'

const defaultValues = {
  name: '',
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

export default function RoleBundleManagementPage() {
  const [roleBundles, setRoleBundles] = useState([])
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

    async function fetchRoleBundles() {
      setLoading(true)
      setError(null)

      try {
        const { data } = await getRoleBundles()
        if (!cancelled) {
          setRoleBundles(data?.data?.role_bundles ?? [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          setRoleBundles([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchRoleBundles()

    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const refreshRoleBundles = () => setRefreshKey((current) => current + 1)

  const onSubmit = async (values) => {
    setSubmitting(true)
    setError(null)

    try {
      if (editingId) {
        await updateRoleBundle(editingId, { name: values.name.trim() })
      } else {
        await createRoleBundle({ name: values.name.trim() })
      }

      reset(defaultValues)
      setEditingId(null)
      refreshRoleBundles()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (bundle) => {
    setEditingId(bundle.id)
    setValue('name', bundle.name)
    setError(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    reset(defaultValues)
    setError(null)
  }

  const handleDelete = async (bundleId) => {
    const confirmed = window.confirm('Delete this role bundle?')
    if (!confirmed) return

    setSubmitting(true)
    setError(null)

    try {
      await deleteRoleBundle(bundleId)

      if (editingId === bundleId) {
        handleCancelEdit()
      }

      refreshRoleBundles()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 items-start justify-center p-6">
      <div className="w-full max-w-4xl space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Role Bundle Management</h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage role bundles from HRLMS at{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5">/api/v1/role-bundles</code>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="border-b border-slate-200 px-6 py-5">
            <label htmlFor="bundle-name" className="mb-1.5 block text-sm font-medium text-slate-700">
              {editingId ? 'Update bundle name' : 'Create role bundle'}
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="bundle-name"
                type="text"
                placeholder="e.g. HR ADMIN"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                {...register('name', {
                  required: 'Bundle name is required',
                  validate: (value) => value.trim().length > 0 || 'Bundle name is required',
                })}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </form>

          {error && (
            <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="px-6 py-5">
            {loading ? (
              <p className="text-sm text-slate-500">Loading role bundles...</p>
            ) : roleBundles.length === 0 ? (
              <p className="text-sm text-slate-500">No role bundles found.</p>
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
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {roleBundles.map((bundle) => (
                      <tr key={bundle.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-700">{bundle.id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{bundle.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {formatDate(bundle.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(bundle)}
                              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(bundle.id)}
                              disabled={submitting}
                              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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
