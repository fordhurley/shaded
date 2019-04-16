import { Listener } from "../listener";

export class WebSocketWatcher {
  private path: string;
  private url: string;
  private listener: Listener;
  private reconnectTimeout?: number;
  private ws!: WebSocket;

  constructor(path: string) {
    this.path = path;

    this.url = "ws:";
    if (window.location.protocol === "https:") {
      this.url = "wss:";
    }
    this.url += "//" + window.location.host;

    this.listener = new Listener();

    this.onConnect(() => {
      this.sendWatch(this.path);
    });
    this.onDisconnect(() => {
      this.scheduleReconnect();
    });

    this.reconnect = this.reconnect.bind(this);
    this.reconnect();
  }

  handleMessage(msg: any) {
    switch (msg.command) {
      case "changed":
        if (msg.path !== this.path) {
          return;
        }
        this.listener.emit("changed", msg.path);
        break;
      default:
        console.warn("unknown command:", msg.command);
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimeout !== undefined) {
      window.clearTimeout(this.reconnectTimeout);
    }
    // TODO: back off
    this.reconnectTimeout = window.setTimeout(this.reconnect, 10 * 1000);
  }

  reconnect() {
    if (this.reconnectTimeout !== undefined) {
      window.clearTimeout(this.reconnectTimeout);
    }

    this.ws = new WebSocket(this.url);
    this.ws.onopen = event => {
      this.listener.emit("connect");
    };
    this.ws.onclose = event => {
      this.listener.emit("disconnect");
    };
    this.ws.onmessage = event => {
      this.handleMessage(JSON.parse(event.data));
    };
  }

  sendWatch(path: string) {
    this.ws.send(
      JSON.stringify({
        command: "watch",
        path
      })
    );
  }

  onChanged(callback: (path: string) => void) {
    this.listener.addEventListener("changed", callback);
  }

  onConnect(callback: () => void) {
    this.listener.addEventListener("connect", callback);
  }

  onDisconnect(callback: () => void) {
    this.listener.addEventListener("disconnect", callback);
  }
}
