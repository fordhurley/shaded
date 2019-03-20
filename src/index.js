import {Controls} from "./controls"
import {Shader} from "./shader"
import {WebSocket} from "./websocket"

export function init({el, path, wsURL}) {
    Object.assign(el.style, {
        width: "400px",
        fontFamily: "monospace",
        fontSize: "11pt",
    })

    const s = new Shader(el)
    s.load(path)

    const c = new Controls(el, path)

    const ws = new WebSocket(path, wsURL)
    ws.onConnect(() => { c.setConnected() })
    ws.onDisconnect(() => { c.setDisconnected() })
    ws.onChanged((p) => { s.load(p) })
}
