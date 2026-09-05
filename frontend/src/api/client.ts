import axios from 'axios';

export const TOKEN_KEY = 'saludya_token';
export const USUARIO_KEY = 'saludya_usuario';

// Token "fantasma" que usa el modo demo offline (ver AuthContext.loginDemoOffline).
// Nunca es un JWT real -- ninguna llamada con este token puede autenticar
// nada contra el backend, es solo una marca local para saber que la sesión
// actual es una sesión de demo sin red, no una sesión real vencida.
export const DEMO_OFFLINE_TOKEN = 'demo-offline';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3070',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const enModoDemoOffline = localStorage.getItem(TOKEN_KEY) === DEMO_OFFLINE_TOKEN;
    // En modo demo offline, cualquier 401 es esperado (el token no es real,
    // no hay backend real respondiendo) -- no es una sesión vencida, así
    // que no la limpiamos ni redirigimos a /login. Cada pantalla se hace
    // cargo de mostrar su propio estado vacío/error para esa llamada puntual.
    if (error.response?.status === 401 && !enModoDemoOffline) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USUARIO_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
