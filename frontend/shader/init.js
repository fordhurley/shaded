import { Controls } from "./controls";
import { Shader } from "./shader";
import { WebSocket } from "./websocket";

export function init({ el, path, wsURL }) {
  const containerEl = document.createElement("div");
  el.appendChild(containerEl);

  const s = new Shader(containerEl);

  const c = new Controls(el, path);

  const reload = () => {
    load(path)
      .then(data => {
        if (data.compiledSource) {
          s.setShader(data.compiledSource);
        } else {
          s.setShader(data.source);
        }
      })
      .catch(err => {
        console.error(err);
        c.addError(err);
      });
  };

  const ws = new WebSocket(path, wsURL);
  ws.onConnect(c.setConnected.bind(c));
  ws.onDisconnect(c.setDisconnected.bind(c));
  ws.onChanged(p => {
    c.clearErrors();
    reload();
  });

  c.onReconnect(ws.reconnect.bind(ws));

  s.onRender(c.reportFrame.bind(c));
  s.onResize(c.setResolution.bind(c));
  s.onError(c.addError.bind(c));
  reload();

  const title =
    document.querySelector("title") || document.createElement("title");
  title.textContent = `shaded: ${path}`;
  document.head.appendChild(title);
}

function load(path) {
  const req = new Request(path + "?shader=true");
  req.headers.set("accept", "application/json");
  return fetch(req).then(res => {
    if (res.status !== 200) {
      return res.json().then(json => {
        throw new Error(json.error);
      });
    }
    return res.json();
  });
}
