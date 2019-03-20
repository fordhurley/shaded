export class Controls {
    constructor(containerEl, path) {
        this.domElement = document.createElement("span")
        Object.assign(this.domElement.style, {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
        })
        containerEl.appendChild(this.domElement)

        const navUp = document.createElement("a")
        navUp.href = dirname(path)
        navUp.textContent = "up"
        this.domElement.appendChild(navUp)

        this.status = document.createElement("span")
        this.domElement.appendChild(this.status)
        this.setDisconnected()
    }

    setConnected() {
        this.status.textContent = "✓"
    }

    setDisconnected() {
        this.status.textContent = "𐄂"
    }
}

function dirname(path) {
    return path.match(/.*\//);
}
