const fs = require("fs")
const path = require("path")

const express = require("express")
const glslify = require("glslify")

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
        let compiledSource;
        try {
            compiledSource = glslify.compile(source, {basedir})
        } catch(e) {
            console.error("glslify:", e.message)
            res.status(500)
            res.json({error: `glslify: ${e.message}`})
            return
        }

        res.json({source, compiledSource})
    })
}

function serveListing(reqPath, res) {
    // Normalization and sanitation based on
    // https://github.com/expressjs/serve-index/blob/fcad6767/index.js#L116-L129

    const rootPath = path.normalize(path.resolve(".") + path.sep);
    const dirPath = path.normalize(path.join(rootPath, reqPath));

    // null byte(s), bad request
    if (~dirPath.indexOf('\0')) {
        res.status(400);
        res.json({error: "bad path"})
        return;
    }

    // malicious path
    if ((dirPath + path.sep).substr(0, rootPath.length) !== rootPath) {
        res.status(403);
        res.json({error: "illegal path"})
        return;
    }

    // determine ".." display
    var showUp = path.normalize(path.resolve(dirPath) + path.sep) !== rootPath;

    fs.readdir(dirPath, {withFileTypes: true}, (error, dirents) => {
        if (error) {
            console.error("error reading directory:", error)
            if (error.code === "ENOENT") {
                res.status(404)
                res.json({error: "not found"})
                return
            }
            res.status(500)
            res.json({error})
            return
        }

        const dirs = dirents.filter((dirent) => dirent.isDirectory())
        const files = dirents.filter((dirent) => dirent.isFile())

        const entries = []
        if (showUp) {
            entries.push({
                url: "..",
                name: "..",
            })
        }

        dirs.forEach((dir) => {
            entries.push({
                url: path.join(".", dir.name) + path.sep,
                name: dir.name + path.sep,
            })
        })

        files.forEach((file) => {
            entries.push({
                url: path.join(".", file.name),
                name: file.name,
            })
        })

        res.json({entries})
    })
}

module.exports = function() {
    const app = express()

    const shaderJS = path.resolve(__dirname, "..", "build", "shader.js")
    const shaderHTML = path.resolve(__dirname, "..", "html", "shader.html")

    const listingJS = path.resolve(__dirname, "..", "build", "listing.js")
    const listingHTML = path.resolve(__dirname, "..", "html", "listing.html")

    app.get("/shader.js", (req, res) => {
        res.sendFile(shaderJS)
    })

    app.get("/listing.js", (req, res) => {
        res.sendFile(listingJS)
    })

    app.get(/^\/(.+\.glsl)/, (req, res) => {
        if (req.query.shader) {
            const filePath = req.params[0] // first regex group
            serveShader(filePath, res)
            return
        }

        // Otherwise, serve the shader page to the browser:
        res.sendFile(shaderHTML)
    })

    // Everything that starts and ends with / shows directory listings:
    app.get(/^\/(?:.+\/)*$/, (req, res) => {
        if (req.query.listing) {
            serveListing(req.path, res)
            return
        }

        // Otherwise, serve the listing page to the browser:
        res.sendFile(listingHTML)
    })

    // Catch all for everything else serves a file directly (e.g. a texture
    // image), relative to the working directory.
    app.use(express.static(path.resolve(".")))

    return app
}
