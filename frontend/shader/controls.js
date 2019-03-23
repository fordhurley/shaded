import {breadcrumbs} from "../breadcrumbs"
import {Listener} from "../listener"

export class Controls {
    constructor(containerEl, path) {
        this.listener = new Listener()

        this.domElement = document.createElement("div")
        containerEl.appendChild(this.domElement)

        this.domElement.appendChild(breadcrumbs(path))

        this.resolution = document.createElement("div")
        this.domElement.appendChild(this.resolution)

        this.framerate = document.createElement("div")
        this.domElement.appendChild(this.framerate)
        this.setFramerate(0)
        this.frames = 0
        this.lastTimestamp = performance.now()

        const connection = document.createElement("div")
        this.domElement.appendChild(connection)

        this.connStatus = document.createElement("span")
        connection.appendChild(this.connStatus)

        this.reconnect = document.createElement("a")
        this.reconnect.href = "#"
        this.reconnect.textContent = "reconnect"
        this.reconnect.style.marginLeft = "0.5em"
        this.reconnect.onclick = this.handleReconnect.bind(this)
        connection.appendChild(this.reconnect)

        this.setDisconnected()

        this.error = document.createElement("pre")
        this.error.style.color = "red"
        this.domElement.appendChild(this.error)

        this.animate = this.animate.bind(this)
        window.requestAnimationFrame(this.animate)
    }

    reportFrame() {
        this.frames++
    }

    setResolution([width, height]) {
        this.resolution.textContent = `${width}×${height}`
    }

    animate(timestamp) {
        window.requestAnimationFrame(this.animate)
        if (timestamp - this.lastTimestamp < 500) {
            return
        }
        const deltaSeconds = (timestamp - this.lastTimestamp) / 1000
        this.setFramerate(this.frames / deltaSeconds)
        this.frames = 0
        this.lastTimestamp = timestamp
    }

    setFramerate(fps) {
        this.framerate.textContent = `${fps.toFixed(2)} fps`
    }

    setConnected() {
        this.connStatus.textContent = "connected"
        this.reconnect.style.display = "none"
    }

    setDisconnected() {
        this.connStatus.textContent = "disconnected"
        this.reconnect.style.display = "inline"
    }

    handleReconnect(e) {
        e.preventDefault()
        this.listener.forEachHandler("reconnect", (callback) => {
            callback()
        })
    }

    onReconnect(callback) {
        this.listener.addEventListener("reconnect", callback)
    }

    setError(error) {
        this.error.textContent = error ? error : ""
    }
}

function dirname(path) {
    return path.match(/.*\//);
}
