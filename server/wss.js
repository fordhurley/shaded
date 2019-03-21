const chokidar = require("chokidar")
const WebSocket = require("ws")

module.exports = function(server) {
    const wss = new WebSocket.Server({server})

    wss.on("connection", (ws) => {
        const watcher = chokidar.watch()

        watcher.on("change", (p) => {
            ws.send(JSON.stringify({
                command: "changed",
                path: "/" + p,
            }))
        })

        ws.on("message", (data) => {
            const msg = JSON.parse(data)
            switch (msg.command) {
                case "watch":
                    msg.path = msg.path.slice(1)
                    watcher.add(msg.path)
                    break
                default:
                    console.error("unknown command:", msg.command)
            }
        })

        ws.on("close", (code, reason) => {
            watcher.close()
        })
    })

    return wss
}
