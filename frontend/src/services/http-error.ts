import axios from 'axios'

export function getErrorMessage(error: unknown, fallback = 'Something went wrong') {
  if (axios.isAxiosError<{ error?: { message?: string } }>(error)) {
    return error.response?.data?.error?.message ?? fallback
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}
