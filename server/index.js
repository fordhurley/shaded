#!/usr/bin/env node

const http = require("http")

const parseArgs = require("minimist")

const app = require("./app")
const wss = require("./wss")

function serve(port) {
    const server = http.createServer()
    wss(server)
    server.on("request", app())
    server.listen(port, () => {
        console.log(`shade listening at http://localhost:${port}`)
    })
}

function usage() {
    console.error("usage of shade:")
    console.error("  --help, -h")
    console.error("     show this help")
    console.error("  --port <port>, -p <port>")
    console.error("     listen on port (default 3000)")
}

function isNumber(n) {
    if (typeof n !== "number") {
        return false
    }
    return !isNaN(n) && isFinite(n)
}

function main(opts) {
    if (opts.h || opts.help) {
        usage()
        return
    }

    const port = opts.port || opts.p || 3000

    if (!isNumber(port)) {
        console.error("ERROR: invalid port option:", port)
        usage()
        process.exit(1)
    }

    serve(port)
}

main(parseArgs(process.argv))
