import { ref, computed } from 'vue';
import type { LoginInput, RegisterInput } from '../../shared/schemas/auth.schema';
import type { ApiResponse } from '../../shared/types/api';
import type { AuthUser } from '../../shared/types/auth';
import type { UserRole } from '~~/shared/types/enums/user-role.enum';

export function useAuth() {
  const user = useState<AuthUser | null>('auth_user', () => null);
  const isLoading = useState<boolean>('auth_loading', () => false);
  const error = useState<string | null>('auth_error', () => null);

  const isAuthenticated = computed(() => !!user.value);
  const userRole = computed<UserRole | null>(() => user.value?.role ?? null);

  const isAdmin = computed(() => user.value?.role === 'ADMIN');
  const isLandlord = computed(() => user.value?.role === 'LANDLORD');
  const isTenant = computed(() => user.value?.role === 'TENANT');
  const isTechnician = computed(() => user.value?.role === 'TECHNICIAN');

  async function fetchUser() {
    isLoading.value = true;
    error.value = null;
    try {
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined;
      const response = await $fetch<ApiResponse<{ user: AuthUser }>>('/api/v1/auth/me', {
        headers,
      });
      if (response?.success && response?.data?.user) {
        user.value = response.data.user;
      } else {
        user.value = null;
      }
    } catch {
      user.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  async function login(input: LoginInput) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await $fetch<ApiResponse<{ user: AuthUser }>>('/api/v1/auth/login', {
        method: 'POST',
        body: input,
      });

      if (response.success && response.data?.user) {
        user.value = response.data.user;
        return { success: true, user: response.data.user };
      }
      throw new Error(response.error?.message || 'Login failed');
    } catch (err: unknown) {
      const fetchErr = err as { data?: { error?: { message?: string } }; message?: string };
      const msg = fetchErr.data?.error?.message || fetchErr.message || 'Login failed';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  async function register(input: RegisterInput) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await $fetch<ApiResponse<{ user: AuthUser }>>('/api/v1/auth/register', {
        method: 'POST',
        body: input,
      });

      if (response.success && response.data?.user) {
        user.value = response.data.user;
        return { success: true, user: response.data.user };
      }
      throw new Error(response.error?.message || 'Registration failed');
    } catch (err: unknown) {
      const fetchErr = err as { data?: { error?: { message?: string } }; message?: string };
      const msg = fetchErr.data?.error?.message || fetchErr.message || 'Registration failed';
      error.value = msg;
      return { success: false, error: msg };
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    isLoading.value = true;
    try {
      await $fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      user.value = null;
      isLoading.value = false;
      navigateTo('/login');
    }
  }

  return {
    user,
    isAuthenticated,
    userRole,
    isAdmin,
    isLandlord,
    isTenant,
    isTechnician,
    isLoading,
    error,
    fetchUser,
    login,
    register,
    logout,
  };
}
