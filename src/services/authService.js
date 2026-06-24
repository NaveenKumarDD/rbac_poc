import publicApi from './publicApi'

export const sendOtp = (phone_number) => publicApi.post('/otp/send', { phone_number })

export const verifyOtp = (phone_number, otp) => publicApi.post('/otp/verify', { phone_number, otp })
