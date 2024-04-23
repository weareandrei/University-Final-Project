// dijkstra paths stored


import {Delaunay} from "d3-delaunay";
import {filter, map} from "lodash";

class PathFinder {

    constructor(graph) {
        this.points = graph.points
        this.edges = graph.edges

        this.currentPathfindingProgress = []
    }

    findPath = (startPoint, endPoint) => {
        // Initialize first paths with 1 edge each. Each edge is the edge adjacent to startPoint
        this.initializePaths(startPoint)
        console.log('this.currentPathfindingProgress', this.currentPathfindingProgress)
        return ['1']
    }

    initializePaths = (startPoint) => {
        const adjacentEdges = this.findAdjacentEdges(startPoint)
        console.log('adjacentEdges', adjacentEdges)
        console.log('this.edges', this.edges)
        console.log('startPoint', startPoint)
        this.currentPathfindingProgress = map(adjacentEdges, (edge) => ({
            path: [edge],
            totalCost: edge.distance
        }))
    }

    findAdjacentEdges = (startPoint) =>
        filter(this.edges, (edge) =>
            (edge.a[0] === startPoint[0] && edge.a[1] === startPoint[1])
            ||
            (edge.b[0] === startPoint[0] && edge.b[1] === startPoint[1]))
}





export default PathFinder
