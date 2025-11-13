// API Configuration
const apiEnv =
  import.meta.env.VITE_API_BASE_URL ??
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_BACKEND_URL;

export const API_BASE_URL = apiEnv || 'http://127.0.0.1:8000';
