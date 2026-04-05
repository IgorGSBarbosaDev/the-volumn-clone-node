import type { Request } from 'express'
import { type ZodType } from 'zod'

export function parseBody<T>(request: Request, schema: ZodType<T>) {
  return schema.parse(request.body)
}

export function parseQuery<T>(request: Request, schema: ZodType<T>) {
  return schema.parse(request.query)
}
