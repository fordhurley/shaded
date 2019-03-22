import {Listener} from "./listener"

export class Controls {
    constructor(containerEl, path) {
        this.listener = new Listener()

        this.domElement = document.createElement("div")
        containerEl.appendChild(this.domElement)

        const navUp = document.createElement("a")
        navUp.href = dirname(path)
        navUp.textContent = "up"
        const div = document.createElement("div")
        div.appendChild(navUp)
        this.domElement.appendChild(div)

        this.resolution = document.createElement("div")
        this.domElement.appendChild(this.resolution)

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

    setResolution([width, height]) {
        this.resolution.textContent = `${width}×${height}`
    }

    setError(error) {
        this.error.textContent = error ? error : ""
    }
}

function dirname(path) {
    return path.match(/.*\//);
}
