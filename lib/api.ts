import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export const api = axios.create({
  baseURL: BASE_URL,
  // 30s per attempt — a sleeping Render free instance can take ~30-60s to cold-start
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Fire-and-forget ping to /health that wakes a sleeping Render free instance
// so it has time to cold-start before the voter's real request arrives.
export function warmUpBackend() {
  api.get('/health').catch(() => {})
}

// Automatically attach auth token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Handle global response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config
    const method = String(config?.method ?? '').toLowerCase()
    const isNetworkFailure = !error.response
    // Only auto-retry idempotent methods (GET/HEAD/OPTIONS/PUT/DELETE) so that
    // a retried request can't create duplicate records (e.g. double payments).
    const isIdempotent = ['get', 'head', 'options', 'put', 'delete'].includes(method)

    // Retry ONCE on timeouts / network failures (e.g. backend cold start).
    // Never retry HTTP error responses, and never auto-retry POST requests
    // (e.g. payment initiation) to avoid creating duplicate records.
    if (config && !config._retried && isNetworkFailure && isIdempotent) {
      config._retried = true
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return api(config)
    }

    const status = error.response?.status

    if (status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }

    if (status === 403) {
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    }

    return Promise.reject(error)
  }
)

// ============================================
// AUTH
// ============================================
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  signup: (data: {
    name: string
    email: string
    password: string
    role: 'voter' | 'organizer'
  }) => api.post('/auth/signup', data),

  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get('/auth/me'),
}

// ============================================
// EVENTS
// ============================================
export const eventsApi = {
  getAll: () =>
    api.get('/events/public'),

  getById: (id: string) =>
    api.get(`/events/${id}`),

  getResults: (id: string) =>
    api.get(`/events/${id}/results`),

  create: (data: object) =>
    api.post('/events', data),

  update: (id: string, data: object) =>
    api.put(`/events/${id}`, data),

  delete: (id: string) =>
    api.delete(`/events/${id}`),

  submitForReview: (id: string) =>
    api.post(`/events/${id}/submit`),

  close: (id: string) =>
    api.post(`/events/${id}/close`),

  reopenEvent: (id: string) =>
    api.post(`/events/${id}/reopen`),

  getMine: () =>
    api.get('/events/mine'),
}

// ============================================
// CATEGORIES
// ============================================
export const categoriesApi = {
  getByEvent: (eventId: string) =>
    api.get(`/events/${eventId}/categories`),

  create: (eventId: string, data: object) =>
    api.post(`/events/${eventId}/categories`, data),

  update: (eventId: string, categoryId: string, data: object) =>
    api.put(`/events/${eventId}/categories/${categoryId}`, data),

  delete: (eventId: string, categoryId: string) =>
    api.delete(`/events/${eventId}/categories/${categoryId}`),

  closeCategory: (eventId: string, categoryId: string) =>
    api.post(`/events/${eventId}/categories/${categoryId}/close`),
}

// ============================================
// NOMINEES
// ============================================
export const nomineesApi = {
  getByCategory: (eventId: string, categoryId: string) =>
    api.get(`/events/${eventId}/categories/${categoryId}/nominees`),

  getByCode: (code: string) =>
    api.get(`/nominees/code/${code}`),

  getLeaderboard: (categoryId: string) =>
    api.get(`/nominees/category/${categoryId}/leaderboard`),

  getById: (id: string) =>
    api.get(`/nominees/${id}`),

  create: (eventId: string, categoryId: string, data: object) =>
    api.post(`/events/${eventId}/categories/${categoryId}/nominees`, data),

  update: (id: string, data: object) =>
    api.put(`/nominees/${id}`, data),

  delete: (id: string) =>
    api.delete(`/nominees/${id}`),
}

// ============================================
// PAYMENTS
// ============================================
export const paymentsApi = {
  initiate: (data: {
    nomineeId: string
    quantity: number
    email?: string
    phone?: string
  }) => api.post('/payments/initiate', data),

  verify: (reference: string) =>
    api.get(`/payments/verify/${reference}`),

  getReceipt: (reference: string) =>
    api.get(`/payments/receipt/${reference}`),

  getMyTransactions: () =>
    api.get('/payments/me'),
}

// ============================================
// ORGANIZER
// ============================================
export const organizerApi = {
  getDashboard: () =>
    api.get('/organizer/dashboard'),

  getAnalytics: (eventId: string) =>
    api.get(`/organizer/events/${eventId}/analytics`),

  getVoteRecords: (eventId: string) =>
    api.get(`/organizer/events/${eventId}/votes`),

  getPaymentRecords: (eventId: string) =>
    api.get(`/organizer/events/${eventId}/payments`),

  publishWinners: (eventId: string, data: object) =>
    api.post(`/organizer/events/${eventId}/winners`, data),

  getSettlements: () =>
    api.get('/organizer/settlements'),

  savePayoutAccount: (data: object) =>
    api.post('/organizer/settlements/payout-account', data),

  requestWithdrawal: (amount: number) =>
    api.post('/organizer/settlements/withdraw', { amount }),

  updateProfile: (data: object) =>
    api.put('/organizer/profile', data),
}

// ============================================
// ADMIN
// ============================================
export const adminApi = {
  getDashboard: () =>
    api.get('/admin/dashboard'),

  getOrganizations: () =>
    api.get('/admin/organizations'),

  getOrganization: (id: string) =>
    api.get(`/admin/organizations/${id}`),

  updateOrganization: (id: string, data: object) =>
    api.put(`/admin/organizations/${id}`, data),

  getUsers: () =>
    api.get('/admin/users'),

  deleteUser: (id: string) =>
    api.delete(`/admin/users/${id}`),

  getAllEvents: () =>
    api.get('/admin/events'),

  approveEvent: (id: string) =>
    api.post(`/admin/events/${id}/approve`),

  rejectEvent: (id: string, reason: string) =>
    api.post(`/admin/events/${id}/reject`, { reason }),

  getAllNominees: () =>
    api.get('/admin/nominees'),

  moderateNominee: (id: string, data: { status: 'approved' | 'rejected' }) =>
    api.put(`/admin/nominees/${id}/moderate`, data),

  getPayments: () =>
    api.get('/admin/payments'),

  getWithdrawals: () =>
    api.get('/admin/withdrawals'),

  approveWithdrawal: (id: string) =>
    api.post(`/admin/withdrawals/${id}/approve`),

  markWithdrawalPaid: (id: string, reference: string) =>
    api.post(`/admin/withdrawals/${id}/mark-paid`, { reference }),

  rejectWithdrawal: (id: string, reason: string) =>
    api.post(`/admin/withdrawals/${id}/reject`, { reason }),

  getSubscriptions: () =>
    api.get('/admin/subscriptions'),

  getReports: () =>
    api.get('/admin/reports'),

  getSupportTickets: () =>
    api.get('/admin/support'),

  updateTicket: (id: string, data: { status: 'open' | 'in_progress' | 'resolved' }) =>
    api.put(`/admin/support/${id}`, data),

  getAuditLogs: () =>
    api.get('/admin/audit-logs'),
}