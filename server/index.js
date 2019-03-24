#!/usr/bin/env node

const http = require("http")

const open = require("opn")
const parseArgs = require("minimist")

const app = require("./app")
const wss = require("./wss")

function serve(port, openBrowser) {
    const server = http.createServer()

    server.on("request", app())

    server.on("error", (err) => {
        console.error("http:", err.message)
        process.exit(2)
    })

    // For some reason, the websocket server must be bound to the server *after*
    // adding the "error" handler, or else errors like EADDRINUSE will result
    // in an uncaught exception, as if the handler was never bound at all.
    wss(server)

    server.listen(port, () => {
        const uri = `http://localhost:${port}`
        console.log(`shaded listening at ${uri}`)
        if (openBrowser) {
            open(uri)
        }
    })
}

const usage = `usage of shaded:
  --help, -h
     show this help
  --port <port>, -p <port>
     listen on port (default 3000)
  --open, -o
     open the browser when the server starts (default false)
`

function main(opts) {
    if (opts.help || opts.h) {
        console.error(usage)
        return
    }

    const port = opts.port || opts.p || 3000

    if (typeof port !== "number") {
        console.error("ERROR: invalid port option:", port)
        console.error(usage)
        process.exit(1)
    }

    const openBrowser = opts.open || opts.o

    serve(port, openBrowser)
}

main(parseArgs(process.argv))
