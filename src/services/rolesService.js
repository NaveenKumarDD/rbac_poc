import api from './api'

const BASE = '/roles'

export const getRoles = () => api.get(BASE)

export const getRoleById = (roleId) => api.get(`${BASE}/${roleId}`)

export const createRole = (payload) => api.post(BASE, payload)

export const updateRole = (roleId, payload) => api.put(`${BASE}/${roleId}`, payload)

export const deleteRole = (roleId) => api.delete(`${BASE}/${roleId}`)

export const assignPermissionsToRole = (roleId, permissionIds) =>
  api.post(`${BASE}/${roleId}/permissions`, { permissionIds })

export const removePermissionFromRole = (roleId, permissionId) =>
  api.delete(`${BASE}/${roleId}/permissions/${permissionId}`)
