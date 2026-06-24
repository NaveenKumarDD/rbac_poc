import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { sendOtp, verifyOtp } from '../services/authService'

function normalizePhoneNumber(value) {
  return value.replace(/\s+/g, '').replace(/^\+91/, '')
}

function isValidPhoneNumber(value) {
  return /^[6-9]\d{9}$/.test(normalizePhoneNumber(value))
}

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [infoMessage, setInfoMessage] = useState(null)

  if (isAuthenticated) {
    return <Navigate to="/create-permission" replace />
  }

  const handleSendOtp = async (event) => {
    event.preventDefault()
    setError(null)
    setInfoMessage(null)

    const normalizedPhone = normalizePhoneNumber(phoneNumber)
    if (!isValidPhoneNumber(normalizedPhone)) {
      setError('Enter a valid 10-digit Indian mobile number.')
      return
    }

    setLoading(true)

    try {
      await sendOtp(normalizedPhone)
      setOtpSent(true)
      setInfoMessage('OTP sent to your mobile number.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (event) => {
    event.preventDefault()
    setError(null)
    setInfoMessage(null)

    const normalizedPhone = normalizePhoneNumber(phoneNumber)
    if (!isValidPhoneNumber(normalizedPhone)) {
      setError('Enter a valid 10-digit Indian mobile number.')
      return
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError('OTP must be a 6-digit code.')
      return
    }

    setLoading(true)

    try {
      const { data } = await verifyOtp(normalizedPhone, otp.trim())
      const session = data?.data

      if (!session?.access_token) {
        throw new Error('Login failed — no access token received.')
      }

      login({
        access_token: session.access_token,
        expires_in: session.expires_in ?? 86400,
        qid: session.qid,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5 text-center">
          <img
            src="/duodecimal-logo.png"
            alt="DuoDecimal"
            className="mx-auto mb-4 h-8 w-auto object-contain"
          />
          <h1 className="text-lg font-semibold text-slate-900">Qsuite Access Control Portal</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in with your registered mobile number</p>
        </div>

        <form
          onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
          className="space-y-4 px-6 py-5"
        >
          {infoMessage && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {infoMessage}
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-700">
              Mobile number
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="9876543210"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100"
            />
          </div>

          {otpSent && (
            <div>
              <label htmlFor="otp" className="mb-1.5 block text-sm font-medium text-slate-700">
                OTP
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit code"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tracking-widest text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {loading ? 'Please wait...' : otpSent ? 'Verify & Login' : 'Send OTP'}
          </button>

          {otpSent && (
            <button
              type="button"
              onClick={() => {
                setOtpSent(false)
                setOtp('')
                setInfoMessage(null)
                setError(null)
              }}
              disabled={loading}
              className="w-full text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
            >
              Change mobile number
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
