export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, fetchUser } = useAuth();

  if (!isAuthenticated.value) {
    await fetchUser();
  }

  if (!isAuthenticated.value && to.path.startsWith('/dashboard')) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    });
  }
});
