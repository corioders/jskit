export type CancelFunction = () => void;
export type EndFunction = () => void;

export type WriteFunction<TRequest> = (data: TRequest) => void;

export type Stream<TResponse> = AsyncGenerator<TResponse, void, void>;

export interface Unary<TResponse> {
	response: Promise<TResponse>;
	cancel: CancelFunction;
}

export interface ServerStream<TResponse> {
	response: Stream<TResponse>;
	cancel: CancelFunction;
}

export interface ClientStream<TResponse, TRequest> {
	response: Promise<TResponse>;
	write: WriteFunction<TRequest>;
	end: EndFunction;
	cancel: CancelFunction;
}

export interface BidirectionalStream<TResponse, TRequest> {
	response: Stream<TResponse>;
	write: WriteFunction<TRequest>;
	end: EndFunction;
	cancel: CancelFunction;
}
