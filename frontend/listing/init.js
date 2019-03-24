export function init({el, path}) {
    const containerEl = document.createElement("div");
    el.appendChild(containerEl)

    const loading = document.createElement("div");
    loading.style.color = "dimgray";
    loading.textContent = "loading...";
    containerEl.appendChild(loading);

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
    }).finally(() => {
        containerEl.removeChild(loading)
    })

    const title = document.querySelector("title") || document.createElement("title")
    title.textContent = `shaded: ${path}`
    document.head.appendChild(title)
}

function load(path) {
    const req = new Request(path + "?listing=true")
    req.headers.set("accept", "application/json")
    return fetch(req).then((res) => {
        if (res.status !== 200) {
            return res.json().then((json) => {
                throw new Error(json.error);
            });
        }
        return res.json()
    })
}
