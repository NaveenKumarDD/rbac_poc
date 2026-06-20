import api from './api'

const BASE = '/user-roles'

export const getUserRoles = (params) => api.get(BASE, { params })

export const getUserRoleById = (userRoleId) => api.get(`${BASE}/${userRoleId}`)

export const createUserRole = (payload) => api.post(BASE, payload)

export const updateUserRole = (userRoleId, payload) => api.patch(`${BASE}/${userRoleId}`, payload)

export const deleteUserRole = (userRoleId) => api.delete(`${BASE}/${userRoleId}`)
