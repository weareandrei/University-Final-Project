import { Delaunay } from "d3-delaunay"

const points = [[0, 0], [0, 1], [1, 0], [1, 1]]
const delaunay = Delaunay.from(points)
const result = delaunay.render()

console.log(result)

// const voronoi = delaunay.voronoi([0, 0, 960, 500])
