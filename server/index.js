#!/usr/bin/env node

const http = require("http");

const open = require("opn");
const parseArgs = require("minimist");

const app = require("./app");
const wss = require("./wss");

function serve(port, openBrowser) {
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
  wss(server);

  server.listen(port, () => {
    let uri = `http://localhost:${port}/`;
    console.log(`shaded listening at ${uri}`);
    if (openBrowser) {
      if (typeof openBrowser === "string") {
        open(uri + openBrowser);
      } else {
        open(uri);
      }
    }
  });
}

const usage = `Usage for shaded:

  -p, --port <port>    listen on <port> (default 3000)
  -o, --open [path]    open the browser when the server starts, to an
                       optional path (default false)
  -h, --help           show this help
`;

function main(opts) {
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
  parseArgs(process.argv.slice(2), {
    alias: {
      h: "help",
      p: "port",
      o: "open"
    }
  })
);
