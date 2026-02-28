export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  google_id?: string | null;
  auth_provider: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  auth_provider?: string;
  created_at: Date;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  category_id: number;
  category_name?: string;
  price: number;
  image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface OtpCode {
  id: number;
  user_id: number;
  otp: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface JwtPayload {
  userId: number;
  email: string;
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
