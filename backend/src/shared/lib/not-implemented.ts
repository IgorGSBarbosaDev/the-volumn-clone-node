import { ApiError } from '../http/api-error.js'

export function notImplemented(feature: string): never {
  throw new ApiError(501, 'NOT_IMPLEMENTED', `${feature} is scaffolded but not implemented yet`)
}
