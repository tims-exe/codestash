export interface User {
    id: string
    username: string
    created_at: string
    updated_at: string
}

export interface UserWithPassword extends User {
    password_hash: string
}

export interface CreateUserData {
    username: string
    password: string
}

export interface LoginData {
    username: string
    password: string
}

export interface AuthResult {
    success: boolean
    user?: User
    error?: string
}

export interface FormData {
    username: string
    password: string
}