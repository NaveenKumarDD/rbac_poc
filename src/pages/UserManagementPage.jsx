import { useEffect, useState } from 'react'
import {
  assignRoleToUsers,
  getStaffFilters,
  getStaffUsers,
} from '../services/userManagementService'

const PAGE_SIZE_OPTIONS = [20, 50, 100, 250, 500]
const DEFAULT_PAGE_SIZE = 50

const EMPTY_FILTERS = {
  role: '',
  department_id: '',
  entity_id: '',
  category_id: '',
  designation: '',
  type: '',
  has_role: '',
}

function buildStaffQueryParams({ page, pageSize, submittedSearch, submittedFilters }) {
  const params = {
    page,
    limit: pageSize,
    include_filter_options: false,
  }

  if (submittedSearch) {
    params.search = submittedSearch
  }

  if (submittedFilters.role) {
    params.role = submittedFilters.role
  }

  if (submittedFilters.department_id) {
    params.department_id = Number(submittedFilters.department_id)
  }

  if (submittedFilters.entity_id) {
    params.entity_id = Number(submittedFilters.entity_id)
  }

  if (submittedFilters.category_id) {
    params.category_id = Number(submittedFilters.category_id)
  }

  if (submittedFilters.designation) {
    params.designation = submittedFilters.designation
  }

  if (submittedFilters.type) {
    params.type = submittedFilters.type
  }

  if (submittedFilters.has_role === 'true') {
    params.has_role = true
  } else if (submittedFilters.has_role === 'false') {
    params.has_role = false
  }

  return params
}

function FilterSelect({ id, label, value, onChange, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
      >
        {children}
      </select>
    </div>
  )
}

function getRecordRange(meta) {
  if (!meta?.total) return { start: 0, end: 0 }

  const start = (meta.page - 1) * meta.limit + 1
  const end = Math.min(meta.page * meta.limit, meta.total)
  return { start, end }
}

