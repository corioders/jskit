/* eslint-disable */
import { grpc as grpcWeb } from '@improbable-eng/grpc-web';
import { async } from '@/async';
import {
  transport_UnaryFunction,
  transport_Unary,
  transport_ServerStreamFunction,
  transport_ServerStream,
  transport_ClientStreamFunction,
  transport_ClientStream,
  transport_BidirectionalStreamFunction,
  transport_BidirectionalStream,
} from '@/io/transport';
import { strings } from '@/strings';

class dummy {}
export interface grpc_MethodDescriptor {
  methodName: string;
  requestStream: boolean;
  responseStream: boolean;
  requestType: typeof dummy;
  responseType: typeof dummy;
}

class serviceDescriptor1 {
  [key: string]: grpc_MethodDescriptor;
}

type serviceDescriptor2 = { serviceName: string };
export type grpc_ServiceDescriptor = serviceDescriptor1 & serviceDescriptor2;

export interface status {
  code: grpcWeb.Code;
  message: string;
}

class _ServiceClient {
  readonly host: string;

  constructor(service: serviceDescriptor2, host: string) {
    this.host = host;

    const serviceDescriptor = (service as unknown) as grpc_ServiceDescriptor;
    for (const key in serviceDescriptor) {
      const methodDescriptor = serviceDescriptor[key];
      if (typeof methodDescriptor !== 'object') continue;

      Object.defineProperty(this, strings.Uncapitalize(key), { value: getMethod.call(this, methodDescriptor) });
    }
  }
}

function getMethod<T extends grpc_MethodDescriptor>(
  this: _ServiceClient,
  methodDescriptor: T,
):
  | transport_UnaryFunction<T['responseType'] | null, T['requestType']>
  | transport_ServerStreamFunction<T['responseType'], T['requestType']>
  | transport_ClientStreamFunction<T['responseType'] | null, T['requestType']>
  | transport_BidirectionalStreamFunction<T['responseType'], T['requestType']>
  | void {
  type TResponse = T['responseType'];
  type TRequest = T['requestType'];

  // unary
  if (methodDescriptor.responseStream === false && methodDescriptor.requestStream === false) {
    return (request: TRequest): transport_Unary<TResponse | null> => {
      const promiseWaiter = new async.PromiseWaiter<TResponse | null>(false);

      // @ts-ignore
      const client = grpcWeb.unary(methodDescriptor, {
        host: this.host,
        request: request,
        onEnd: (response) => {
          if (response.status !== grpcWeb.Code.OK) {
            const error = new Error(response.statusMessage) as any;
            error.code = response.status;
            promiseWaiter.reject(error);
            return;
          }

          promiseWaiter.resolve(response.message as any);
        },
      });

      return {
        cancel: () => {
          client.close();
          promiseWaiter.resolve(null);
        },
        response: promiseWaiter.get(),
      };
    };
  }

  // server stream
  if (methodDescriptor.responseStream === true && methodDescriptor.requestStream === false) {
    return (request: TRequest): transport_ServerStream<TResponse> => {
      const eventBucket = new async.EventBucket<TResponse>();

      // @ts-ignore
      const client = grpcWeb.invoke(methodDescriptor, {
        host: this.host,
        request: request,
        // server stream works as stream only with websocket
        transport: grpcWeb.WebsocketTransport(),
        onMessage: (response) => {
          eventBucket.push(response as any);
        },
        onEnd: (status, statusMessage) => {
          if (status !== grpcWeb.Code.OK) {
            eventBucket.throw({ code: status, message: statusMessage });
          } else {
            eventBucket.done();
          }
        },
      });

      return {
        cancel: () => {
          client.close();
          eventBucket.done();
        },
        response: eventBucket.events,
      };
    };
  }

  // client stream
  if (methodDescriptor.responseStream === false && methodDescriptor.requestStream === true) {
    return (request: TRequest): transport_ClientStream<TResponse | null, TRequest> => {
      const promiseWaiter = new async.PromiseWaiter<TResponse | null>();
      let started = false;
      let finished = false;
      let canceled = false;

      // @ts-ignore
      const client = grpcWeb.client(methodDescriptor, {
        host: this.host,
        request: request,
        // client stream works only with WebsocketTransport
        transport: grpcWeb.WebsocketTransport(),
      });

      client.onMessage((response) => {
        promiseWaiter.resolve(response as any);
      });
      client.onEnd((status, statusMessage) => {
        finished = true;
        if (status !== grpcWeb.Code.OK) {
          promiseWaiter.reject({ code: status, message: statusMessage });
        }
      });

      return {
        cancel: () => {
          if (canceled === false) {
            canceled = true;
            finished = true;
            client.close();
            promiseWaiter.resolve(null);
          }
        },
        end: () => {
          if (finished === false) {
            finished = true;
            client.finishSend();
          }
        },
        write: (request: TRequest) => {
          if (finished === true) return;
          if (started === false) {
            client.start();
            started = true;
          }
          client.send(request as any);
        },
        response: promiseWaiter.get(),
      };
    };
  }

  // bidirectional stream
  if (methodDescriptor.responseStream && methodDescriptor.requestStream) {
    return (request: TRequest): transport_BidirectionalStream<TResponse, TRequest> => {
      const eventBucket = new async.EventBucket<TResponse>();
      let started = false;
      let finished = false;
      let canceled = false;

      // @ts-ignore
      const client = grpcWeb.client(methodDescriptor, {
        host: this.host,
        request: request,
        // bidirectional stream works only with WebsocketTransport
        transport: grpcWeb.WebsocketTransport(),
      });

      client.onMessage((response) => {
        eventBucket.push(response as any);
      });
      client.onEnd((status, statusMessage) => {
        finished = true;
        if (status !== grpcWeb.Code.OK) {
          eventBucket.throw({ code: status, message: statusMessage });
        } else {
          eventBucket.done();
        }
      });

      return {
        cancel: () => {
          if (canceled === false) {
            canceled = true;
            finished = true;
            client.close();
            eventBucket.done();
          }
        },
        end: () => {
          if (finished === false) {
            finished = true;
            client.finishSend();
          }
        },
        write: (request: TRequest) => {
          if (finished === true) return;
          if (started === false) {
            started = true;
            client.start();
          }
          client.send(request as any);
        },
        response: eventBucket.events,
      };
    };
  }
}

