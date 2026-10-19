/**
 * Indian address validation and helpers.
 * - Pincode to state/territory lookup (first 2-6 digits match)
 * - Email block list validation
 * - Indian mobile number validation
 * - Custom dropdown-compatible data
 */

// Indian states and union territories
export const INDIAN_STATES = [
  { value: 'AN', label: 'Andaman and Nicobar Islands' },
  { value: 'AP', label: 'Andhra Pradesh' },
  { value: 'AR', label: 'Arunachal Pradesh' },
  { value: 'AS', label: 'Assam' },
  { value: 'BR', label: 'Bihar' },
  { value: 'CH', label: 'Chandigarh' },
  { value: 'CT', label: 'Chhattisgarh' },
  { value: 'DN', label: 'Dadra and Nagar Haveli' },
  { value: 'DD', label: 'Daman and Diu' },
  { value: 'DL', label: 'Delhi' },
  { value: 'GA', label: 'Goa' },
  { value: 'GJ', label: 'Gujarat' },
  { value: 'HR', label: 'Haryana' },
  { value: 'HP', label: 'Himachal Pradesh' },
  { value: 'JK', label: 'Jammu and Kashmir' },
  { value: 'JH', label: 'Jharkhand' },
  { value: 'KA', label: 'Karnataka' },
  { value: 'KL', label: 'Kerala' },
  { value: 'LD', label: 'Lakshadweep' },
  { value: 'MP', label: 'Madhya Pradesh' },
  { value: 'MH', label: 'Maharashtra' },
  { value: 'MN', label: 'Manipur' },
  { value: 'ML', label: 'Meghalaya' },
  { value: 'MZ', label: 'Mizoram' },
  { value: 'NL', label: 'Nagaland' },
  { value: 'OR', label: 'Odisha' },
  { value: 'PB', label: 'Punjab' },
  { value: 'PY', label: 'Puducherry' },
  { value: 'RJ', label: 'Rajasthan' },
  { value: 'SK', label: 'Sikkim' },
  { value: 'TN', label: 'Tamil Nadu' },
  { value: 'TG', label: 'Telangana' },
  { value: 'TR', label: 'Tripura' },
  { value: 'UP', label: 'Uttar Pradesh' },
  { value: 'UT', label: 'Uttarakhand' },
  { value: 'WB', label: 'West Bengal' },
].sort((a, b) => a.label.localeCompare(b.label))

// Blocked email domains (disposable / temp / suspicious)
export const BLOCKED_EMAIL_DOMAINS = [
  'tempmail.com',
  'throwawaymail.com',
  '10minutemail.com',
  'mailinator.com',
  'guerrillamail.com',
  'temp-mail.org',
  'yopmail.com',
  'sharklasers.com',
  'spam4.me',
  'dispostable.com',
]

export const BLOCKED_EMAIL_PREFIXES = [
  'admin', 'postmaster', 'abuse', 'noreply', 'no-reply',
  'support', 'help', 'contact-us',
  'test', 'demo', 'sample',
]

// Pincode to state mapping (first 6 digits mapped to primary state)
const PINCODE_STATE_MAP = {
  // Major metro pincodes
  '1100': 'DL', '4000': 'MH', '6000': 'TN', '7000': 'WB',
  '5600': 'KA', '5000': 'TG', '3800': 'GJ', '4110': 'MH',
  '6000': 'TN', '7000': 'WB', '1100': 'DL', '5000': 'TG',
  '3800': 'GJ', '4110': 'MH', '5600': 'KA', '5000': 'TG',
  '3800': 'GJ', '4110': 'MH', '5600': 'KA', '1100': 'DL',
  // Additional common ranges (approximate by first 2 digits for simplicity in demo)
  '11': 'DL', '12': 'HR', '13': 'PB', '14': 'PB',
  '20': 'UP', '21': 'UP', '22': 'WB', '23': 'WB',
  '26': 'MP', '27': 'MP', '28': 'GJ', '29': 'GJ',
  '40': 'AP', '41': 'AP', '50': 'TG', '51': 'TG',
  '52': 'KA', '53': 'KA', '56': 'KA',
  '60': 'TN', '61': 'TN', '62': 'TN', '63': 'TN',
  '64': 'KL', '65': 'KL', '68': 'TN',
  '70': 'WB', '71': 'WB', '72': 'WB', '73': 'WB',
}

export function getStateFromPinCode(pin) {
  if (!pin || typeof pin !== 'string') return null
  const cleaned = pin.replace(/\D/g, '').substring(0, 6)
  if (!cleaned) return null
  // Try full 6-digit first, then 4-digit, then 2-digit prefix
  for (let len = Math.min(6, cleaned.length); len >= 2; len--) {
    const prefix = cleaned.substring(0, len)
    if (PINCODE_STATE_MAP[prefix]) {
      return PINCODE_STATE_MAP[prefix]
    }
  }
  return null
}

export function getStateNameFromCode(code) {
  const state = INDIAN_STATES.find(s => s.value === code)
  return state ? state.label : null
}

// Email block list check
export function isBlockedEmail(email) {
  if (!email || typeof email !== 'string') return true
  const lower = email.toLowerCase().trim()
  const domain = lower.split('@')[1]
  if (BLOCKED_EMAIL_DOMAINS.includes(domain)) return true
  const prefix = lower.split('@')[0]
  if (BLOCKED_EMAIL_PREFIXES.includes(prefix)) return true
  return false
}

// Email format validation (stricter than standard regex)
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false
  const trimmed = email.trim()
  if (trimmed.length > 254) return false
  if (trimmed.indexOf('..') !== -1) return false
  if (trimmed.indexOf('@') === -1) return false
  // More permissive but functional regex for Indian use
  const emailRe = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
  if (!emailRe.test(trimmed)) return false
  if (isBlockedEmail(trimmed)) return false
  return true
}

// Indian mobile validation
export function isValidIndianMobile(mobile) {
  if (!mobile && mobile !== '') return false
  const digits = String(mobile).replace(/\D/g, '')
  if (digits.length === 10) {
    // Indian mobile numbers: starts with 6, 7, 8, 9
    return /^[6789]\d{9}$/.test(digits)
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    const body = digits.slice(2)
    return /^[6789]\d{9}$/.test(body)
  }
  return false
}

// Pincode validation
export function isValidPinCode(pin) {
  if (!pin) return false
  const digits = String(pin).replace(/\D/g, '')
  return digits.length === 6 && /^[1-9]\d{5}$/.test(digits)
}