export default function UserManagementPage() {
  const [staff, setStaff] = useState([])
  const [filterOptions, setFilterOptions] = useState(null)
  const [selectedQids, setSelectedQids] = useState([])
  const [selectedRole, setSelectedRole] = useState('')
  const [search, setSearch] = useState('')
  const [submittedSearch, setSubmittedSearch] = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [submittedFilters, setSubmittedFilters] = useState(EMPTY_FILTERS)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filtersLoading, setFiltersLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [assignResult, setAssignResult] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchFilters() {
      setFiltersLoading(true)

      try {
        const { data } = await getStaffFilters()
        if (!cancelled) {
          setFilterOptions(data?.data?.filters ?? null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
        }
      } finally {
        if (!cancelled) {
          setFiltersLoading(false)
        }
      }
    }

    fetchFilters()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function fetchStaff() {
      setLoading(true)
      setError(null)

      try {
        const params = buildStaffQueryParams({
          page,
          pageSize,
          submittedSearch,
          submittedFilters,
        })
        const { data } = await getStaffUsers(params)

        if (!cancelled) {
          setStaff(data?.data?.staff ?? [])
          setMeta(data?.meta ?? null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          setStaff([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchStaff()

    return () => {
      cancelled = true
    }
  }, [page, pageSize, submittedSearch, submittedFilters, refreshKey])

  const refreshStaff = () => setRefreshKey((current) => current + 1)

  const updateFilter = (key) => (event) => {
    setFilters((current) => ({ ...current, [key]: event.target.value }))
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    setSubmittedSearch(search.trim())
    setPage(1)
  }

  const handleFiltersSubmit = (event) => {
    event.preventDefault()
    setSubmittedFilters(filters)
    setPage(1)
  }

  const handleClearFilters = () => {
    setFilters(EMPTY_FILTERS)
    setSubmittedFilters(EMPTY_FILTERS)
    setPage(1)
  }

  const toggleUser = (qid) => {
    setSelectedQids((current) =>
      current.includes(qid) ? current.filter((id) => id !== qid) : [...current, qid],
    )
  }

  const toggleAllOnPage = () => {
    const pageQids = staff.map((user) => user.qid)
    const allSelected = pageQids.every((qid) => selectedQids.includes(qid))

    if (allSelected) {
      setSelectedQids((current) => current.filter((qid) => !pageQids.includes(qid)))
    } else {
      setSelectedQids((current) => [...new Set([...current, ...pageQids])])
    }
  }

  const handleAssignRole = async () => {
    if (!selectedQids.length) {
      setError('Select at least one user.')
      return
    }

    if (!selectedRole) {
      setError('Select a role to assign.')
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccessMessage(null)
    setAssignResult(null)

    try {
      const { data } = await assignRoleToUsers({
        qids: selectedQids,
        role_name: selectedRole,
      })

      const result = data?.data
      setAssignResult(result)
      setSuccessMessage(data?.message ?? 'Role assignment completed.')
      setSelectedQids([])
      refreshStaff()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const allOnPageSelected =
    staff.length > 0 && staff.every((user) => selectedQids.includes(user.qid))

  const assignableRoles = filterOptions?.roles ?? []
  const recordRange = getRecordRange(meta)

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value))
    setPage(1)
  }

  const goToPage = (nextPage) => {
    if (!meta) return
    setPage(Math.min(Math.max(1, nextPage), meta.totalPages))
  }

  return (
    <div className="flex flex-1 items-start justify-center p-6">
      <div className="w-full max-w-6xl space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">User Management</h2>
            <p className="mt-1 text-sm text-slate-500">
              List staff users and assign roles via{' '}
              <code className="rounded bg-slate-100 px-1.5 py-0.5">/api/v1/user/management</code>
            </p>
          </div>

          <div className="space-y-4 border-b border-slate-200 px-6 py-5">
            <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, QID, email, phone..."
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="submit"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Search
              </button>
            </form>

            {filtersLoading ? (
              <p className="text-sm text-slate-500">Loading filters...</p>
            ) : filterOptions ? (
              <form onSubmit={handleFiltersSubmit} className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <FilterSelect
                    id="filter-role"
                    label="Role"
                    value={filters.role}
                    onChange={updateFilter('role')}
                  >
                    <option value="">All roles</option>
                    <option value="__unassigned__">Unassigned</option>
                    {filterOptions.roles?.map((role) => (
                      <option key={role.id} value={role.role_name}>
                        {role.role_name}
                      </option>
                    ))}
                  </FilterSelect>

                  <FilterSelect
                    id="filter-has-role"
                    label="Role status"
                    value={filters.has_role}
                    onChange={updateFilter('has_role')}
                  >
                    <option value="">Any</option>
                    <option value="true">Has role</option>
                    <option value="false">No role</option>
                  </FilterSelect>

                  <FilterSelect
                    id="filter-department"
                    label="Department"
                    value={filters.department_id}
                    onChange={updateFilter('department_id')}
                  >
                    <option value="">All departments</option>
                    {filterOptions.departments?.map((department) => (
                      <option key={department.department_id} value={department.department_id}>
                        {department.department_name}
                      </option>
                    ))}
                  </FilterSelect>

                  <FilterSelect
                    id="filter-entity"
                    label="Entity"
                    value={filters.entity_id}
                    onChange={updateFilter('entity_id')}
                  >
                    <option value="">All entities</option>
                    {filterOptions.entities?.map((entity) => (
                      <option key={entity.entity_id} value={entity.entity_id}>
                        {entity.entity_name}
                      </option>
                    ))}
                  </FilterSelect>

                  <FilterSelect
                    id="filter-category"
                    label="Staff category"
                    value={filters.category_id}
                    onChange={updateFilter('category_id')}
                  >
                    <option value="">All categories</option>
                    {filterOptions.staff_categories?.map((category) => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.category_name}
                      </option>
                    ))}
                  </FilterSelect>

                  <FilterSelect
                    id="filter-designation"
                    label="Designation"
                    value={filters.designation}
                    onChange={updateFilter('designation')}
                  >
                    <option value="">All designations</option>
                    {filterOptions.designations?.map((designation) => (
                      <option key={designation} value={designation}>
                        {designation}
                      </option>
                    ))}
                  </FilterSelect>

                  <FilterSelect
                    id="filter-type"
                    label="User type"
                    value={filters.type}
                    onChange={updateFilter('type')}
                  >
                    <option value="">All types</option>
                    {filterOptions.types?.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </FilterSelect>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
                  >
                    Apply filters
                  </button>
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Clear filters
                  </button>
                </div>
              </form>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label htmlFor="assign-role" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Assign role
                </label>
                <select
                  id="assign-role"
                  value={selectedRole}
                  onChange={(event) => setSelectedRole(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Select role</option>
                  {assignableRoles.map((role) => (
                    <option key={role.id} value={role.role_name}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleAssignRole}
                disabled={submitting || !selectedQids.length || !selectedRole}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
              >
                {submitting
                  ? 'Assigning...'
                  : `Assign to ${selectedQids.length} user${selectedQids.length === 1 ? '' : 's'}`}
              </button>
            </div>

            {selectedQids.length > 0 && (
              <p className="text-sm text-slate-600">{selectedQids.length} user(s) selected</p>
            )}
          </div>

          {successMessage && (
            <div className="mx-6 mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
              {assignResult?.failed?.length > 0 && (
                <span className="mt-1 block">
                  {assignResult.updated?.length ?? 0} updated, {assignResult.failed.length} failed.
                </span>
              )}
            </div>
          )}

          {assignResult?.failed?.length > 0 && (
            <div className="mx-6 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-medium">Failed assignments:</p>
              <ul className="mt-2 list-disc pl-5">
                {assignResult.failed.map((item) => (
                  <li key={item.qid}>
                    {item.qid}: {item.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="px-6 py-5">
            {meta && (
              <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">
                  Showing{' '}
                  <span className="font-medium text-slate-900">
                    {recordRange.start}–{recordRange.end}
                  </span>{' '}
                  of <span className="font-medium text-slate-900">{meta.total}</span> users
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    Rows per page
                    <select
                      value={pageSize}
                      onChange={handlePageSizeChange}
                      disabled={loading}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => goToPage(1)}
                      disabled={loading || !meta.hasPrevPage}
                      className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="First page"
                    >
                      «
                    </button>
                    <button
                      type="button"
                      onClick={() => goToPage(page - 1)}
                      disabled={loading || !meta.hasPrevPage}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="min-w-24 px-2 text-center text-sm text-slate-600">
                      Page {meta.page} of {meta.totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => goToPage(page + 1)}
                      disabled={loading || !meta.hasNextPage}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                    <button
                      type="button"
                      onClick={() => goToPage(meta.totalPages)}
                      disabled={loading || !meta.hasNextPage}
                      className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Last page"
                    >
                      »
                    </button>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <p className="text-sm text-slate-500">Loading users...</p>
            ) : staff.length === 0 ? (
              <p className="text-sm text-slate-500">No users found.</p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <div className="max-h-[min(60vh,32rem)] overflow-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={allOnPageSelected}
                          onChange={toggleAllOnPage}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          aria-label="Select all users on page"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        QID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Designation
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Current Role
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {staff.map((user) => (
                      <tr key={user.qid} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedQids.includes(user.qid)}
                            onChange={() => toggleUser(user.qid)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            aria-label={`Select ${user.name}`}
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{user.qid}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{user.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{user.mail_id ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{user.designation ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{user.role ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
