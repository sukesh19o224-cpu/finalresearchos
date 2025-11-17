import { hash, compare } from 'bcrypt'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'default-secret-change-in-production'
)

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await compare(password, hashedPassword)
}

export async function createToken(userId: string): Promise<string> {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<string> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload.userId as string
  } catch {
    throw new Error('Invalid token')
  }
}

export async function setAuthCookie(userId: string) {
  const token = await createToken(userId)
  cookies().set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
}

export async function clearAuthCookie() {
  cookies().delete('auth_token')
}

export async function getCurrentUser() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) {
    return null
  }

  try {
    const userId = await verifyToken(token)
    return userId
  } catch {
    return null
  }
}

export async function requireAuth() {
  const userId = await getCurrentUser()
  if (!userId) {
    throw new Error('Unauthorized')
  }
  return userId
}
