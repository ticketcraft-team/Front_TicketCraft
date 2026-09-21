import axios from 'axios';
import Cookies from 'js-cookie';

export const apiClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Позволяет браузеру автоматически сохранять и передавать куки
});

apiClient.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Перехватываем 401 и обновляем токен через /refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если 401 и это не сам запрос на логин или рефреш
    if (
      error.response?.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url?.includes('/auth/')
    ) {
      originalRequest._retry = true;
      try {
        const { data } = await apiClient.post<{ accessToken: string }>('/api/v1/auth/refresh');
        if (data.accessToken) {
          Cookies.set('accessToken', data.accessToken, { expires: 1, sameSite: 'strict' });
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Если refresh тоже не удался — сбрасываем куку и отправляем логиниться
        Cookies.remove('accessToken');
        window.location.reload();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);