#!/usr/bin/env node

const fs = require("fs")
const path = require("path")

const express = require("express")
const glslify = require("glslify")
const serveIndex = require("serve-index")

const PORT = 3000 // TODO: arg

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
            const compiledSource = glslify.compile(source, {basedir: path.dirname(path.resolve(filePath))})
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

// Catch-all for everything else shows directory listings:
app.get(/^\/.*/, serveIndex(".", {view: "details"}))

app.listen(PORT, () => {
    console.log(`shader server listening on port ${PORT}!`)
})
