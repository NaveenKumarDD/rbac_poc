import api from './api'

const BASE = '/users'

export const getUsers = () => api.get(BASE)

export const getUserById = (userId) => api.get(`${BASE}/${userId}`)

export const createUser = (payload) => api.post(BASE, payload)

export const updateUser = (userId, payload) => api.put(`${BASE}/${userId}`, payload)

export const deleteUser = (userId) => api.delete(`${BASE}/${userId}`)

export const getUserRoles = (userId) => api.get(`${BASE}/${userId}/roles`)

export const assignRolesToUser = (userId, roleIds) =>
  api.post(`${BASE}/${userId}/roles`, { roleIds })

export const removeRoleFromUser = (userId, roleId) =>
  api.delete(`${BASE}/${userId}/roles/${roleId}`)
