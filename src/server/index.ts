#!/usr/bin/env node

import * as http from "http";

import open = require("open");
import minimist = require("minimist");

import { app } from "./app";
import * as wss from "./wss";

function serve(port: number, openBrowser: boolean | string) {
  const server = http.createServer();

  server.on("request", app());

  server.on("error", err => {
    console.error("http:", err.message);
    process.exit(2);
  });

  // If the websocket server is bound to the http server before the "error"
  // handler is bound, the http server's "error" events will be forwarded to
  // the websocket server *first*, causing the uncaught exception handling in
  // node's "events" package. Binding this *after* allows OUR "error" handler
  // to log and exit first, without the annoying stack trace. This is
  // particularly important for EADDRINUSE on start up.
  wss.bindToServer(server);

  server.listen(port, () => {
    let uri = `http://localhost:${port}/`;
    console.log(`shaded listening at ${uri}`);
    if (openBrowser) {
      if (typeof openBrowser === "string") {
        uri += openBrowser;
      }
      open(uri);
    }
  });
}

const usage = `Usage for shaded:

  -p, --port <port>    listen on <port> (default 3000)
  -o, --open [path]    open the browser when the server starts, to an
                       optional path (default false)
  -h, --help           show this help
`;

function main(opts: minimist.ParsedArgs) {
  if (opts.help) {
    console.error(usage);
    return;
  }

  const port = opts.port || 3000;

  if (typeof port !== "number") {
    console.error("ERROR: invalid port option:", port);
    console.error(usage);
    process.exit(1);
  }

  const openBrowser = opts.open;

  serve(port, openBrowser);
}

main(
  minimist(process.argv.slice(2), {
    alias: {
      h: "help",
      p: "port",
      o: "open"
    }
  })
);
