// The callback will be called when the user resizes the element, with the
// arguments width and height.
export function bindResize(el, callback) {
    el.style.position = "relative";

    const handle = document.createElement("div")
    Object.assign(handle.style, {
        position: "absolute",
        right: '-10px',
        bottom: '-10px',
        width: "20px",
        height: "20px",
        cursor: "se-resize",
    })

    el.appendChild(handle);

    const mousemove = (e) => {
        e.preventDefault();

        const rect = el.getBoundingClientRect();
        const width = e.clientX - rect.left
        const height = e.clientY - rect.top

        callback(width, height);
    }

    const mouseup = (e) => {
        window.removeEventListener("mousemove", mousemove, false);
        window.removeEventListener("mouseup", mouseup, false);
    }

    handle.addEventListener("mousedown", (e) => {
        window.addEventListener("mousemove", mousemove, false);
        window.addEventListener("mouseup", mouseup, false);
    }, false);
}