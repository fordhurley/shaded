var shade = (function (exports) {
    'use strict';

    class Controls {
        constructor(containerEl, path) {
            this.domElement = document.createElement("span");
            Object.assign(this.domElement.style, {
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
            });
            containerEl.appendChild(this.domElement);

            const navUp = document.createElement("a");
            navUp.href = dirname(path);
            navUp.textContent = "up";
            this.domElement.appendChild(navUp);

            this.status = document.createElement("span");
            this.domElement.appendChild(this.status);
            this.setDisconnected();
        }

        setConnected() {
            this.status.textContent = "✓";
        }

        setDisconnected() {
            this.status.textContent = "𐄂";
        }
    }

    function dirname(path) {
        return path.match(/.*\//);
    }

    const defaultVertexShader = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;
    const defaultFragmentShader = `
  #ifdef GL_ES
  precision mediump float;
  #endif
  void main() {
    gl_FragColor = vec4(0.0);
  }
`;
    class ShaderCanvas {
        constructor() {
            this.width = 0;
            this.height = 0;
            this.textures = {};
            this.domElement = document.createElement("canvas");
            const gl = this.domElement.getContext("webgl");
            if (!gl) {
                throw new Error("failed to get webgl context");
            }
            this.gl = gl;
            const vs = this.gl.createShader(this.gl.VERTEX_SHADER);
            if (!vs) {
                throw new Error("failed to create vertex shader");
            }
            this.vertexShader = vs;
            const vsErrs = compileShader(this.gl, this.vertexShader, defaultVertexShader);
            if (vsErrs) {
                throw new Error("failed to compile vertex shader");
            }
            const fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);
            if (!fs) {
                throw new Error("failed to create fragment shader");
            }
            this.fragmentShader = fs;
            const fsErrs = compileShader(this.gl, this.fragmentShader, defaultFragmentShader);
            if (fsErrs) {
                throw new Error("failed to compile vertex shader");
            }
            this.shaderProgram = createShaderProgram(this.gl, this.vertexShader, this.fragmentShader);
            bindPositionAttribute(this.gl, this.shaderProgram);
            this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
            this.gl.useProgram(this.shaderProgram);
            this.setSize(400, 400);
        }
        setSize(width, height) {
            this.width = width;
            this.height = height;
            const dpr = window.devicePixelRatio;
            this.domElement.width = width * dpr;
            this.domElement.height = height * dpr;
            this.domElement.style.width = width + "px";
            this.domElement.style.height = height + "px";
            this.gl.viewport(0, 0, this.domElement.width, this.domElement.height);
        }
        // getResolution is a convenience method for getting a vec2 representing the
        // size in physical pixels of the canvas.
        // Typical usage is:
        //   shaderCanvas.setUniform("u_resolution", shaderCanvas.getResolution());
        getResolution() {
            return [
                this.domElement.width,
                this.domElement.height,
            ];
        }
        setShader(source) {
            const gl = this.gl;
            const errs = compileShader(gl, this.fragmentShader, source);
            if (errs) {
                return errs;
            }
            gl.linkProgram(this.shaderProgram);
            if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
                console.error(gl.getProgramInfoLog(this.shaderProgram));
                throw new Error("failed to link program");
            }
        }
        setUniform(name, value) {
            // TODO: validate name?
            // TODO OPTIMIZE: cache uniform location
            const location = this.gl.getUniformLocation(this.shaderProgram, name);
            if (location === null) {
                throw new Error(`uniform location for ${name} not found`);
            }
            if (typeof value === "number") {
                this.gl.uniform1f(location, value);
                return;
            }
            switch (value.length) {
                case 2:
                    this.gl.uniform2fv(location, value);
                    break;
                case 3:
                    this.gl.uniform3fv(location, value);
                    break;
                case 4:
                    this.gl.uniform4fv(location, value);
                    break;
            }
        }
        // TODO: accept options, like format, filter, wrap, etc.
        setTexture(name, image) {
            // TODO: validate name?
            const gl = this.gl;
            let t = this.textures[name];
            if (!t) {
                const glTexture = gl.createTexture();
                if (!glTexture) {
                    throw new Error(`unable to create glTexture`);
                }
                t = {
                    glTexture,
                    unit: lowestUnused(Object.keys(this.textures).map((k) => this.textures[k].unit)),
                };
                this.textures[name] = t;
            }
            gl.activeTexture(gl.TEXTURE0 + t.unit);
            gl.bindTexture(gl.TEXTURE_2D, t.glTexture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            const location = gl.getUniformLocation(this.shaderProgram, name);
            if (location === null) {
                throw new Error(`uniform location for texture ${name} not found`);
            }
            gl.uniform1i(location, t.unit);
        }
        render() {
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        }
    }
    function compileShader(gl, shader, source) {
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return;
        }
        const info = gl.getShaderInfoLog(shader);
        if (!info) {
            throw new Error("failed to compile, but found no error log");
        }
        console.error(info);
        return parseErrorMessages(info);
    }
    function createShaderProgram(gl, vs, fs) {
        const program = gl.createProgram();
        if (program === null) {
            throw new Error("failed to create shader program");
        }
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(program);
            console.error(info);
            throw new Error("failed to link program");
        }
        return program;
    }
    function bindPositionAttribute(gl, program) {
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        const positions = new Float32Array([
            -1.0, -1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0,
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        const positionLocation = gl.getAttribLocation(program, "position");
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLocation);
    }
    function parseErrorMessages(msg) {
        const errorRegex = /^ERROR: \d+:(\d+).*$/mg;
        const messages = [];
        let match = errorRegex.exec(msg);
        while (match) {
            messages.push({
                text: match[0],
                lineNumber: parseInt(match[1], 10),
            });
            // Look for another error:
            match = errorRegex.exec(msg);
        }
        return messages;
    }
    // This is a flavor of Shlemiel the painter's algorithm.
    // http://wiki.c2.com/?ShlemielThePainter
    //
    // TODO: figure out how to run tests, but I've spot checked these:
    //   [] => 0
    //   [0, 1, 2, 3, 4] => 5
    //   [0, 1, 3, 4] => 2
    //   [1, 3, 4] => 0
    //   [4] => 0
    //   [4, 3, 2, 1, 0] => 5
    //   [4, 2, 1, 0] => 3
    //   [4, 2, 1, 10] => 0
    //   [2, 0, 3, 4] => 1
    function lowestUnused(xs) {
        let unused = 0;
        for (let i = 0; i < xs.length; i++) {
            if (xs[i] === unused) {
                unused++;
                i = -1; // go back to the beginning
            }
        }
        return unused;
    }

    class Shader {
        constructor(containerEl) {
            this.canvas = new ShaderCanvas();
            containerEl.appendChild(this.canvas.domElement);

            this.animate = this.animate.bind(this);
            this.mousemove = this.mousemove.bind(this);

            this.resize();
            this.setShader(`
            precision mediump float;
            void main() {
                gl_FragColor = vec4(0.8, 0.8, 0.8, 1.0);
            }
        `);
        }

        load(url) {
            console.log("load:", url);
            const req = new Request(url);
            req.headers.set("accept", "application/x-shader");
            fetch(req).then((res) => {
                return res.json()
            }).then((data) => {
                if (data.compiledSource) {
                    this.setShader(data.compiledSource);
                } else {
                    this.setShader(data.source);
                }
            }).catch((err) => {
                console.error(err);
            });
        }

        setShader(source) {
            this.source = source;
            this.canvas.setShader(this.source);

            if (testUniform("vec2", "u_resolution", this.source)) {
                this.canvas.setUniform("u_resolution", this.canvas.getResolution());
            }

            this.isAnimated = testUniform("float", "u_time", this.source);

            this.canvas.domElement.removeEventListener("mousemove", this.mousemove);
            if (testUniform("vec2", "u_mouse", this.source)) {
                this.canvas.domElement.addEventListener("mousemove", this.mousemove);
            }

            cancelAnimationFrame(this.frameRequest);

            const textureDirectives = parseTextureDirectives(this.source);
            Promise.all(textureDirectives.map(({filePath, name}) => {
                return loadImage(filePath).then((img) => {
                    this.canvas.setTexture(name, img);
                })
            })).then(() => {
                if (this.isAnimated) {
                    this.frameRequest = requestAnimationFrame(this.animate);
                } else {
                    this.canvas.render();
                }
            }).catch((reason) => {
                console.error(reason);
            });
        }

        animate(timestamp) {
            this.frameRequest = requestAnimationFrame(this.animate);
            this.canvas.setUniform("u_time", timestamp / 1000);
            this.canvas.render();
        }

        mousemove(e) {
            const rect = this.canvas.domElement.getBoundingClientRect();
            const mouse = [
                (e.clientX - rect.left) * window.devicePixelRatio,
                this.canvas.domElement.height - (e.clientY - rect.top) * window.devicePixelRatio,
            ];

            this.canvas.setUniform("u_mouse", mouse);
            if (!this.isAnimated) {
                this.canvas.render();
            }
        }

        resize() {
            this.canvas.domElement.style.width = "100%";
            const width = this.canvas.domElement.clientWidth;
            this.canvas.setSize(width, width);
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

    class WebSocket {
        constructor(path, url) {
            this.path = path;
            this.url = url;

            this.eventHandlers = {};

            this.onConnect(() => {
                this.sendWatch(this.path);
            });
            this.onDisconnect(() => {
                this.scheduleReconnect();
            });

            this.reconnect = this.reconnect.bind(this);
            this.reconnect();
        }

        handleMessage(msg) {
            switch (msg.command) {
            case "changed":
                if (msg.path !== this.path) {
                    return
                }
                this.getEventListeners("changed").forEach((handler) => {
                    handler(msg.path);
                });
                break
            default:
                console.warn("unknown command:", msg.command);
            }
        }

        addEventListener(name, callback) {
            this.getEventListeners(name).push(callback);
        }

        getEventListeners(name) {
            let handlers = this.eventHandlers[name];
            if (!handlers) {
                handlers = [];
            }
            this.eventHandlers[name] = handlers;
            return handlers
        }

        scheduleReconnect() {
            if (this.reconnectTimeout) {
                window.clearTimeout(this.reconnectTimeout);
            }
            // TODO: back off
            this.reconnectTimeout = window.setTimeout(this.reconnect, 10*1000);
        }

        reconnect() {
            this.ws = new window.WebSocket(this.url);
            this.ws.onopen = (event) => {
                console.log("connected:", event);
                this.getEventListeners("connect").forEach((handler) => {
                    handler();
                });
            };
            this.ws.onclose = (event) => {
                console.log("close:", event);
                this.getEventListeners("disconnect").forEach((handler) => {
                    handler();
                });
            };
            this.ws.onerror = (event) => {
                console.log("error:", event);
            };
            this.ws.onmessage = (event) => {
                console.log("message:", event.data);
                this.handleMessage(JSON.parse(event.data));
            };
        }

        sendWatch(path) {
            this.ws.send(JSON.stringify({
                command: "watch",
                path,
            }));
        }

        // callback called with a string path arg.
        onChanged(callback) {
            this.addEventListener("changed", callback);
        }

        onConnect(callback) {
            this.addEventListener("connect", callback);
        }

        onDisconnect(callback) {
            this.addEventListener("disconnect", callback);
        }
    }

    function init({el, path, wsURL}) {
        Object.assign(el.style, {
            width: "400px",
            fontFamily: "monospace",
            fontSize: "11pt",
        });

        const s = new Shader(el);
        s.load(path);

        const c = new Controls(el, path);

        const ws = new WebSocket(path, wsURL);
        ws.onConnect(() => { c.setConnected(); });
        ws.onDisconnect(() => { c.setDisconnected(); });
        ws.onChanged((p) => { s.load(p); });
    }

    exports.init = init;

    return exports;

}({}));
