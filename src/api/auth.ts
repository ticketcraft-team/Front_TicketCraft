import { apiClient } from './client';
import Cookies from 'js-cookie';

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  [key: string]: unknown;
}

export const registerUser = async (data: RegisterPayload) => {
  const response = await apiClient.post('/api/v1/auth/register', data);
  return response.data;
};

export const loginUser = async (data: LoginPayload): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', data);
  
  if (response.data?.accessToken) {
    // Сохраняем accessToken в cookie (например, на 1 день)
    Cookies.set('accessToken', response.data.accessToken, { 
      expires: 1, 
      sameSite: 'strict' 
    });
  }

  return response.data;
};

export const logoutUser = async () => {
  try {
    // Вызываем бэкенд для очистки refreshToken куки
    await apiClient.post('/api/v1/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Удаляем accessToken с фронтенда
    Cookies.remove('accessToken');
  }
};

// Ответ со статусом сообщения
export interface MessageResponse {
  message: string;
}

// 1. Подтверждение почты (GET /api/v1/auth/verify?token=...)
export const verifyEmail = async (token: string): Promise<MessageResponse> => {
  const response = await apiClient.get<MessageResponse>('/api/v1/auth/verify', {
    params: { token },
  });
  return response.data;
};

// 2. Повторная отправка письма (POST /api/v1/auth/resend-verification)
export const resendVerificationEmail = async (email: string): Promise<MessageResponse> => {
  const response = await apiClient.post<MessageResponse>('/api/v1/auth/resend-verification', {
    email,
  });
  return response.data;
};

