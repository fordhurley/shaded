const fs = require("fs")
const path = require("path")

const express = require("express")
const glslify = require("glslify")
const serveIndex = require("serve-index")

module.exports = function() {
    const app = express()

    app.get("/bundle.js", (req, res) => {
        res.sendFile(path.resolve(__dirname, "..", "build", "bundle.js"))
    })

    app.get(/^\/(.+\.glsl)/, (req, res) => {
        const filePath = req.params[0] // regex group
        console.log("glsl:", filePath, req.headers.accept)

        if (req.headers.accept === "application/x-shader") {
            fs.readFile(filePath, (err, data) => {
                const source = data.toString()
                const basedir = path.dirname(path.resolve(filePath))
                const compiledSource = glslify.compile(source, {basedir})
                res.json({
                    source,
                    compiledSource,
                })
            })
            return
        }

        // Otherwise, serve the shader page to the browser:
        res.sendFile(path.resolve(__dirname, "..", "html", "shader.html"))
    })

    // Everything that starts and ends with / shows directory listings:
    app.get(/^\/.*\/?$/, serveIndex(".", {view: "details"}))

    // Catch all for everything else:
    app.use(express.static(path.resolve(".")))

    return app
}