export const ServiceClient = _ServiceClient as {
  new <T extends serviceDescriptor2>(service: T, host: string): _ServiceClient & filleterMethods<T>;
};

type filleterMethods<T> = {
  // second assertion is needed as TS compiler won't change the type of T[Key] to grpc_MethodDescriptor       |\ this is the second assertion
  [Key in keyof T as T[Key] extends grpc_MethodDescriptor ? (Key extends string ? Uncapitalize<Key> : never) : never]: T[Key] extends grpc_MethodDescriptor
    ? getMethodType<T[Key]>
    : never;
};

type getMethodType<T extends grpc_MethodDescriptor> = isUnary<T> extends true
  ? transport_UnaryFunction<T['responseType']['prototype'] | null, T['requestType']['prototype']>
  : isServerStream<T> extends true
  ? transport_ServerStreamFunction<T['responseType']['prototype'], T['requestType']['prototype']>
  : isClientStream<T> extends true
  ? transport_ClientStreamFunction<T['responseType']['prototype'] | null, T['requestType']['prototype']>
  : isBidirectionalStream<T> extends true
  ? transport_BidirectionalStreamFunction<T['responseType']['prototype'], T['requestType']['prototype']>
  : never;

type isUnary<T extends grpc_MethodDescriptor> = T['responseStream'] extends true ? false : T['requestStream'] extends true ? false : true;
type isServerStream<T extends grpc_MethodDescriptor> = T['responseStream'] extends false ? false : T['requestStream'] extends true ? false : true;
type isClientStream<T extends grpc_MethodDescriptor> = T['responseStream'] extends true ? false : T['requestStream'] extends false ? false : true;
type isBidirectionalStream<T extends grpc_MethodDescriptor> = T['responseStream'] extends false ? false : T['requestStream'] extends false ? false : true;
