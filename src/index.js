import {Shader} from "./shader"
import {WebSocket} from "./websocket"

export function init({el, path, wsURL}) {
    const s = new Shader(el)
    s.load(path)

    const ws = new WebSocket(path, wsURL)
    ws.onChanged((p) => { s.load(p) })
}
