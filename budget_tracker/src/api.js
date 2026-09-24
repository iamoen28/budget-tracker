const API_URL = 'http://localhost:3001/api'

const getToken = () => {
  return localStorage.getItem('budget_tracker_token')
}

const request = async (endpoint, options = {}) => {
  const token = getToken()

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'API request failed')
  }

  return data
}

export const api = {
  get: endpoint => request(endpoint),

  post: (endpoint, body) =>
    request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    }),

  put: (endpoint, body) =>
    request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    }),

  delete: endpoint =>
    request(endpoint, {
      method: 'DELETE'
    })
}