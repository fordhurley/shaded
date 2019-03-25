import { ShaderCanvas } from "shader-canvas";

import { bindResize } from "./resize";
import { Listener } from "../listener";

export class Shader {
  constructor(containerEl) {
    containerEl.style.position = "relative";
    containerEl.style.display = "inline-block";

    this.listener = new Listener();

    this.canvas = new ShaderCanvas();
    this.canvas.setSize(400, 400);
    this.canvas.domElement.style.display = "block";
    containerEl.appendChild(this.canvas.domElement);

    bindResize(containerEl, (width, height) => {
      this.canvas.setSize(width, height);
      this.updateResolution();
      this.render();
    });

    this.animate = this.animate.bind(this);
    this.mousemove = this.mousemove.bind(this);

    this.setShader(`
            precision mediump float;
            void main() {
                gl_FragColor = vec4(0.8, 0.8, 0.8, 1.0);
            }
        `);
  }

  onError(callback) {
    this.listener.addEventListener("error", callback);
  }

  onResize(callback) {
    this.listener.addEventListener("resize", callback);
  }

  onRender(callback) {
    this.listener.addEventListener("render", callback);
  }

  render() {
    this.canvas.render();
    this.listener.forEachHandler("render", callback => {
      callback();
    });
  }

  setShader(source) {
    this.source = source;
    const errors = this.canvas.setShader(this.source);
    if (errors && errors.length > 0) {
      errors.forEach(error => {
        this.listener.forEachHandler("error", callback => {
          callback(error.text);
        });
      });
      return;
    }

    this.updateResolution();

    this.isAnimated = this.canvas.testUniform("u_time");

    this.canvas.domElement.removeEventListener("mousemove", this.mousemove);
    if (this.canvas.testUniform("u_mouse")) {
      this.canvas.domElement.addEventListener("mousemove", this.mousemove);
    }

    cancelAnimationFrame(this.frameRequest);

    const textureDirectives = parseTextureDirectives(this.source);
    Promise.all(
      textureDirectives.map(({ filePath, name }) => {
        return loadImage(filePath)
          .then(img => {
            this.canvas.setTexture(name, img);
          })
          .catch(reason => {
            console.error("texture error:", reason);
            const error = `error loading texture: ${filePath}`;
            this.listener.forEachHandler("error", callback => {
              callback(error);
            });
          });
      })
    )
      .then(() => {
        if (this.isAnimated) {
          this.frameRequest = requestAnimationFrame(this.animate);
        } else {
          this.render();
        }
      })
      .catch(reason => {
        console.error(reason);
      });
  }

  updateResolution() {
    const resolution = this.canvas.getResolution();
    if (this.canvas.testUniform("u_resolution")) {
      this.canvas.setUniform("u_resolution", resolution);
    }
    this.listener.forEachHandler("resize", callback => {
      callback(resolution);
    });
  }

  animate(timestamp) {
    this.frameRequest = requestAnimationFrame(this.animate);
    this.canvas.setUniform("u_time", timestamp / 1000);
    this.render();
  }

  mousemove(e) {
    const rect = this.canvas.domElement.getBoundingClientRect();
    const mouse = [
      (e.clientX - rect.left) * window.devicePixelRatio,
      this.canvas.domElement.height -
        (e.clientY - rect.top) * window.devicePixelRatio
    ];

    this.canvas.setUniform("u_mouse", mouse);
    if (!this.isAnimated) {
      this.render();
    }
  }
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
    out.push({ name, filePath });
    match = re.exec(source);
  }
  return out;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      resolve(img);
    };
    img.onerror = reject;
    img.onabort = reject;
  });
}
