// User roles in the system
export type Role = 'SUPERADMIN' | 'OWNER' | 'ADMIN' | 'MANAGER' | 'SELLER';

// User status type - accept both uppercase and lowercase
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'active' | 'inactive';

// User interface
export interface User {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
    avatar?: string;
    role: Role;
    status?: UserStatus;
    marketId?: string;
    createdAt: string;
    updatedAt: string;
}

// Auth state interface
export interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

// Login/Register request
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
    confirmPassword?: string;
}

export interface SendOtpRequest {
    email: string;
}

export interface VerifyOtpRequest {
    email: string;
    otp: string;
    otpToken: string;
}

export interface RegisterWithOtpRequest {
    emailToken: string;
    fullName: string;
    password: string;
}

// API Response
export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken?: string;
}

export interface OtpResponse {
    otpToken: string;
    message: string;
}

export interface EmailTokenResponse {
    resetToken: string;
    message: string;
}

// Forgot Password Types
export interface ForgotPasswordRequest {
    email: string;
    purpose: 'reset_password';
}

export interface ResendOtpRequest {
    email: string;
    purpose: 'reset_password';
}

export interface ResetPasswordRequest {
    resetToken: string;
    newPassword: string;
}
