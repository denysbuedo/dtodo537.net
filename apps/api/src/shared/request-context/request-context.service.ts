import { AsyncLocalStorage } from 'node:async_hooks';
import { Injectable } from '@nestjs/common';
import type { RequestContext } from '@dtodo/types';

const storage = new AsyncLocalStorage<RequestContext>();

@Injectable()
export class RequestContextService {
  static run<T>(context: RequestContext, callback: () => T): T {
    return storage.run(context, callback);
  }

  static current(): RequestContext | undefined {
    return storage.getStore();
  }

  get current(): RequestContext | undefined {
    return RequestContextService.current();
  }
}
