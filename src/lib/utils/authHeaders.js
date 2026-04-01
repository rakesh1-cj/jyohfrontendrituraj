/**
 * Returns Authorization header only — no Content-Type.
 * Safe to use with both FormData and JSON requests.
 * For JSON requests, add Content-Type: application/json separately.
 */
export const getAuthHeaders = () => {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('authToken') || localStorage.getItem('access_token') || localStorage.getItem('token')
      : null;

  return {
    Authorization: `Bearer ${token || ''}`,
  };
};
