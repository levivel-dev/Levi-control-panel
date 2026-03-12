import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const getToken = () => localStorage.getItem('ldcp_token');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const unwrap = (promise) => promise.then((res) => res.data);

const apiFetch = (path, options = {}) => {
  return unwrap(api({ url: path, ...options }));
};

const apiJson = (path, data, options = {}) => {
  const method = options.method || 'post';
  return unwrap(api({ url: path, method, data, ...options }));
};

const apiUpload = (path, formData, options = {}) => {
  return unwrap(
    api({
      url: path,
      method: options.method || 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(options.headers || {})
      }
    })
  );
};

export { API_BASE_URL, api, apiFetch, apiJson, apiUpload, getToken };
