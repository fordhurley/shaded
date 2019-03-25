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
    const uri = `http://localhost:${port}`;
    console.log(`shaded listening at ${uri}`);
    if (openBrowser) {
      open(uri);
    }
  });
}

const usage = `usage of shaded:
  --help, -h
     show this help
  --port <port>, -p <port>
     listen on port (default 3000)
  --open, -o
     open the browser when the server starts (default false)
`;

function main(opts) {
  if (opts.help || opts.h) {
    console.error(usage);
    return;
  }

  const port = opts.port || opts.p || 3000;

  if (typeof port !== "number") {
    console.error("ERROR: invalid port option:", port);
    console.error(usage);
    process.exit(1);
  }

  const openBrowser = opts.open || opts.o;

  serve(port, openBrowser);
}

main(parseArgs(process.argv));
