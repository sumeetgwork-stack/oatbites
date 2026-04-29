import { findUserByEmail } from './db';

export function isAdmin(email) {
  if (!email) return false;
  return email === process.env.ADMIN_EMAIL;
}

export async function getUserRole(email) {
  const user = await findUserByEmail(email);
  return user?.role || 'user';
}
