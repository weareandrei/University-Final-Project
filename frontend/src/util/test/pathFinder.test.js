import {PathFinder} from "../PathFinder.js"
import {map} from "lodash"
import {findPaths} from "../findPaths.js"
import {Delaunay} from "d3-delaunay"

const run = () => {
    const points = [[100,200], [400,100], [900,150], [340,800], [180,420], [110,610]]

    const delaunay = new Delaunay(points.flat())
    const voronoi = delaunay.voronoi([0, 0, 1000, 1000])

    const neighborSet = map(points, (point, i) => ({
        pointIndex: i,
        neighbors: [...voronoi.neighbors(i)]
    }))
    const edges = findPaths(points, neighborSet)
    // edge = {
    //     a: [],
    //     b: [],
    //     distance: 0
    //  }

    const pathFinder = new PathFinder({
        points: points,
        edges: edges
    })

    const shortestPath = pathFinder.findPath(points[0], points[3])
    console.log('shortestPath')
}

run()
