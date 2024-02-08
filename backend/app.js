import express from 'express'
const app = express()
const port = 3000

import {drawDelaunay} from "./delaunay.js"

app.use(express.static('../frontend'))

app.get('/api/delaunay', (req, res) => {
    // Call the drawDelaunay function
    const result = drawDelaunay(req.query.h, req.query.w)

    // Send the result back to the frontend
    res.json({ result })
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})
