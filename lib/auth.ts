// lib/auth.ts
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-change-in-production'
);
const TOKEN_NAME = 'auth-token';

export interface UserPayload {
  id: string;
  email: string;
  nombre: string;
  role: 'admin' | 'user';
}

/**
 * Hashea una contraseña usando bcrypt
 * @param password - Contraseña en texto plano
 * @returns Promise<string> - Hash de la contraseña
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verifica una contraseña contra su hash
 * @param password - Contraseña en texto plano
 * @param hashedPassword - Hash almacenado
 * @returns Promise<boolean> - true si la contraseña coincide
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Crea un JWT token con el payload del usuario
 * @param payload - Datos del usuario para incluir en el token
 * @returns Promise<string> - Token JWT firmado
 */
export async function createToken(payload: UserPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRATION || '7d')
    .sign(JWT_SECRET);
}

/**
 * Verifica y decodifica un JWT token
 * @param token - Token JWT a verificar
 * @returns Promise<UserPayload | null> - Payload del usuario o null si es inválido
 */
export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserPayload;
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
}

/**
 * Establece la cookie de autenticación
 * @param token - Token JWT a almacenar
 */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: '/',
  });
}

/**
 * Elimina la cookie de autenticación
 */
export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

/**
 * Obtiene el usuario actualmente autenticado
 * @returns Promise<UserPayload | null> - Usuario actual o null si no está autenticado
 */
export async function getCurrentUser(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;

  if (!token) return null;

  return verifyToken(token);
}

/**
 * Middleware para verificar autenticación
 * @returns Promise<UserPayload> - Usuario autenticado o lanza error
 */
export async function requireAuth(): Promise<UserPayload> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('No autorizado');
  }

  return user;
}

/**
 * Middleware para verificar rol de administrador
 * @returns Promise<UserPayload> - Usuario administrador o lanza error
 */
export async function requireAdmin(): Promise<UserPayload> {
  const user = await requireAuth();

  if (user.role !== 'admin') {
    throw new Error('Permisos insuficientes');
  }

  return user;
}
