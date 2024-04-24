import {measureDistanceBetweenPoints} from "./measureDistanceBetweenPoints.js"
import {find, map} from "lodash"

export const findPaths = (points, neighborSets) => {
    const paths = [];

    for (let i = 0; i < points.length; i++) {
        const point_a = points[i];
        const neighbors = findNeighborCoordinates(i, neighborSets, points)

        for (let j = 0; j < neighbors.length; j++) {
            const point_b = neighbors[j];
            const distance = measureDistanceBetweenPoints(point_a, point_b);
            if (!pathAlreadyExists(paths, point_a, point_b)) {
                paths.push({
                    a: point_a,
                    b: point_b,
                    distance: distance
                })
            }
        }
    }

    return paths
}

const pathAlreadyExists = (paths, point1, point2) => {
    const found = find(paths, (path) => {
        if (path.a === point1 && path.b === point2) {
            return true
        }
        if (path.a === point2 && path.b === point1) {
            return true
        }

    })
    return found !== undefined
}

const findNeighborCoordinates = (index, neighborSets, points) => {
    const neighborSet = find(neighborSets, (neighborSet) => neighborSet.pointIndex === index)
    return map(neighborSet.neighbors, (neighborIndex) => points[neighborIndex])
}

// export default findPaths;
// module.exports = findPaths // for testing
