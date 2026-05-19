export const ADMIN_USERNAME = 'ADMIN';
export const ADMIN_PASSWORD = '1234554321';

export function isValidAdminCredential(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

export function isValidStoredAdminAuth(stored: string | null): boolean {
  if (!stored) return false;
  try {
    const decoded = atob(stored);
    const [username, password] = decoded.split(':');
    return isValidAdminCredential(username, password);
  } catch {
    return false;
  }
}
