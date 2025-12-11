import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: {
    username: string;
    email: string;
    password: string;
    phone?: string;
  }) => api.post('/auth/register', userData),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  uploadAvatar: (avatar: string) => api.post('/users/avatar', { avatar }),
  refreshToken: (token: string) => api.post('/auth/refresh', { token }),
};

// 邮票API
export const stampAPI = {
  getStamps: (params?: any) => api.get('/stamps', { params }),
  getStampById: (id: string) => api.get(`/stamps/${id}`),
  createStamp: (data: any) => api.post('/stamps', data),
  updateStamp: (id: string, data: any) => api.put(`/stamps/${id}`, data),
  deleteStamp: (id: string) => api.delete(`/stamps/${id}`),
  getCategories: () => api.get('/stamps/categories/list'),
};

// AI鉴定API
export const aiAPI = {
  authenticate: (formData: FormData) => 
    api.post('/ai/authenticate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  getAuthentications: (params?: any) => api.get('/ai/authentications', { params }),
  getAuthenticationById: (id: string) => api.get(`/ai/authentications/${id}`),
  reviewAuthentication: (id: string, data: any) => 
    api.post(`/ai/authentications/${id}/review`, data),
};

// 文件上传API
export const uploadAPI = {
  uploadImage: (formData: FormData) =>
    api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  uploadImages: (formData: FormData) =>
    api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  deleteFile: (filename: string) => api.delete(`/upload/file/${filename}`),
};

export default api;