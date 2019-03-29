import * as http from "http";

import * as chokidar from "chokidar";
import * as ws from "ws";

export function bindToServer(server: http.Server) {
  const wss = new ws.Server({ server });

  wss.on("connection", ws => {
    const watcher = chokidar.watch([]);

    watcher.on("change", p => {
      ws.send(
        JSON.stringify({
          command: "changed",
          path: "/" + p
        })
      );
    });

    ws.on("message", data => {
      const msg = JSON.parse(data.toString());
      switch (msg.command) {
        case "watch":
          msg.path = msg.path.slice(1);
          watcher.add(msg.path);
          break;
        default:
          console.error("unknown command:", msg.command);
      }
    });

    ws.on("close", (code, reason) => {
      watcher.close();
    });
  });

  return wss;
}
