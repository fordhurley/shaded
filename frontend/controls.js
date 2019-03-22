export class Controls {
    constructor(containerEl, path) {
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

        this.connStatus = document.createElement("div")
        this.domElement.appendChild(this.connStatus)
        this.setDisconnected()

        this.error = document.createElement("pre")
        this.error.style.color = "red"
        this.domElement.appendChild(this.error)
    }

    setConnected() {
        this.connStatus.textContent = "connected"
    }

    setDisconnected() {
        this.connStatus.textContent = "disconnected"
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
