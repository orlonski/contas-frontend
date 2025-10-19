import { api } from '@/lib/axios'
import { AuthResponse, LoginDto, RegisterDto, User } from '@/types'

export const authService = {
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/users/me')
    return response.data
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch<User>('/users/me', data)
    return response.data
  },

  async deleteAccount(): Promise<void> {
    await api.delete('/users/me')
  },
}
