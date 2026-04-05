import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'
import { errorMiddleware, notFoundMiddleware } from '../shared/http/middleware.js'
import { registerRoutes } from './register-routes.js'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  )
  app.use(express.json())
  app.use(cookieParser())
  app.use((request, _response, next) => {
    logger.debug({ method: request.method, path: request.path }, 'incoming request')
    next()
  })

  registerRoutes(app)

  app.use(notFoundMiddleware)
  app.use(errorMiddleware)

  return app
}
