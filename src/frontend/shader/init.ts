import { Controls } from "./controls";
import { Shader } from "./shader";
import { WebSocketWatcher } from "./websocket";

export function init(path: string) {
  const domElement = document.createElement("div");

  const shader = new Shader();
  domElement.appendChild(shader.domElement);

  const controls = new Controls(path);
  domElement.appendChild(controls.domElement);

  const reload = () => {
    load(path)
      .then((data) => {
        if (data.compiledSource) {
          shader.setShader(data.compiledSource);
        } else {
          shader.setShader(data.source);
        }
        controls.setUpdated();
      })
      .catch((err) => {
        console.error(err);
        controls.addError(err);
      });
  };

  const watcher = new WebSocketWatcher(path);
  watcher.onConnect(controls.setConnected.bind(controls));
  watcher.onDisconnect(controls.setDisconnected.bind(controls));
  watcher.onChanged((p: string) => {
    controls.clearErrors();
    reload();
  });

  controls.onReconnect(watcher.reconnect.bind(watcher));

  shader.onRender(controls.reportFrame.bind(controls));
  shader.onResize(controls.setResolution.bind(controls));
  shader.onError(controls.addError.bind(controls));
  reload();

  return { shader, controls, domElement };
}

function load(
  path: string
): Promise<{ source: string; compiledSource?: string }> {
  const req = new Request(path + "?shader=true");
  req.headers.set("accept", "application/json");
  return fetch(req).then((res) => {
    if (res.status !== 200) {
      return res.json().then((json) => {
        throw new Error(json.error);
      });
    }
    return res.json();
  });
}
