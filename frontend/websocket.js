import {Listener} from "./listener"

export class WebSocket {
    constructor(path, url) {
        this.path = path
        this.url = url

        this.listener = new Listener()

        this.onConnect(() => {
            this.sendWatch(this.path)
        })
        this.onDisconnect(() => {
            this.scheduleReconnect()
        })

        this.reconnect = this.reconnect.bind(this)
        this.reconnect()
    }

    handleMessage(msg) {
        switch (msg.command) {
        case "changed":
            if (msg.path !== this.path) {
                return
            }
            this.listener.forEachHandler("changed", (handler) => {
                handler(msg.path)
            })
            break
        default:
            console.warn("unknown command:", msg.command)
        }
    }

    scheduleReconnect() {
        if (this.reconnectTimeout) {
            window.clearTimeout(this.reconnectTimeout)
        }
        // TODO: back off
        this.reconnectTimeout = window.setTimeout(this.reconnect, 10*1000)
    }

    reconnect() {
        if (this.reconnectTimeout) {
            window.clearTimeout(this.reconnectTimeout)
        }

        this.ws = new window.WebSocket(this.url)
        this.ws.onopen = (event) => {
            this.listener.forEachHandler("connect", (handler) => {
                handler()
            })
        }
        this.ws.onclose = (event) => {
            this.listener.forEachHandler("disconnect", (handler) => {
                handler()
            })
        }
        this.ws.onmessage = (event) => {
            this.handleMessage(JSON.parse(event.data))
        }
    }

    sendWatch(path) {
        this.ws.send(JSON.stringify({
            command: "watch",
            path,
        }))
    }

    // callback called with a string path arg.
    onChanged(callback) {
        this.listener.addEventListener("changed", callback)
    }

    onConnect(callback) {
        this.listener.addEventListener("connect", callback)
    }

    onDisconnect(callback) {
        this.listener.addEventListener("disconnect", callback)
    }
}
