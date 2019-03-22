#!/usr/bin/env node

const http = require("http")

const open = require("opn")
const parseArgs = require("minimist")

const app = require("./app")
const wss = require("./wss")

function serve(port, openBrowser) {
    const server = http.createServer()

    wss(server)

    server.on("request", app())

    server.listen(port, () => {
        const uri = `http://localhost:${port}`
        console.log(`shade listening at ${uri}`)
        if (openBrowser) {
            open(uri)
        }
    })
}

const usage = `usage of shade:
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
