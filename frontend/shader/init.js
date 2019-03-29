import { Controls } from "./controls";
import { Shader } from "./shader";
import { WebSocket } from "./websocket";

export function init() {
  const path = window.location.pathname;

  const domElement = document.createElement("div");

  const shader = new Shader();
  domElement.appendChild(shader.domElement);

  const controls = new Controls(path);
  domElement.appendChild(controls.domElement);

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

  const ws = new WebSocket(path);
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

  return { shader, controls, domElement };
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
