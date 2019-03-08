#!/usr/bin/env node

const express = require('express')
const path = require('path')

const PORT = 3000 // TODO: arg

const app = express()

app.use(express.static("static"))

app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, "..", "index.html"))
})

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`)
})
