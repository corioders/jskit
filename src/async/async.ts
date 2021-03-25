export type Await<T> = T extends PromiseLike<infer U> ? U : T
type ResolveFunction<T> = (value: T | PromiseLike<T>) => void;
type RejectFunction = (reason?: unknown) => void;

namespace EventBucket {
  export interface Result<T> {
    value: T | null;
    throw: unknown | false;
    done: boolean;
  }
}
export class EventBucket<T> {
  events: AsyncGenerator<T, never, undefined>;
  private nextResolve: ResolveFunction<EventBucket.Result<T>> | null = null;
  private resolveStack: EventBucket.Result<T>[] = [];

  constructor() {
    const eventsGenerator = async function* (this: EventBucket<T>): AsyncGenerator<T, never, never> {
      while (true) {
        const dataPromise: Promise<EventBucket.Result<T>> = new Promise((resolve) => {
          const resolvedValue = this.resolveStack.shift();
          if (resolvedValue) resolve(resolvedValue);
          else this.nextResolve = resolve;
        });

        const data = await dataPromise;
        if (data.throw !== false) throw data.throw;
        if (data.done === true) return undefined as never;

        yield data.value as T;
      }
    };

    this.events = eventsGenerator.call(this);
  }

  private toResolve(data: EventBucket.Result<T>, end = false): void {
    if (this.nextResolve) {
      this.nextResolve(data);
      this.nextResolve = null;
    } else {
      if (end) {
        // end as soon as possible
        this.resolveStack.unshift(data);
      } else {
        this.resolveStack.push(data);
      }
    }
  }

  push(event: T): void {
    this.toResolve({ value: event, done: false, throw: false });
  }

  throw(reason: unknown): void {
    this.toResolve({ value: null, done: true, throw: reason });
  }

  done(): void {
    this.toResolve({ value: null, done: true, throw: false });
  }

  // end is very similar to done but it end's ass soon as possible, not waiting for consumer to finish consuming
  end(): void {
    this.toResolve({ value: null, done: true, throw: false }, true);
  }
}

export class PromiseWaiter<T> {
  private resolveFn: ResolveFunction<T>;
  private rejectFn: RejectFunction;
  private promise: Promise<T>;
  private resetOnGet: boolean;
  constructor(resetOnGet: boolean = false) {
    this.resetOnGet = resetOnGet;
    this.reset();
  }

  async get(): Promise<T> {
    const result = await this.promise;
    if (this.resetOnGet) this.reset();
    return result;
  }

  resolve(value: T | PromiseLike<T>): void {
    this.resolveFn(value);
  }

  reject(reason?: unknown): void {
    this.rejectFn(reason);
  }

  reset(): void {
    this.promise = new Promise((resolve, reject) => {
      this.resolveFn = resolve;
      this.rejectFn = reject;
    });
  }
}
