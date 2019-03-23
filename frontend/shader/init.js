import {Controls} from "./controls"
import {Shader} from "./shader"
import {WebSocket} from "./websocket"

export function init({el, path, wsURL}) {
    const containerEl = document.createElement("div");
    el.appendChild(containerEl)

    const s = new Shader(containerEl)

    const c = new Controls(el, path)

    const ws = new WebSocket(path, wsURL)
    ws.onConnect(c.setConnected.bind(c))
    ws.onDisconnect(c.setDisconnected.bind(c))
    ws.onChanged((p) => {
        c.clearErrors()
        s.load(p)
    })

    c.onReconnect(ws.reconnect.bind(ws))

    s.onRender(c.reportFrame.bind(c))
    s.onResize(c.setResolution.bind(c))
    s.onError(c.addError.bind(c))
    s.load(path)

    const title = document.querySelector("title") || document.createElement("title")
    title.textContent = `shade: ${path}`
    document.head.appendChild(title)
}
