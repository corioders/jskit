import * as io from './io';
import { CancelFunction, EndFunction, WriteFunction, Stream, Unary, ServerStream, ClientStream, BidirectionalStream } from './io';

type io_CancelFunction = CancelFunction;
type io_EndFunction = EndFunction;
type io_WriteFunction<TRequest> = WriteFunction<TRequest>;
type io_Stream<TResponse> = Stream<TResponse>;

type io_Unary<TResponse> = Unary<TResponse>;
type io_ServerStream<TResponse> = ServerStream<TResponse>;
type io_ClientStream<TResponse, TRequest> = ClientStream<TResponse, TRequest>;
type io_BidirectionalStream<TResponse, TRequest> = BidirectionalStream<TResponse, TRequest>;

export { io_CancelFunction, io_EndFunction, io_WriteFunction, io_Stream, io_Unary, io_ServerStream, io_ClientStream, io_BidirectionalStream };

export { io };