const fs = require("fs")
const path = require("path")

const express = require("express")
const glslify = require("glslify")
const serveIndex = require("serve-index")

function serveShader(filePath, res) {
    fs.readFile(filePath, (error, data) => {
        if (error) {
            console.error("error reading shader:", error)
            if (error.code === "ENOENT") {
                res.status(404)
                res.json({error: "not found"})
                return
            }
            res.status(500)
            res.json({error})
            return
        }

        const source = data.toString()

        // Run glslify relative to the file, so that relative imports
        // resolve relative to the file, and absolute imports resolve
        // with the usual rules:
        const basedir = path.dirname(path.resolve(filePath))
        const compiledSource = glslify.compile(source, {basedir})

        res.json({source, compiledSource})
    })
}

module.exports = function() {
    const app = express()

    const shaderJS = path.resolve(__dirname, "..", "build", "shader.js")
    const shaderHTML = path.resolve(__dirname, "..", "html", "shader.html")

    app.get("/shader.js", (req, res) => {
        res.sendFile(shaderJS)
    })

    app.get(/^\/(.+\.glsl)/, (req, res) => {
        if (req.headers.accept === "application/x-shader") {
            const filePath = req.params[0] // first regex group
            serveShader(filePath, res)
            return
        }

        // Otherwise, serve the shader page to the browser:
        res.sendFile(shaderHTML)
    })

    // Everything that starts and ends with / shows directory listings:
    app.get(/^\/.*\/?$/, serveIndex(".", {view: "details"}))

    // Catch all for everything else:
    app.use(express.static(path.resolve(".")))

    return app
}
