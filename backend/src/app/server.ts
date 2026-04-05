import { createApp } from './create-app.js'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'

const app = createApp()

app.listen(env.PORT, () => {
  logger.info(`The Volumn API listening on port ${env.PORT}`)
})
