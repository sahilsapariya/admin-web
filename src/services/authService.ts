import { apiGet, apiPost, apiPut } from "./api";
import { API_ENDPOINTS } from "@/lib/constants";

export interface TenantChoice {
  id: string;
  name: string;
  subdomain: string;
}

export interface LoginResponse {
  access_token?: string;
  refresh_token?: string;
  tenant_id?: string;
  subdomain?: string;
  user?: {
    id: number;
    email: string;
    name?: string;
    email_verified?: boolean;
    profile_picture_url?: string;
  };
  permissions?: string[];
  enabled_features?: string[];
  requires_tenant_choice?: boolean;
  tenants?: TenantChoice[];
}

export interface MessageResponse {
  message: string;
}

export const login = (data: {
  email: string;
  password: string;
  tenant_id?: string;
  subdomain?: string;
}) => apiPost<LoginResponse>(API_ENDPOINTS.LOGIN, data);

export const logout = () => apiPost<unknown>(API_ENDPOINTS.LOGOUT);

export const forgotPassword = (data: { email: string }) =>
  apiPost<MessageResponse>(API_ENDPOINTS.FORGOT_PASSWORD, data);

export interface ProfileUser {
  id: number;
  email: string;
  name?: string;
  email_verified?: boolean;
  profile_picture_url?: string;
}

export const getProfile = () =>
  apiGet<ProfileUser>(API_ENDPOINTS.PROFILE);

export const updateProfile = (data: { name?: string; profile_picture_url?: string }) =>
  apiPut<ProfileUser>(API_ENDPOINTS.PROFILE, data);
