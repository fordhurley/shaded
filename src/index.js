import {ShaderCanvas} from "shader-canvas"

export class Shader {
    constructor(containerEl) {
        this.canvas = new ShaderCanvas()
        containerEl.appendChild(this.canvas.domElement)

        this.canvas.setSize(400, 400)
        this.setShader(`
            precision mediump float;
            void main() {
                gl_FragColor = vec4(0.8, 0.8, 0.8, 1.0);
            }
        `)

        this.animate = this.animate.bind(this)
    }

    load(url) {
        console.log("load:", url)
        fetch(new Request(url)).then((res) => {
            return res.text()
        }).then((source) => {
            this.setShader(source)
        })
    }

    setShader(source) {
        this.source = source
        this.canvas.setShader(this.source)

        if (testUniform("vec2", "u_resolution", this.source)) {
            this.canvas.setUniform("u_resolution", this.canvas.getResolution())
        }

        cancelAnimationFrame(this.frameRequest)
        if (testUniform("float", "u_time", this.source)) {
            this.frameRequest = requestAnimationFrame(this.animate)
        } else {
            this.canvas.render()
        }
    }

    animate(timestamp) {
        this.frameRequest = requestAnimationFrame(this.animate)
        this.canvas.setUniform("u_time", timestamp / 1000)
        this.canvas.render()
    }
}

function testUniform(type, name, source) {
    const re = new RegExp(`^\\s*uniform\\s+${type}\\s+${name}`, "m");
    return re.test(source);
  }
