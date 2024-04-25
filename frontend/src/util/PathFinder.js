import {filter, flatMap, find, map} from "lodash"

export class PathFinder {

    constructor(graph) {
        this.points = graph.points
        this.edges = graph.edges

        this.currentPathfindingProgress = []
        // this.currentPathfindingProgress = [
        //     {
        //         path: [
        //             {a: [float, float], b: [float, float], distance: float},
        //             {a: [float, float], b: [float, float], distance: float},
        //             {a: [float, float], b: [float, float], distance: float}
        //         ],
        //         totalCost: float,
        //         reachedDestination: boolean
        //     },
        //     ...
        // ]
    }

    findPath = (startPoint, endPoint) => {
        // Initialize first paths with 1 edge each. Each edge is the edge adjacent to startPoint
        this.initializePaths(startPoint)
        let count = 0

        while(count < 1000 && !this.foundShortestPath()) {
            count++
            this.progressPathFinding(endPoint)
        }

        const shortestPath = this.getShortestPath(this.currentPathfindingProgress)
        console.log('final shortestPath', shortestPath)

        return shortestPath
    }

    progressPathFinding = (destination) => {
        // console.log('')
        // console.log('')
        // console.log('progressPathFinding()')
        // console.log('')

        console.log('this.currentPathfindingProgress', this.currentPathfindingProgress)
        // console.log('')
        this.currentPathfindingProgress = flatMap(this.currentPathfindingProgress, (pathProgress) => {

            // console.log('destination', destination)
            // console.log('pathProgress', pathProgress)

            // if already reached destination -> don't progress
            if (pathProgress.reachedDestination) {
                return pathProgress
            }

            const lastPoint = [pathProgress.path[pathProgress.path.length - 1].b[0], pathProgress.path[pathProgress.path.length - 1].b[1]] // [x,y]
            const adjacentEdges = this.findAdjacentEdges(lastPoint)
            // console.log('adjacentEdges', adjacentEdges)

            // console.log('')
            // console.log('-- newPaths forming')
            const newPaths = flatMap(adjacentEdges, (adjacentEdge) => {
                // console.log('  adjacentEdge', adjacentEdge)
                // console.log('  checking this.edgeAlreadyInPath()', pathProgress.path, adjacentEdge)
                // check if this adjacent edge is not in current path
                if (this.edgeAlreadyInPath(pathProgress.path, adjacentEdge)) {
                    // console.log('  edgeAlreadyInPath')
                    return []
                }
                // console.log('  !edgeAlreadyInPath')

                const newPathEdges = [...pathProgress.path, adjacentEdge]
                // console.log('  updated path =', newPathEdges)
                return {
                    path: newPathEdges,
                    totalCost: this.findTotalCost(newPathEdges),
                    reachedDestination: newPathEdges[newPathEdges.length - 1].b[0] === destination[0] && newPathEdges[newPathEdges.length - 1].b[1] === destination[1]
                }
            })

            return newPaths
        })
    }

    edgeAlreadyInPath = (path, requiredEdge) => {
        const foundEdge = find(path, (edge) => {
            const edgeFound =
                (edge.a[0] === requiredEdge.a[0] && edge.a[1] === requiredEdge.a[1])
                &&
                (edge.b[0] === requiredEdge.b[0] && edge.b[1] === requiredEdge.b[1])
                ||
                (edge.a[0] === requiredEdge.b[0] && edge.a[1] === requiredEdge.b[1])
                &&
                (edge.b[0] === requiredEdge.a[0] && edge.b[1] === requiredEdge.a[1])
            return edgeFound
        })

        return foundEdge !== undefined
    }

    getShortestPath = (paths) => {
        let shortestDistance = Infinity
        let shortestPath = undefined

        map(paths, (path) => {
            if (!path.reachedDestination) {
                return false
            }

            if (path.totalCost < shortestDistance) {
                shortestPath = path.path
                shortestDistance = path.totalCost
            }
        })

        console.log('getShortestPath, shortestPath =', shortestPath)
        return shortestPath
    }

    findTotalCost = (path) => {
        let totalPathCost = 0
        map(path, (edge) => {
            totalPathCost = totalPathCost + edge.distance
        })

        return totalPathCost
    }

    foundShortestPath = () => {
        const shortestPath = this.getShortestPath(this.currentPathfindingProgress)
        return shortestPath !== undefined
    }

    initializePaths = (startPoint) => {
        // console.log('initializePaths')
        const adjacentEdges = this.findAdjacentEdges(startPoint)
        // console.log('adjacentEdges to point', startPoint)
        // console.log('adjacentEdges =', adjacentEdges)
        this.currentPathfindingProgress = map(adjacentEdges, (edge) => ({
            path: [edge],
            totalCost: edge.distance,
            reachedDestination: false
        }))
    }

    findAdjacentEdges = (startPoint) => {
        const adjacentEdges = filter(this.edges, (edge) =>
          (edge.a[0] === startPoint[0] && edge.a[1] === startPoint[1])
          ||
          (edge.b[0] === startPoint[0] && edge.b[1] === startPoint[1]))

        const correctlyRotatedEdges = map(adjacentEdges, (edge) =>
            edge.b[0] === startPoint[0] && edge.b[1] === startPoint[1] ? {
                  a: edge.b,
                  b: edge.a,
                  distance: edge.distance,
              } : edge
        )

        return correctlyRotatedEdges
    }
}

// export default PathFinder
// module.exports = PathFinder // for testing
