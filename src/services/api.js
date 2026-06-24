import axios from 'axios'
import { clearAuthSession, getAuthToken } from '../utils/authStorage'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

let onUnauthorized = () => {}

export function setOnUnauthorized(handler) {
  onUnauthorized = handler
}

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken()

    if (!token) {
      onUnauthorized()
      return Promise.reject(new Error('Session expired. Please log in again.'))
    }

    config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession()
      onUnauthorized()
    }

    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  },
)

export default api
