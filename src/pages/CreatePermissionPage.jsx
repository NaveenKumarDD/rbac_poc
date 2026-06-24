import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { createPermission } from '../services/permissionsService'
import { getRoleBundles } from '../services/roleBundlesService'
import { buildCreatePermissionRequest } from '../utils/permissionPayload'

const TYPE_OPTIONS = ['MOBILE', 'WEB']

const TAG_OPTIONS = ['Button', 'Page', 'Screen']

const defaultValues = {
  name: '',
  bundleId: '',
  type: '',
  tag: '',
}

export default function CreatePermissionPage() {
  const [roleBundles, setRoleBundles] = useState([])
  const [bundlesLoading, setBundlesLoading] = useState(true)
  const [bundlesError, setBundlesError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues, mode: 'onSubmit' })

  useEffect(() => {
    let cancelled = false

    async function fetchBundles() {
      setBundlesLoading(true)
      setBundlesError(null)

      try {
        const { data } = await getRoleBundles()
        if (!cancelled) {
          setRoleBundles(data?.data?.role_bundles ?? [])
        }
      } catch (err) {
        if (!cancelled) {
          setBundlesError(err.message)
          setRoleBundles([])
        }
      } finally {
        if (!cancelled) {
          setBundlesLoading(false)
        }
      }
    }

    fetchBundles()

    return () => {
      cancelled = true
    }
  }, [])

  const onSubmit = async (values) => {
    setSubmitting(true)
    setSubmitError(null)
    setSuccessMessage(null)

    try {
      const payload = buildCreatePermissionRequest(values, roleBundles)
      const { data } = await createPermission(payload)

      console.log(data?.data ?? payload)
      reset(defaultValues)
      setSuccessMessage('Permission created successfully.')
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Create Permission</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="space-y-4 px-6 py-5">
            {successMessage && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            {submitError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter permission name"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                {...register('name', {
                  required: 'Name is required',
                  validate: (value) => value.trim().length > 0 || 'Name is required',
                })}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="bundleId"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Bundle Name
              </label>
              <select
                id="bundleId"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-100"
                defaultValue=""
                disabled={bundlesLoading || roleBundles.length === 0}
                {...register('bundleId', { required: 'Bundle name is required' })}
              >
                <option value="" disabled>
                  {bundlesLoading ? 'Loading bundles...' : 'Select bundle'}
                </option>
                {roleBundles.map((bundle) => (
                  <option key={bundle.id} value={bundle.id}>
                    {bundle.name}
                  </option>
                ))}
              </select>
              {bundlesError && (
                <p className="mt-1 text-sm text-red-600">{bundlesError}</p>
              )}
              {errors.bundleId && (
                <p className="mt-1 text-sm text-red-600">{errors.bundleId.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="type" className="mb-1.5 block text-sm font-medium text-slate-700">
                Type
              </label>
              <select
                id="type"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                defaultValue=""
                {...register('type', { required: 'Type is required' })}
              >
                <option value="" disabled>
                  Select type
                </option>
                {TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="tag" className="mb-1.5 block text-sm font-medium text-slate-700">
                Tag
              </label>
              <select
                id="tag"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                defaultValue=""
                {...register('tag', { required: 'Tag is required' })}
              >
                <option value="" disabled>
                  Select tag
                </option>
                {TAG_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.tag && (
                <p className="mt-1 text-sm text-red-600">{errors.tag.message}</p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 px-6 py-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
