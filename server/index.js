#!/usr/bin/env node

const express = require("express")
const path = require("path")

const PORT = 3000 // TODO: arg

const app = express()

app.get("/bundle.js", (req, res) => {
    res.sendFile(path.resolve(__dirname, "..", "build", "bundle.js"))
})

app.get(/^\/(.+\.glsl)/, (req, res) => {
    const filePath = req.params[0] // regex group
    console.log("glsl:", filePath, req.headers.accept)

    if (req.headers.accept === "application/x-shader") {
        // TODO: read the file, "compile" it, send it back in JSON body
        res.sendFile(path.resolve(".", filePath), {
            headers: {
                "Content-Type": "text/plain; charset=utf-8"
            }
        })
        return
    }

    // Otherwise, serve the shader page to the browser:
    res.sendFile(path.resolve(__dirname, "..", "html", "shader.html"))
})

// Catch-all for everything else:
app.get(/^\/.*/, (req, res) => {
    console.log("catch all:", req.path)
    // TODO: if req.path is a directory, list files, otherwise show an error
    res.sendFile(path.resolve(__dirname, "..", "html", "index.html"))
})

app.listen(PORT, () => {
    console.log(`shader server listening on port ${PORT}!`)
})
