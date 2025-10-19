import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services'
import { useAuthStore } from '@/store/auth.store'
import { LoginDto, RegisterDto } from '@/types'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const { user, isAuthenticated, setAuth, logout: logoutStore } = useAuthStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const loginMutation = useMutation({
    mutationFn: (data: LoginDto) => authService.login(data),
    onSuccess: (data) => {
      setAuth(data.user, data.access_token)
      navigate('/dashboard')
    },
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterDto) => authService.register(data),
    onSuccess: (data) => {
      setAuth(data.user, data.access_token)
      navigate('/dashboard')
    },
  })

  const logout = () => {
    logoutStore()
    queryClient.clear()
    navigate('/login')
  }

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout,
  }
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => authService.getMe(),
    enabled: useAuthStore.getState().isAuthenticated,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<{ name: string; email: string }>) =>
      authService.updateProfile(data),
    onSuccess: (user) => {
      queryClient.setQueryData(['profile'], user)
      const { setAuth, token } = useAuthStore.getState()
      if (token) {
        setAuth(user, token)
      }
    },
  })
}
