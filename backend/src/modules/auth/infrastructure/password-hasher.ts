import bcrypt from 'bcryptjs'
import { PASSWORD_HASH_ROUNDS } from '../domain/auth.constants.js'

export async function hashPassword(password: string) {
  return bcrypt.hash(password, PASSWORD_HASH_ROUNDS)
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash)
}
