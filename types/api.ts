export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    nombre: string;
    role: 'admin' | 'user';
  };
  token?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  role?: 'admin' | 'user';
}

export interface UploadXMLRequest {
  empresa_id: string;
  xml: File;
  pdf?: File;
}

export interface UploadXMLResponse {
  id: string;
  message: string;
  invoice: any;
}

export interface DashboardStatsResponse {
  total_deuda_pendiente: number;
  facturas_pendientes: number;
  facturas_pagadas_mes: number;
  proximos_vencimientos: number;
  tendencia_deuda: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  fecha?: string;
  [key: string]: any;
}
