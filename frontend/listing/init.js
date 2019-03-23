export function init({el, path}) {
    const containerEl = document.createElement("div");
    el.appendChild(containerEl)

    load(path).then((data) => {
        data.entries.forEach((entry) => {
            const entryEl = document.createElement("div");
            entryEl.innerHTML = `<a href="${entry.url}">${entry.name}</a>`
            containerEl.appendChild(entryEl)
        })
    }).catch((error) => {
        console.error(error)
        const errorEl = document.createElement("div");
        errorEl.textContent = error.toString()
        errorEl.style.color = "red";
        containerEl.appendChild(errorEl)
    })
}

function load(path) {
    const req = new Request(path)
    req.headers.set("accept", "application/json")
    return fetch(req).then((res) => {
        return res.json()
    })
}
