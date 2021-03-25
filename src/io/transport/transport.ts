export type transport_CancelFunction = () => void;
export type transport_EndFunction = () => void;

export type transport_WriteFunction<TRequest> = (request: TRequest) => void;

export type transport_Stream<TResponse> = AsyncGenerator<TResponse, never, void>;

export type transport_UnaryFunction<TResponse, TRequest> = (request: TRequest) => transport_Unary<TResponse>;
export interface transport_Unary<TResponse> {
	response: Promise<TResponse>;
	cancel: transport_CancelFunction;
}

export type transport_ServerStreamFunction<TResponse, TRequest> = (request: TRequest) => transport_ServerStream<TResponse>;
export interface transport_ServerStream<TResponse> {
	response: transport_Stream<TResponse>;
	cancel: transport_CancelFunction;
}

export type transport_ClientStreamFunction<TResponse, TRequest> = () => transport_ClientStream<TResponse, TRequest>;
export interface transport_ClientStream<TResponse, TRequest> {
	response: Promise<TResponse>;
	write: transport_WriteFunction<TRequest>;
	end: transport_EndFunction;
	cancel: transport_CancelFunction;
}

export type transport_BidirectionalStreamFunction<TResponse, TRequest> = () => transport_BidirectionalStream<TResponse, TRequest>;
export interface transport_BidirectionalStream<TResponse, TRequest> {
	response: transport_Stream<TResponse>;
	write: transport_WriteFunction<TRequest>;
	end: transport_EndFunction;
	cancel: transport_CancelFunction;
}
