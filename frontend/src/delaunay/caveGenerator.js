import { Delaunay } from 'd3-delaunay'
import { filter, find, findIndex, flatMap, map } from 'lodash'
import { findPaths } from '../util/findPaths.js'
import { PathFinder } from '../util/PathFinder.js'

export class CaveGenerator {
    constructor(points, canvas) {
        this.points = points

        this.canvas = canvas
        this.context = canvas.getContext('2d')

        // Scale context
        const sizeX = 1700
        const sizeY = 1700
        const dpr = 1
        canvas.width = sizeX * dpr
        canvas.height = sizeY * dpr
        this.context.scale(dpr, dpr)

        this.delaunay = Delaunay.from(this.points)
        this.voronoi = this.delaunay.voronoi([
            0,
            0,
            canvas.width,
            canvas.height,
        ])
        const voronoiPolygons = [...this.voronoi.cellPolygons()]
        this.polygonCells = this.points.map((point, index) => ({
            index: index,
            point: point,
            polygons: voronoiPolygons[index],
        }))
        this.context.strokeStyle = '#fff'

        this.highlightedCells = []
        this.noiseLevel = 0

        this.renderCanvas()

        this.initializePathfinder()
    }

    renderCanvas = () => {
        // console.log('this.highlightedCells', this.highlightedCells)
        for (const cell of this.polygonCells) {
            if (this.isCellHighlighted(cell.point)) {
                this.drawEmptyCell(
                    this.context,
                    cell,
                    filter(this.polygonCells, polygonCell =>
                        this.isCellHighlighted(polygonCell.point)
                    )
                )
            } else {
                if (this.highlightedCells.length === 0) {
                    this.drawCellPolygons(this.context, cell.polygons, '#000')
                }
            }
        }
    }

    isCellHighlighted = cellCheck => {
        const found = find(
            this.highlightedCells,
            cell => cell[0] === cellCheck[0] && cell[1] === cellCheck[1]
        )

        return found !== undefined
    }

    initializePathfinder = () => {
        this.neighborSet = map(this.points, (point, i) => ({
            pointIndex: i,
            neighbors: [...this.voronoi.neighbors(i)],
        }))
        this.edges = findPaths(this.points, this.neighborSet)
        this.pathFinder = new PathFinder({
            points: this.points,
            edges: this.edges,
        })
    }

    findCavePath = ({ startIndex, endIndex, noiseLevel }) => {
        const startPoint = this.points[startIndex]
        const endPoint = this.points[endIndex]
        this.noiseLevel = noiseLevel

        const shortestPath = this.pathFinder.findPath(startPoint, endPoint)
        this.pathDisplayed = shortestPath
        this.highlightedCells = flatMap(shortestPath.flat(), pathElement => [
            pathElement.a,
            pathElement.b,
        ])
    }

    removeDuplicatePolygons = points => {
        const uniquePoints = []
        const pointSet = new Set() // to keep track of unique points

        for (const point of points) {
            const key = point.join(',') // create a string representation of the point
            if (!pointSet.has(key)) {
                // check if the point is already in the set
                uniquePoints.push(point) // if not, add it to the unique points array
                pointSet.add(key) // add the string representation to the set
            }
        }

        return uniquePoints
    }

