type Callback = (...args: any[]) => void;
interface CallbackMap {
  [key: string]: Callback[];
}

export class Listener {
  private handlers: CallbackMap = {};

  addEventListener(name: string, callback: Callback) {
    this.getEventListeners(name).push(callback);
  }

  private getEventListeners(name: string) {
    let handlers = this.handlers[name];
    if (!handlers) {
      handlers = [];
    }
    this.handlers[name] = handlers;
    return handlers;
  }

  emit(name: string, ...args: any[]) {
    this.getEventListeners(name).forEach(callback => {
      callback(...args);
    });
  }
}
