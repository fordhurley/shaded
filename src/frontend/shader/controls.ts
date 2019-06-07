import { breadcrumbs } from "../breadcrumbs";
import { Listener } from "../listener";

export class Controls {
  public domElement: HTMLElement;

  private listener: Listener;

  private frames: number;
  private lastTimestamp: number;
  private lastUpdated?: Date;

  private resolution: HTMLElement;
  private framerate: HTMLElement;
  private updated: HTMLElement;
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

    this.updated = document.createElement("div");
    this.domElement.appendChild(this.updated);

    this.connStatus = document.createElement("div");
    this.domElement.appendChild(this.connStatus);

    const disconnected = document.createElement("span");
    disconnected.textContent = "disconnected";
    this.connStatus.appendChild(disconnected);

    this.reconnect = document.createElement("a");
    this.reconnect.href = "#";
    this.reconnect.textContent = "reconnect";
    this.reconnect.style.marginLeft = "0.5em";
    this.reconnect.onclick = this.handleReconnect.bind(this);
    this.connStatus.appendChild(this.reconnect);

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
    const deltaSeconds = (timestamp - this.lastTimestamp) / 1000;
    if (deltaSeconds < 0.5) {
      return;
    }

    this.setFramerate(this.frames / deltaSeconds);
    this.frames = 0;
    this.lastTimestamp = timestamp;

    if (this.lastUpdated) {
      this.updated.textContent = `updated ${formatDateAgo(this.lastUpdated)}`;
    }
  }

  setFramerate(fps: number) {
    this.framerate.textContent = `${fps.toFixed(2)} fps`;
  }

  setUpdated() {
    this.lastUpdated = new Date();
  }

  setConnected() {
    this.connStatus.style.display = "none";
  }

  setDisconnected() {
    this.connStatus.style.display = "block";
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

function formatDateAgo(date: Date): string {
  let seconds = (Date.now() - date.getTime()) / 1000;
  seconds = Math.round(seconds);

  if (seconds < -5) {
    return "in the future??";
  }
  if (seconds < 5) {
    return "just now";
  }

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  let minutes = Math.floor(seconds / 60);
  seconds = seconds - minutes * 60;
  if (minutes < 3 && seconds !== 0) {
    return `${minutes}m${seconds}s ago`;
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  let hours = Math.floor(minutes / 60);
  minutes = minutes - hours * 60;
  if (hours < 4 && minutes !== 0) {
    return `${hours}h${minutes}m ago`;
  }
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  hours = hours - days * 24;
  if (days < 2) {
    return `${days}d${hours}h ago`;
  }
  return `${days}d ago`;
}
