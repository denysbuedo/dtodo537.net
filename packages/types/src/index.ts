export interface RequestContext {
  requestId: string;
}

export type HealthStatus = 'ok' | 'degraded' | 'down';

export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    requestId?: string;
  };
}
