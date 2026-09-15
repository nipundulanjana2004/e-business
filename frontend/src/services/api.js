const API_BASE = '/api';

const safeFetch = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return { success: false, status: res.status };
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await res.json();
    }
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return { success: false };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const fetchProducts = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return safeFetch(`${API_BASE}/products?${query}`);
};

export const fetchProductById = async (id) => {
  return safeFetch(`${API_BASE}/products/${id}`);
};

export const createProduct = async (productData, token) => {
  return safeFetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });
};

export const updateProduct = async (id, productData, token) => {
  return safeFetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });
};

export const deleteProduct = async (id, token) => {
  return safeFetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const loginUser = async (email, password) => {
  return safeFetch(`${API_BASE}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
};

export const registerUser = async (name, email, password) => {
  return safeFetch(`${API_BASE}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
};

export const createOrder = async (orderData, token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return safeFetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(orderData)
  });
};

export const fetchOrders = async (token) => {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return safeFetch(`${API_BASE}/orders`, { headers });
};

export const updateOrderStatus = async (id, status, token) => {
  return safeFetch(`${API_BASE}/orders/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
};

export const fetchReviews = async () => {
  return safeFetch(`${API_BASE}/reviews`);
};

export const submitContact = async (contactData) => {
  return safeFetch(`${API_BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contactData)
  });
};

export const subscribeNewsletter = async (email) => {
  return safeFetch(`${API_BASE}/newsletter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
};

export const updateUserProfile = async (profileData, token) => {
  return safeFetch(`${API_BASE}/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
};
