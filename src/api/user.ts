import { apiClient } from './client';

export interface UserProfileResponse {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roles: string[];
  createdAt: string;
}

export type OrderStatus =
  | 'CREATED'
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'CANCELLED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'REFUND_FAILED'
  | 'PARTIALLY_REFUNDED'
  | 'EXPIRED'
  | 'TERMINATED';

export interface GetOrdersParams {
  statuses?: OrderStatus[];
  page?: number;
  size?: number;
  sort?: string[];
}

// Получение профиля
export const getMyProfile = async (): Promise<UserProfileResponse> => {
  const response = await apiClient.get<UserProfileResponse>('/api/v1/users/me');
  return response.data;
};

// Получение активных билетов
export const getMyActiveTickets = async (): Promise<any[]> => {
  const response = await apiClient.get<any[]>('/api/v1/users/me/tickets/active');
  return response.data;
};

// Получение истории заказов
export const getMyOrders = async (params?: GetOrdersParams): Promise<any> => {
  // Список всех возможных статусов по умолчанию
  const allStatuses: OrderStatus[] = [
    'CREATED',
    'PENDING_PAYMENT',
    'PAID',
    'CANCELLED',
    'REFUND_PENDING',
    'REFUNDED',
    'REFUND_FAILED',
    'PARTIALLY_REFUNDED',
    'EXPIRED',
    'TERMINATED',
  ];

  const response = await apiClient.get('/api/v1/users/me/orders', {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      statuses: params?.statuses && params.statuses.length > 0 ? params.statuses : allStatuses,
      sort: params?.sort,
    },
    // Важно: сериализация массива query-параметров в виде ?statuses=A&statuses=B
    paramsSerializer: {
      indexes: null,
    },
  });

  return response.data;
};