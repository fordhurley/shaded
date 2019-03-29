export function init() {
  const path = window.location.pathname;

  const domElement = document.createElement("div");

  const loading = document.createElement("div");
  loading.style.color = "dimgray";
  loading.textContent = "loading...";
  domElement.appendChild(loading);

  load(path)
    .then(data => {
      data.entries.forEach(entry => {
        const entryEl = document.createElement("div");
        entryEl.innerHTML = `<a href="${entry.url}">${entry.name}</a>`;
        domElement.appendChild(entryEl);
      });
    })
    .catch(error => {
      console.error(error);
      const errorEl = document.createElement("div");
      errorEl.textContent = error.toString();
      errorEl.style.color = "red";
      domElement.appendChild(errorEl);
    })
    .finally(() => {
      domElement.removeChild(loading);
    });

  return { domElement };
}

function load(path) {
  const req = new Request(path + "?listing=true");
  req.headers.set("accept", "application/json");
  return fetch(req).then(res => {
    if (res.status !== 200) {
      return res.json().then(json => {
        throw new Error(json.error);
      });
    }
    return res.json();
  });
}
