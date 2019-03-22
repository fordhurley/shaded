import {Controls} from "./controls"
import {Shader} from "./shader"
import {WebSocket} from "./websocket"

export function init({el, path, wsURL}) {
    Object.assign(el.style, {
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
        fontSize: "10pt",
    })

    const containerEl = document.createElement("div");
    el.appendChild(containerEl)

    const s = new Shader(containerEl)

    const c = new Controls(el, path)

    const ws = new WebSocket(path, wsURL)
    ws.onConnect(() => { c.setConnected() })
    ws.onDisconnect(() => { c.setDisconnected() })
    ws.onChanged((p) => {
        c.setError()
        s.load(p)
    })

    s.onError((e) => { c.setError(e) });
    s.load(path)
}
