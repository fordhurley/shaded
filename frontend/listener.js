export class Listener {
  constructor() {
    this.handlers = {};
  }

  addEventListener(name, callback) {
    this.getEventListeners(name).push(callback);
  }

  getEventListeners(name) {
    let handlers = this.handlers[name];
    if (!handlers) {
      handlers = [];
    }
    this.handlers[name] = handlers;
    return handlers;
  }

  forEachHandler(name, callback) {
    this.getEventListeners(name).forEach(callback);
  }
}
