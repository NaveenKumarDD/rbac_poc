import api from './api'

const BASE = '/role-bundles'

export const getRoleBundles = () => api.get(BASE)

export const getRoleBundleById = (bundleId) => api.get(`${BASE}/${bundleId}`)

export const createRoleBundle = (payload) => api.post(BASE, payload)

export const updateRoleBundle = (bundleId, payload) => api.patch(`${BASE}/${bundleId}`, payload)

export const deleteRoleBundle = (bundleId) => api.delete(`${BASE}/${bundleId}`)
