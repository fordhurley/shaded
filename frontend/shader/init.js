import { Controls } from "./controls";
import { Shader } from "./shader";
import { WebSocket } from "./websocket";

export function init({ el, path, wsURL }) {
  const shader = new Shader();
  el.appendChild(shader.domElement);

  const controls = new Controls(path);
  el.appendChild(controls.domElement);

  const reload = () => {
    load(path)
      .then(data => {
        if (data.compiledSource) {
          shader.setShader(data.compiledSource);
        } else {
          shader.setShader(data.source);
        }
      })
      .catch(err => {
        console.error(err);
        controls.addError(err);
      });
  };

  const ws = new WebSocket(path, wsURL);
  ws.onConnect(controls.setConnected.bind(controls));
  ws.onDisconnect(controls.setDisconnected.bind(controls));
  ws.onChanged(p => {
    controls.clearErrors();
    reload();
  });

  controls.onReconnect(ws.reconnect.bind(ws));

  shader.onRender(controls.reportFrame.bind(controls));
  shader.onResize(controls.setResolution.bind(controls));
  shader.onError(controls.addError.bind(controls));
  reload();

  const title =
    document.querySelector("title") || document.createElement("title");
  title.textContent = `shaded: ${path}`;
  document.head.appendChild(title);

  return { shader, controls };
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
