import { AsyncLocalStorage } from "node:async_hooks";

export class Namespaced {
  store: AsyncLocalStorage<Map<string, any>>;
  constructor() {
    this.store = new AsyncLocalStorage<Map<string, any>>();
  }
  getStore() {
    return this.store;
  }
  get<T = any>(key?: string) {
    if (!key) {
      return this.store.getStore() as T;
    }
    return this.store.getStore()?.get(key) as T;
  }
  set<T = any>(key: string, value: T) {
    return this.store.getStore()?.set(key, value);
  }

  run(callback: (val: Map<string, any>) => void | Promise<void>): Map<string, any> | Promise<Map<string, any>> {
    const currentMap = this.store.getStore();
    const newMap = new Map<string, any>(currentMap);
    return this.store.run(newMap, async () => {
      await callback(newMap)
      return newMap;
    });
  }
  runAndReturn<T = any, T1 = T>(callback: (val: Map<string, any>) => T1): T1 extends Promise<T> ? Promise<T> : T {
    const currentMap = this.store.getStore();
    const newMap = new Map<string, any>(currentMap);
    // not sure why as any is needed here
    // but it is needed to make the types work
    return this.store.run<T1,  any[]>(newMap, callback, newMap) as any;
  }
  bind(callback: () => any) {
    return AsyncLocalStorage.bind(callback);
  }
  snapshot() {
    return AsyncLocalStorage.snapshot();
  }
  disable() {
    return this.store.disable();
  }
  entersWith(map: Map<string, any>) {
    return this.store.enterWith(map);
  }
  exit(fn: () => void | Promise<void>, args: []) {
    return this.store.exit(() => fn.apply(undefined, args));
  }
}

const storage: Record<string, Namespaced> = {};

export function createNamespace(name: string) {
  if (storage[name]) {
    throw new Error(`Namespace ${name} already exists`);
  }
  storage[name] = new Namespaced();
  return storage[name];
}

export function destroyNamespace(name: string) {
  if (!storage[name]) {
    throw new Error(`Namespace ${name} does not exist`);
  }
  delete storage[name];
}

export function getNamespace(name: string) {
  if (!storage[name]) {
    throw new Error(`Namespace ${name} does not exist`);
  }
  return storage[name];
}

export function getAllNS() {
  return storage;
}