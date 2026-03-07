const API_BASE = ''

async function request(url: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${url}`, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(err.detail || err.message || `HTTP ${res.status}`)
  }
  return res.json()
}

// Weather
export const weatherApi = {
  getCurrent: (city: string) => request(`/api/weather/current?city=${encodeURIComponent(city)}`),
  getForecast: (city: string) => request(`/api/weather/forecast?city=${encodeURIComponent(city)}`),
}

// Disease prediction
export const diseaseApi = {
  predict: (formData: FormData) =>
    fetch('/disease_prediction', { method: 'POST', body: formData }).then(r => r.json()),
  geminiAnalyze: (formData: FormData) =>
    fetch('/api/gemini-analyze', { method: 'POST', body: formData }).then(r => r.json()),
}

// Farmer assistant
export const chatApi = {
  farmerChat: (question: string, chatHistory: string[]) =>
    request('/api/farmer-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, chat_history: chatHistory }),
    }),
  webSearch: (question: string) =>
    request('/api/web-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    }),
  schemesChat: (question: string) =>
    request('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    }),
}

// Water footprint
export const waterApi = {
  calculate: (data: {
    area: number; temperature: number; humidity: number; rainfall: number;
    cropType: string; soilType: string; irrigationMethod: string
  }) =>
    request('/api/calculate-water-footprint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
}

// Equipment
export const equipmentApi = {
  list: (params?: { type?: string; location?: string; min_price?: number; max_price?: number }) => {
    const sp = new URLSearchParams()
    if (params?.type) sp.set('type', params.type)
    if (params?.location) sp.set('location', params.location)
    if (params?.min_price !== undefined) sp.set('min_price', String(params.min_price))
    if (params?.max_price !== undefined) sp.set('max_price', String(params.max_price))
    return request(`/api/equipment?${sp.toString()}`)
  },
  add: (data: any) =>
    request('/api/equipment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  book: (id: string, data: { renter_name: string; renter_phone: string; start_date: string; end_date: string }) =>
    request(`/api/equipment/${id}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
}

// Bookings
export const bookingsApi = {
  list: (params?: { owner?: string; renter?: string }) => {
    const sp = new URLSearchParams()
    if (params?.owner) sp.set('owner', params.owner)
    if (params?.renter) sp.set('renter', params.renter)
    return request(`/api/bookings?${sp.toString()}`)
  },
  updateStatus: (id: string, data: { status: string; payment_method?: string; payment_details?: any }) =>
    request(`/api/bookings/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
}

// Waste exchange
export const wasteApi = {
  list: () => request('/api/waste'),
  add: (data: { waste_type: string; quantity: number; location: string; pickup_date: string; seller: string }) =>
    request('/api/waste', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  remove: (id: string) => request(`/api/waste/${id}`, { method: 'DELETE' }),
}

// Community
export const communityApi = {
  list: () => request('/api/community'),
  create: (data: {
    title: string; content: string; category: string; author: string;
    type?: string; lat?: number | null; lng?: number | null; district?: string
  }) =>
    request('/api/community', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  remove: (id: string) => request(`/api/community/${id}`, { method: 'DELETE' }),
  addAnswer: (postId: string, data: { content: string; author: string }) =>
    request(`/api/community/${postId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  markBestAnswer: (postId: string, answerId: string) =>
    request(`/api/community/${postId}/best-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answerId }),
    }),
}
