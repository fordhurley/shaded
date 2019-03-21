export class WebSocket {
    constructor(path, url) {
        this.path = path
        this.url = url

        this.eventHandlers = {}

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
            this.getEventListeners("changed").forEach((handler) => {
                handler(msg.path)
            })
            break
        default:
            console.warn("unknown command:", msg.command)
        }
    }

    addEventListener(name, callback) {
        this.getEventListeners(name).push(callback)
    }

    getEventListeners(name) {
        let handlers = this.eventHandlers[name]
        if (!handlers) {
            handlers = []
        }
        this.eventHandlers[name] = handlers
        return handlers
    }

    scheduleReconnect() {
        if (this.reconnectTimeout) {
            window.clearTimeout(this.reconnectTimeout)
        }
        // TODO: back off
        this.reconnectTimeout = window.setTimeout(this.reconnect, 10*1000)
    }

    reconnect() {
        this.ws = new window.WebSocket(this.url)
        this.ws.onopen = (event) => {
            console.log("connected:", event)
            this.getEventListeners("connect").forEach((handler) => {
                handler()
            })
        }
        this.ws.onclose = (event) => {
            console.log("close:", event)
            this.getEventListeners("disconnect").forEach((handler) => {
                handler()
            })
        }
        this.ws.onerror = (event) => {
            console.log("error:", event)
        }
        this.ws.onmessage = (event) => {
            console.log("message:", event.data)
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
        this.addEventListener("changed", callback)
    }

    onConnect(callback) {
        this.addEventListener("connect", callback)
    }

    onDisconnect(callback) {
        this.addEventListener("disconnect", callback)
    }
}
