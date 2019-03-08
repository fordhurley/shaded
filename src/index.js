import {ShaderCanvas} from "shader-canvas"

export function init(containerEl) {
    const canvas = new ShaderCanvas()
    canvas.setSize(400, 400)
    canvas.setShader(`
        precision mediump float;
        uniform vec2 u_resolution;
        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution;
            gl_FragColor = vec4(uv.x, 0.0, uv.y, 1.0);
        }
    `)
    canvas.setUniform("u_resolution", canvas.getResolution())
    canvas.render()

    containerEl.appendChild(canvas.domElement)
}
