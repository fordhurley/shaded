import {ShaderCanvas} from "shader-canvas"

export class Shader {
    constructor(containerEl) {
        this.canvas = new ShaderCanvas()
        containerEl.appendChild(this.canvas.domElement)

        this.animate = this.animate.bind(this)
        this.mousemove = this.mousemove.bind(this)

        this.canvas.setSize(400, 400)
        this.setShader(`
            precision mediump float;
            void main() {
                gl_FragColor = vec4(0.8, 0.8, 0.8, 1.0);
            }
        `)
    }

    load(url) {
        console.log("load:", url)
        const req = new Request(url)
        req.headers.set("accept", "application/x-shader")
        fetch(req).then((res) => {
            return res.json()
        }).then((data) => {
            if (data.compiledSource) {
                this.setShader(data.compiledSource)
            } else {
                this.setShader(data.source)
            }
        }).catch((err) => {
            console.error(err)
        })
    }

    setShader(source) {
        this.source = source
        this.canvas.setShader(this.source)

        if (testUniform("vec2", "u_resolution", this.source)) {
            this.canvas.setUniform("u_resolution", this.canvas.getResolution())
        }

        this.isAnimated = testUniform("float", "u_time", this.source)

        this.canvas.domElement.removeEventListener("mousemove", this.mousemove)
        if (testUniform("vec2", "u_mouse", this.source)) {
            this.canvas.domElement.addEventListener("mousemove", this.mousemove)
        }

        cancelAnimationFrame(this.frameRequest)
        if (this.isAnimated) {
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

    mousemove(e) {
        const mouse = [
            e.offsetX / this.canvas.width,
            1 - (e.offsetY / this.canvas.height),
        ]
        this.canvas.setUniform("u_mouse", mouse);

        if (!this.isAnimated) {
            this.canvas.render()
        }
    }
}

function testUniform(type, name, source) {
    const re = new RegExp(`^\\s*uniform\\s+${type}\\s+${name}`, "m");
    return re.test(source);
}

function parseTextureDirectives(source) {
    // Looking for lines of the form:
    // uniform sampler2D foo; // ../textures/foo.png
    const re = /^\s*uniform\s+sampler2D\s+(\S+)\s*;\s*\/\/\s*(\S+)\s*$/gm;
    const out = [];
    let match = re.exec(source);
    while (match !== null) {
        const name = match[1];
        const filePath = match[2];
        out.push({name, filePath});
        match = re.exec(source);
    }
    return out;
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => { resolve(img); };
        img.onerror = reject;
        img.onabort = reject;
    });
}
