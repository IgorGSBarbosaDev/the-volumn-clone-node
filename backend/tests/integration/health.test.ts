import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createTestApp } from '../helpers/create-test-app.js'

describe('GET /health', () => {
  it('returns the backend health payload', async () => {
    const response = await request(createTestApp()).get('/health')

    expect(response.status).toBe(200)
    expect(response.body.status).toBe('ok')
    expect(response.body.service).toBe('the-volumn-api')
    expect(typeof response.body.time).toBe('string')
  })
})
