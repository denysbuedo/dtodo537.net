import { loadConfig } from '@dtodo/config';

export function loadRuntimeConfig() {
  return loadConfig('api');
}
