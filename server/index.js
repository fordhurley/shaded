#!/usr/bin/env node

const express = require("express")
const path = require("path")

const PORT = 3000 // TODO: arg

const app = express()

app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "..", "index.html"))
})

app.get("/bundle.js", (req, res) => {
    res.sendFile(path.resolve(__dirname, "..", "build", "bundle.js"))
})

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`)
})
