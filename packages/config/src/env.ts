import { z } from 'zod';

const nodeEnvSchema = z.enum(['development', 'test', 'staging', 'production']);

const baseSchema = z.object({
  NODE_ENV: nodeEnvSchema.default('development'),
  APP_BASE_DOMAIN: z.string().min(1),
  WEB_URL: z.string().url(),
  API_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  S3_ENDPOINT: z.string().url(),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  ENABLE_OPENAPI: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
});

const databaseSchema = z.object({
  DATABASE_URL: z.string().url(),
});

const redisSchema = z.object({
  REDIS_URL: z.string().url(),
});

export type ServiceName = 'web' | 'api' | 'worker' | 'prisma';

export type AppConfig = z.infer<typeof baseSchema> &
  Partial<z.infer<typeof databaseSchema> & z.infer<typeof redisSchema>>;

export function loadConfig(service: ServiceName, env: NodeJS.ProcessEnv = process.env): AppConfig {
  let schema: z.ZodTypeAny = baseSchema;

  if (service === 'api' || service === 'worker' || service === 'prisma') {
    schema = schema.and(databaseSchema);
  }

  if (service === 'api' || service === 'worker') {
    schema = schema.and(redisSchema);
  }

  const result = schema.safeParse(env);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid ${service} configuration: ${details}`);
  }

  return result.data as AppConfig;
}
