import {ShaderCanvas} from "shader-canvas"

import {bindResize} from "./resize"

export class Shader {
    constructor(containerEl) {
        containerEl.style.position = "relative"
        containerEl.style.display = "inline-block"

        this.eventHandlers = {}

        this.canvas = new ShaderCanvas()
        this.canvas.setSize(400, 400)
        this.canvas.domElement.style.display = "block"
        containerEl.appendChild(this.canvas.domElement)

        bindResize(containerEl, (width, height) => {
            this.canvas.setSize(width, height)
            this.updateResolution()
            this.canvas.render()
        })

        this.animate = this.animate.bind(this)
        this.mousemove = this.mousemove.bind(this)

        this.setShader(`
            precision mediump float;
            void main() {
                gl_FragColor = vec4(0.8, 0.8, 0.8, 1.0);
            }
        `)
    }

    addEventListener(name, callback) {
        this.getEventListeners(name).push(callback)
    }

    getEventListeners(name) {
        let handlers = this.eventHandlers[name]
        if (!handlers) {
            handlers = []
        }
        this.eventHandlers[name] = handlers
        return handlers
    }

    onError(callback) {
        this.addEventListener("error", callback)
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
            this.getEventListeners("error").forEach((callback) => { callback(err) });
        })
    }

    setShader(source) {
        this.source = source
        const errors = this.canvas.setShader(this.source)
        if (errors && errors.length > 0) {
            const msgs = errors.map((e) => e.text)
            const error = msgs.join("\n")
            this.getEventListeners("error").forEach((callback) => { callback(error) });
        }

        this.updateResolution()

        this.isAnimated = testUniform("float", "u_time", this.source)

        this.canvas.domElement.removeEventListener("mousemove", this.mousemove)
        if (testUniform("vec2", "u_mouse", this.source)) {
            this.canvas.domElement.addEventListener("mousemove", this.mousemove)
        }

        cancelAnimationFrame(this.frameRequest)

        const textureDirectives = parseTextureDirectives(this.source)
        Promise.all(textureDirectives.map(({filePath, name}) => {
            return loadImage(filePath).then((img) => {
                this.canvas.setTexture(name, img)
            })
        })).then(() => {
            if (this.isAnimated) {
                this.frameRequest = requestAnimationFrame(this.animate)
            } else {
                this.canvas.render()
            }
        }).catch((reason) => {
            console.error(reason);
            // FIXME: show which texture(s) failed:
            this.getEventListeners("error").forEach((callback) => { callback("texture error") });
        })
    }

    updateResolution() {
        if (testUniform("vec2", "u_resolution", this.source)) {
            this.canvas.setUniform("u_resolution", this.canvas.getResolution())
        }
    }

    animate(timestamp) {
        this.frameRequest = requestAnimationFrame(this.animate)
        this.canvas.setUniform("u_time", timestamp / 1000)
        this.canvas.render()
    }

    mousemove(e) {
        const rect = this.canvas.domElement.getBoundingClientRect()
        const mouse = [
            (e.clientX - rect.left) * window.devicePixelRatio,
            this.canvas.domElement.height - (e.clientY - rect.top) * window.devicePixelRatio,
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
