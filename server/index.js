#!/usr/bin/env node

const http = require("http")

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

serve(3000) // TODO: command line arg
