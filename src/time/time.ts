export type Duration = number;
export const millisecond: Duration = 1;
export const second: Duration = 1000 * millisecond;
export const minute: Duration = 60 * second;
export const hour: Duration = 60 * minute;

export function sleep(time: Duration): Promise<void> {
	return new Promise((res) => setTimeout(res, time));
}

export class Ticker {
	public c: AsyncGenerator<void, void, void>;

	private end = false;
	private inReset = false;
	private interval: Duration;

	constructor(interval: Duration) {
		this.interval = interval;

		const tickGenerator = async function* (this: Ticker): AsyncGenerator<void, void, void> {
			while (!this.end) {
				await sleep(this.interval);
				if (this.end) return;
				else {
					if (this.inReset) {
						this.inReset = false;
						continue;
					}
					yield;
				}
			}
		};

		this.c = tickGenerator.apply(this);
	}

	stop(): void {
		this.end = true;
	}
	reset(newInterval: Duration): void {
		this.inReset = true;
		this.interval = newInterval;
	}
}

export class TickerNumber {
	private ticker;
	public c: AsyncGenerator<void, void, void>;

	constructor(timePerTick: Duration, numberOfTicks: number) {
		this.ticker = new Ticker(this.calculateInterval(timePerTick, numberOfTicks));
		this.c = this.ticker.c;
	}

	reset(timePerTick: Duration, numberOfTicks: number): void {
		this.ticker.reset(this.calculateInterval(timePerTick, numberOfTicks));
	}

	stop(): void {
		this.ticker.stop();
	}

	private calculateInterval(timePerTick: Duration, numberOfTicks: number): Duration {
		return timePerTick / numberOfTicks;
	}
}
