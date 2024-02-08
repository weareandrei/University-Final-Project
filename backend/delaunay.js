import { Delaunay } from "d3-delaunay"

export const drawDelaunay = (height, width) => {
    // const points = [[0, 0], [0, 1], [1, 0], [1, 1]]
    // const delaunay = Delaunay.from(points)
    // return delaunay.render()

    const delaunay = new Delaunay([[0, 0], [0, 1], [1, 0], [1, 1]])

    // const data = Array(100)
    //     .fill()
    //     .map((_, i) => ({ x: (i * width) / 100, y: Math.random() * height }))
    //
    // const voronoi = Delaunay.from(
    //     data,
    //     (d) => d.x,
    //     (d) => d.y
    // ).voronoi([0, 0, width, height])

    return delaunay
}

