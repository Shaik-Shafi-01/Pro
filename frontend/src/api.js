export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('token');
  const { method = 'GET', body, headers = {} } = options;

  const requestOptions = {
    method,
    headers: { ...headers }
  };

  if (token) {
    requestOptions.headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    requestOptions.headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${path}`, requestOptions);

  let payload = {};
  try {
    payload = await response.json();
  } catch (error) {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload.message || `Request failed with status ${response.status}`);
  }

  return payload;
}
