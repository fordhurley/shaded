import { breadcrumbs } from "../breadcrumbs";
import { Listener } from "../listener";

export class Controls {
  public domElement: HTMLElement;

  private listener: Listener;

  private frames: number;
  private lastTimestamp: number;

  private resolution: HTMLElement;
  private framerate: HTMLElement;
  private connStatus: HTMLElement;
  private reconnect: HTMLAnchorElement;
  private errors: HTMLElement;

  constructor(path: string) {
    this.listener = new Listener();

    this.domElement = document.createElement("div");

    this.domElement.appendChild(breadcrumbs(path));

    this.resolution = document.createElement("div");
    this.domElement.appendChild(this.resolution);

    this.framerate = document.createElement("div");
    this.domElement.appendChild(this.framerate);
    this.setFramerate(0);
    this.frames = 0;
    this.lastTimestamp = performance.now();

    const connection = document.createElement("div");
    this.domElement.appendChild(connection);

    this.connStatus = document.createElement("span");
    connection.appendChild(this.connStatus);

    this.reconnect = document.createElement("a");
    this.reconnect.href = "#";
    this.reconnect.textContent = "reconnect";
    this.reconnect.style.marginLeft = "0.5em";
    this.reconnect.onclick = this.handleReconnect.bind(this);
    connection.appendChild(this.reconnect);

    this.setDisconnected();

    this.errors = document.createElement("div");
    this.errors.style.color = "red";
    this.domElement.appendChild(this.errors);

    this.animate = this.animate.bind(this);
    window.requestAnimationFrame(this.animate);
  }

  reportFrame() {
    this.frames++;
  }

  setResolution([width, height]: [number, number]) {
    this.resolution.textContent = `${width}×${height}`;
  }

  private animate(timestamp: number) {
    window.requestAnimationFrame(this.animate);
    if (timestamp - this.lastTimestamp < 500) {
      return;
    }
    const deltaSeconds = (timestamp - this.lastTimestamp) / 1000;
    this.setFramerate(this.frames / deltaSeconds);
    this.frames = 0;
    this.lastTimestamp = timestamp;
  }

  setFramerate(fps: number) {
    this.framerate.textContent = `${fps.toFixed(2)} fps`;
  }

  setConnected() {
    this.connStatus.textContent = "connected";
    this.reconnect.style.display = "none";
  }

  setDisconnected() {
    this.connStatus.textContent = "disconnected";
    this.reconnect.style.display = "inline";
  }

  private handleReconnect(e: MouseEvent) {
    e.preventDefault();
    this.listener.emit("reconnect");
  }

  onReconnect(callback: () => void) {
    this.listener.addEventListener("reconnect", callback);
  }

  clearErrors() {
    while (this.errors.hasChildNodes()) {
      this.errors.removeChild(this.errors.lastChild!);
    }
  }

  addError(error: string) {
    const errorEl = document.createElement("div");
    errorEl.textContent = error;
    this.errors.appendChild(errorEl);
  }
}
