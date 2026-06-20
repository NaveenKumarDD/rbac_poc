import api from './api'

const BASE = '/permissions'

export const getPermissions = (params) => api.get(BASE, { params })

export const getPermissionById = (permissionId) => api.get(`${BASE}/${permissionId}`)

export const createPermission = (payload) => api.post(BASE, payload)

export const updatePermission = (permissionId, payload) =>
  api.patch(`${BASE}/${permissionId}`, payload)

export const deletePermission = (permissionId) => api.delete(`${BASE}/${permissionId}`)
