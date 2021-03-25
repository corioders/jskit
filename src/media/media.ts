import { async } from '@/async';

export class Audio {
  audioElement: HTMLAudioElement;
  private rootElement: HTMLElement | false;

  constructor(source: string | HTMLAudioElement, rootElement: HTMLElement | false = window.document.body) {
    if (typeof source == 'string') this.audioElement = new window.Audio(source);
    else this.audioElement = source;

    this.audioElement.onended = (): void => {
      this.audioElement.parentElement?.removeChild(this.audioElement);
    };

    this.rootElement = rootElement;
    this.audioElement.preload = 'auto';
    if (this.rootElement != false) this.rootElement.appendChild(this.audioElement);
  }

  load(): void {
    this.audioElement.load();
  }

  play(): Promise<void> {
    return this.audioElement.play();
  }

  onEnd(): Promise<void> {
    const waiter = new async.PromiseWaiter<void>();

    const oldOnended = this.audioElement.onended;
    this.audioElement.onended = (event): void => {
      oldOnended?.call(this.audioElement, event);
      waiter.resolve();
    };
    return waiter.get();
  }

  clone(): Audio {
    return new Audio(this.audioElement.cloneNode(true) as HTMLAudioElement, this.rootElement);
  }
}