    drawEmptyCell = (context, cell, highlightedCellsFull) => {
        console.log('')
        console.log('')
        console.log('')
        console.log('')
        console.log('----------------')
        console.log('Draw Empty Cell ()')
        console.log('  cell', cell.point)
        console.log('  polygons', cell.polygons)
        console.log('----------------')
        console.log('')

        const polygons = this.removeDuplicatePolygons(cell.polygons)
        const cellCenter = cell.point

        const startIndex = this.findStartWallIndex(
            polygons,
            cellCenter,
            highlightedCellsFull
        )

        console.log('startIndex', startIndex)

        let totalWalls = []
        let currentWall = []
        console.log('')
        for (let i = 0; i < polygons.length; i++) {
            const realIndex =
                i + startIndex >= polygons.length
                    ? i + startIndex - polygons.length
                    : i + startIndex
            console.log('--------------------------')
            console.log('polygons[realIndex]', polygons[realIndex])
            if (
                this.polygonConnectsEmptyCells(
                    polygons[realIndex],
                    cellCenter,
                    highlightedCellsFull
                )
            ) {
                // Current wall has no polygons yet
                if (currentWall.length === 0) {
                    console.log('     start wall polygon')
                    currentWall.push(polygons[realIndex])
                }
                // Current wall already filled with polygons
                else {
                    console.log('     end wall polygon')
                    currentWall.push(polygons[realIndex])
                    totalWalls.push(currentWall)
                    currentWall = []
                }
            } else {
                console.log('     normal wall polygon')
                currentWall.push(polygons[realIndex])
            }
        }
        // Push the last wall
        if (currentWall.length !== 0) {
            totalWalls.push(currentWall)
        }

        console.log('totalWalls', totalWalls)
        map(totalWalls, wall => {
            const thickenedWall = this.thickenWall(wall, cellCenter)
            console.log('thickenedWall', thickenedWall)
            this.drawWall(context, thickenedWall)
        })
    }

    thickenWall = (wall, cellCenter) => {
        let thickenWallPolygons = []

        map(wall, polygon => {
            const { polygonOld, polygonNew } = this.thickenWallPolygon(
                polygon,
                cellCenter
            )
            thickenWallPolygons = [polygonNew, ...thickenWallPolygons]
        })

        const noisyPolygons = this.addNoise(thickenWallPolygons, cellCenter)
        console.log('thickenWallPolygons', thickenWallPolygons)
        console.log('noisyPolygons', noisyPolygons)
        return [...wall, ...noisyPolygons]
    }

    addNoise = (points, centerPoint, addMorePoints = true) => {
        console.log('addNoise() this.noiseLevel', this.noiseLevel)

        return flatMap(points, (point, index) => {
            const directionX = centerPoint[0] - point[0] > 0 ? 1 : -1
            const directionY = centerPoint[1] - point[1] > 0 ? 1 : -1

            const randomX = Math.random() * (this.noiseLevel - 0)
            const randomY = Math.random() * (this.noiseLevel - 0)

            const newPointX = point[0] + randomX * directionX
            const newPointY = point[1] + randomY * directionY

            let newRandomPoints = []
            // if there is a next point in array of points
            if (addMorePoints === true && points.length > index + 1) {
                newRandomPoints = this.addMoreRandomPointsInLine(
                    point,
                    points[index + 1],
                    centerPoint
                )
                console.log(' //// from point', point, 'and', points[index + 1])
                console.log(' //// generated noisy points', newRandomPoints)
            }

            return [[newPointX, newPointY], ...newRandomPoints]
        })
    }

    addMoreRandomPointsInLine = (point_a, point_b, centerPoint) => {
        const numberOfNewPoints = Math.random() * (10 - 0)
        const newPoints = this.generatePointsBetween(
            point_a,
            point_b,
            numberOfNewPoints
        )

        return this.addNoise(newPoints, centerPoint, false)
    }

    generatePointsBetween = (a, b, n) => {
        const points = []
        const dx = (b[0] - a[0]) / (n + 1) // calculate the change in x
        const dy = (b[1] - a[1]) / (n + 1) // calculate the change in y

        for (let i = 1; i <= n; i++) {
            const x = a[0] + dx * i // interpolate x coordinate
            const y = a[1] + dy * i // interpolate y coordinate
            points.push([x, y]) // add the point to the array
        }

        return points
    }

    drawWall = (context, wall) => {
        console.log('drawing wall', wall)
        context.fillStyle = 'red'
        this.drawCell(context, wall)
        context.fill()
        // context.stroke()
        context.closePath()

        // Connect duplicated vertices to create the wall
        context.beginPath()
        context.moveTo(wall[0][0], wall[0][1])
        for (let i = 1; i < wall.length; i++) {
            context.lineTo(wall[i][0], wall[i][1])
        }
        context.closePath()
    }

