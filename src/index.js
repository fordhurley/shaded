import {ShaderCanvas} from "shader-canvas"

let canvas;

export function init(containerEl) {
    if (!canvas) {
        canvas = new ShaderCanvas()
    }
    canvas.setSize(400, 400)
    canvas.setShader(`
        precision mediump float;
        void main() {
            gl_FragColor = vec4(0.8, 0.8, 0.8, 1.0);
        }
    `)
    canvas.render()

    containerEl.appendChild(canvas.domElement)
}

export function load(url) {
    console.log("load:", url)
    fetch(new Request(url)).then((res) => {
        return res.text()
    }).then(setShader)
}

export function setShader(source) {
    canvas.setShader(source)
    canvas.setUniform("u_resolution", canvas.getResolution())
    function animate(timestamp) {
        requestAnimationFrame(animate)
        canvas.setUniform("u_time", timestamp / 1000)
        canvas.render()
    }
    requestAnimationFrame(animate)
}
