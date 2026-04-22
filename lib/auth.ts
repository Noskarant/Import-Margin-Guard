import { cookies } from 'next/headers';

const COOKIE_NAME = 'img_user_id';

export async function getSessionUserId() {
  return (await cookies()).get(COOKIE_NAME)?.value;
}

export async function requireUserId() {
  const userId = await getSessionUserId();
  if (!userId) {
    throw new Error('UNAUTHORIZED');
  }
  return userId;
}

export const AUTH_COOKIE = COOKIE_NAME;
