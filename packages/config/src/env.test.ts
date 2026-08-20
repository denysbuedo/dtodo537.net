import { describe, expect, it } from 'vitest';
import { loadConfig } from './env.js';

const validEnv = {
  NODE_ENV: 'test',
  APP_BASE_DOMAIN: 'dtodo537.net',
  WEB_URL: 'http://localhost:3000',
  API_URL: 'http://localhost:3001/api/v1',
  SESSION_SECRET: 'a-valid-test-secret-with-more-than-32-chars',
  S3_ENDPOINT: 'http://localhost:9000',
  S3_BUCKET: 'dtodo-test',
  S3_ACCESS_KEY: 'test-access-key',
  S3_SECRET_KEY: 'test-secret-key',
  ENABLE_OPENAPI: 'true',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  REDIS_URL: 'redis://localhost:6379',
};

describe('loadConfig', () => {
  it('validates api configuration', () => {
    expect(loadConfig('api', validEnv)).toMatchObject({
      NODE_ENV: 'test',
      ENABLE_OPENAPI: true,
      DATABASE_URL: validEnv.DATABASE_URL,
      REDIS_URL: validEnv.REDIS_URL,
    });
  });

  it('fails clearly when service variables are missing', () => {
    const env: Partial<typeof validEnv> = { ...validEnv };
    delete env.REDIS_URL;

    expect(() => loadConfig('api', env)).toThrow('Invalid api configuration');
  });
});
