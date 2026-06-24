const TOKEN_KEY = 'authToken'
const EXPIRES_KEY = 'authExpiresAt'
const QID_KEY = 'authQid'

export function saveAuthSession({ access_token, expires_in, qid }) {
  localStorage.setItem(TOKEN_KEY, access_token)
  localStorage.setItem(EXPIRES_KEY, String(Date.now() + expires_in * 1000))
  localStorage.setItem(QID_KEY, qid)
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EXPIRES_KEY)
  localStorage.removeItem(QID_KEY)
}

export function getAuthToken() {
  const token = localStorage.getItem(TOKEN_KEY)
  const expiresAt = Number(localStorage.getItem(EXPIRES_KEY))

  if (!token || !expiresAt || Date.now() >= expiresAt) {
    clearAuthSession()
    return null
  }

  return token
}

export function isAuthenticated() {
  return getAuthToken() !== null
}

export function getAuthQid() {
  if (!isAuthenticated()) return null
  return localStorage.getItem(QID_KEY)
}

export function getAuthExpiresAt() {
  const expiresAt = Number(localStorage.getItem(EXPIRES_KEY))
  return Number.isFinite(expiresAt) ? expiresAt : null
}