    findStartWallIndex = (polygons, cellCenter, highlightedCellsFull) => {
        for (let i = 0; i < polygons.length; i++) {
            if (
                this.polygonConnectsEmptyCells(
                    polygons[i],
                    cellCenter,
                    highlightedCellsFull
                ) === true &&
                this.polygonConnectsEmptyCells(
                    polygons[polygons.length === i + 1 ? 0 : i + 1],
                    cellCenter,
                    highlightedCellsFull
                ) === false
            ) {
                return i
            }
        }

        return -1
    }

    // Check if ny other highlightedCell shares the same polygon
    polygonConnectsEmptyCells = (
        polygonLookingFor,
        cellPoint,
        highlightedCellsFull
    ) => {
        // console.log('highlightedCellsFull', highlightedCellsFull)
        const found = find(highlightedCellsFull, highlightedCell => {
            // if this is the same cell as the one we currently use
            if (this.coordinateSimilar(highlightedCell.point, cellPoint)) {
                return false
            }

            const foundPolygon = find(highlightedCell.polygons, polygon => {
                if (this.coordinateSimilar(polygon, polygonLookingFor)) {
                    // console.log('cell centres', cellPoint, highlightedCell.point)
                    return true
                }
            })

            return foundPolygon !== undefined
        })
        return found !== undefined
    }

    coordinateSimilar = (pointA, pointB) =>
        pointA[0] === pointB[0] && pointA[1] === pointB[1]

    thickenWallPolygon = (polygon, centerPoint) => {
        // Calculate the direction vector from the vertex to the center
        const directionX = centerPoint[0] - polygon[0]
        const directionY = centerPoint[1] - polygon[1]

        // Normalize the direction vector
        const magnitude = Math.sqrt(
            directionX * directionX + directionY * directionY
        )
        const normalizedDirectionX = directionX / magnitude
        const normalizedDirectionY = directionY / magnitude

        // Expand the vertex in the direction of the center by 5 units
        const expandedVertexX = polygon[0] + normalizedDirectionX * 10
        const expandedVertexY = polygon[1] + normalizedDirectionY * 10

        const expandedPolygon = [expandedVertexX, expandedVertexY]

        return { polygonOld: polygon, polygonNew: expandedPolygon }
    }

    drawCellPolygons = (context, polygons, fill) => {
        const bounds = this.getPolygonBounds(polygons)
        context.fillStyle = fill ? fill : this.getGradient(context, bounds)
        this.drawCell(context, polygons)
        context.fill()
        context.stroke()
        context.closePath()
    }

    drawCell = (context, cell) => {
        context.beginPath()
        context.moveTo(cell[0][0], cell[0][1])
        for (let j = 1, m = cell.length; j < m; ++j) {
            context.lineTo(cell[j][0], cell[j][1])
        }
        context.closePath()
    }

    getPolygonBounds = polygon => {
        let minX, minY, maxX, maxY
        for (let point of polygon) {
            minX = Math.min(point[0], minX || Infinity)
            minY = Math.min(point[1], minY || Infinity)
            maxX = Math.max(point[0], maxX || -Infinity)
            maxY = Math.max(point[1], maxY || -Infinity)
        }
        return [minX, minY, maxX, maxY]
    }

    getColor = () => {
        const colors = [`#a4ab1d`, `#715440`, `#258133`, `#258133`, `#D2952a`]
        return colors[Math.floor(Math.random() * colors.length)]
    }

    darkenColor = color => {
        const colors = [color.slice(1, 3), color.slice(3, 5), color.slice(5, 7)]
        const hexNumbers = colors.map(c =>
            Math.abs(parseInt(c, 16) - 15).toString(16)
        )
        return `#${hexNumbers.map(n => (n.length < 2 ? `0${n}` : n)).join('')}`
    }

    getGradient = (context, bounds) => {
        const gradient = context.createLinearGradient(...bounds)
        const color = this.getColor()
        const darkerColor = this.darkenColor(color)

        for (let i = 0; i < 1; i += 0.025) {
            gradient.addColorStop(i, color)
            gradient.addColorStop(i + 0.003, color)
            gradient.addColorStop(i + 0.01, darkerColor)
            gradient.addColorStop(i + 0.02, darkerColor)
            gradient.addColorStop(i + 0.024, color)
        }
        return gradient
    }
}
