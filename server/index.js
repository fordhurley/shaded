#!/usr/bin/env node

const fs = require("fs")
const path = require("path")
const http = require("http")

const chokidar = require("chokidar")
const express = require("express")
const glslify = require("glslify")
const serveIndex = require("serve-index")
const WebSocket = require("ws")

const PORT = 3000 // TODO: arg

const server = http.createServer()

const wss = new WebSocket.Server({server})

wss.on("connection", (ws) => {
    const watcher = chokidar.watch()
    watcher.on("change", (p) => {
        console.log("change:", p)
        ws.send(JSON.stringify({
            command: "changed",
            path: "/" + p,
        }))
    })

    ws.on("message", (data) => {
        console.log(data)
        const msg = JSON.parse(data)
        switch (msg.command) {
            case "watch":
                msg.path = msg.path.slice(1)
                console.log("watch:", msg.path)
                watcher.add(msg.path)
                break
            default:
                console.warn("unknown command:", msg.command)
        }
    })

    ws.on("close", (code, reason) => {
        watcher.close()
    })
})

const app = express()

app.get("/bundle.js", (req, res) => {
    res.sendFile(path.resolve(__dirname, "..", "build", "bundle.js"))
})

app.get(/^\/(.+\.glsl)/, (req, res) => {
    const filePath = req.params[0] // regex group
    console.log("glsl:", filePath, req.headers.accept)

    if (req.headers.accept === "application/x-shader") {
        fs.readFile(filePath, (err, data) => {
            const source = data.toString()
            const basedir = path.dirname(path.resolve(filePath))
            const compiledSource = glslify.compile(source, {basedir})
            res.json({
                source,
                compiledSource,
            })
        })
        return
    }

    // Otherwise, serve the shader page to the browser:
    res.sendFile(path.resolve(__dirname, "..", "html", "shader.html"))
})

// Everything that starts and ends with / shows directory listings:
app.get(/^\/.*\/?$/, serveIndex(".", {view: "details"}))

// Catch all for everything else:
app.use(express.static(path.resolve(".")))

server.on("request", app)

server.listen(PORT, () => {
    console.log(`shader server listening on port ${PORT}!`)
})
