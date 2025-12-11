// API client helper using native fetch
// Used inside React Query queryFn / mutationFn

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'applens_token';

/**
 * Makes an API request with automatic JSON handling and JWT auth
 * @param {string} path - API endpoint path (e.g., '/auth/login')
 * @param {RequestInit} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<any>} - Parsed JSON response
 * @throws {Error} - If response is not ok
 */
export async function apiRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  
  // Build headers
  const headers = new Headers(options.headers);
  
  // Add Content-Type for JSON (unless body is FormData)
  if (!(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }
  
  // Add Authorization header if token exists
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Parse response
  let data;
  const contentType = response.headers.get('Content-Type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }
  
  // Handle errors
  if (!response.ok) {
    const errorMessage = data?.error || data?.message || response.statusText || 'Request failed';
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  
  return data;
}

// Convenience methods
export const api = {
  get: (path, options = {}) => 
    apiRequest(path, { ...options, method: 'GET' }),
  
  post: (path, body, options = {}) => 
    apiRequest(path, { 
      ...options, 
      method: 'POST', 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),
  
  put: (path, body, options = {}) => 
    apiRequest(path, { 
      ...options, 
      method: 'PUT', 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),
  
  patch: (path, body, options = {}) => 
    apiRequest(path, { 
      ...options, 
      method: 'PATCH', 
      body: body instanceof FormData ? body : JSON.stringify(body) 
    }),
  
  delete: (path, options = {}) => 
    apiRequest(path, { ...options, method: 'DELETE' }),
};

export default api;
