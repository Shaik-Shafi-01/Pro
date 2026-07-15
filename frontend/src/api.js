<<<<<<< HEAD
export const API_BASE = import.meta.env.VITE_API_URL || 'https://pro-backend-bkyn.onrender.com/api';
=======
export const API_BASE = import.meta.env.VITE_API_URL;
>>>>>>> 3aed39c (updated db)

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

<<<<<<< HEAD
=======
  // console.log('Url ---------------:', path);
  // console.log('final url--------------', API_BASE + path); // Log the request options for debugging

>>>>>>> 3aed39c (updated db)
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
