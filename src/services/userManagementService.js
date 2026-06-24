import api from './api'

const BASE = '/user/management'

export const getStaffUsers = (params) => api.get(`${BASE}/staff`, { params })

export const getStaffFilters = () => api.get(`${BASE}/filters`)

export const assignRoleToUsers = (payload) => api.post(`${BASE}/roles/assign`, payload)
