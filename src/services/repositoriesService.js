import api from './api'

const BASE = '/repositories'

export const getRepositories = () => api.get(BASE)

export const getRepositoryById = (repoId) => api.get(`${BASE}/${repoId}`)

export const getRepositoryAccess = (repoId) => api.get(`${BASE}/${repoId}/access`)

export const updateRepositoryAccess = (repoId, payload) =>
  api.put(`${BASE}/${repoId}/access`, payload)

export const grantRepositoryAccess = (repoId, payload) =>
  api.post(`${BASE}/${repoId}/access`, payload)

export const revokeRepositoryAccess = (repoId, accessId) =>
  api.delete(`${BASE}/${repoId}/access/${accessId}`)

export const getRepositoryRoles = (repoId) => api.get(`${BASE}/${repoId}/roles`)

export const assignRoleToRepository = (repoId, roleId) =>
  api.post(`${BASE}/${repoId}/roles`, { roleId })

export const removeRoleFromRepository = (repoId, roleId) =>
  api.delete(`${BASE}/${repoId}/roles/${roleId}`)
