import { Delaunay } from 'd3-delaunay'
import { filter, find, findIndex, flatMap, map } from 'lodash'
import { findPaths } from '../util/findPaths.js'
import { PathFinder } from '../util/PathFinder.js'

const TREE_DISTANCE_VARIATION = 100
const TREE_DENSITY = 0.1
const TREE_MAX_SIZE = 5

export class DelaunayGraph2 {
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
        this.context.strokeStyle = '#040'

        this.highlightedCells = []

        this.renderCanvas()

        this.initializePathfinder()
    }

    renderCanvas = () => {
        // console.log('this.highlightedCells', this.highlightedCells)
        for (const cell of this.polygonCells) {
            if (this.isCellHighlighted(cell.point)) {
                drawEmptyCell(
                    this.context,
                    cell,
                    filter(this.polygonCells, polygonCell =>
                        this.isCellHighlighted(polygonCell.point)
                    )
                )
            } else {
                if (this.highlightedCells.length === 0) {
                    drawCellPolygons(this.context, cell.polygons, '#000')
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

    findCavePath = ({ startIndex, endIndex }) => {
        const startPoint = this.points[startIndex]
        const endPoint = this.points[endIndex]

        const shortestPath = this.pathFinder.findPath(startPoint, endPoint)
        this.pathDisplayed = shortestPath
        this.highlightedCells = flatMap(shortestPath.flat(), pathElement => [
            pathElement.a,
            pathElement.b,
        ])
    }
}

const drawEmptyCell = (context, cell, highlightedCellsFull) => {
    const polygons = cell.polygons
    const cellCenter = cell.point

    const startIndex = findStartWallIndex(
        polygons,
        cellCenter,
        highlightedCellsFull
    )

    console.log('startIndex', startIndex)

    let totalWalls = []
    let currentWall = []
    console.log('')
    console.log('')
    for (let i = 0; i < polygons.length; i++) {
        const realIndex = i+startIndex >= polygons.length  ? (i+startIndex - polygons.length) : i+startIndex
        console.log('--------------------------')
        console.log('cellCentre ', cellCenter, 'polygons[realIndex]', polygons[realIndex])
        if (
            polygonConnectsEmptyCells(
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

    map(totalWalls, (wall) => {
        const thickenedWall = thickenWall(wall, cellCenter)
        drawWall(context, thickenedWall)
    })
}

const thickenWall = (wall, cellCenter) => {
    return flatMap(wall, polygon =>
        thickenWallPolygon(polygon, cellCenter)
    )
}

const drawWall = (context, wall) => {
    context.fillStyle = '#fff'
    drawCell(context, wall)
    context.fill()
    context.stroke()
    context.closePath()

    // Connect duplicated vertices to create the wall
    context.beginPath()
    context.moveTo(wall[0][0], wall[0][1])
    for (let i = 1; i < wall.length; i++) {
        context.lineTo(wall[i][0], wall[i][1])
    }
    context.closePath()
}

const findStartWallIndex = (polygons, cellCenter,
                            highlightedCellsFull) => {
    for (let i = 0; i < polygons.length; i++) {
        if (
            polygonConnectsEmptyCells(
                polygons[i],
                cellCenter,
                highlightedCellsFull
            ) === true && polygonConnectsEmptyCells(
                polygons[polygons.length === i+1 ? 0 : i+1],
                cellCenter,
                highlightedCellsFull
            ) === false
        ) {
            return i
        }
    }

    return -1
}

const mergeWallExits = walls => {
    let wallUpdated = walls

    console.log('')
    console.log('')
    console.log('mergeWallExits for', walls)

    // indices
    const exit_a = findExitSet(walls, undefined)
    const exit_b = findExitSet(walls, exit_a.index)
    console.log('[exit_a, exit_b]: ', [exit_a, exit_b])

    // -------------------------------
    // ------ tackle 3 scenarios :
    // -------------------------------

    // [ exit , _ , _ , _ , _ , exit]
    if (exit_a.index === 0 && exit_b.index === walls.length - 1) {
        // merge exits
        wallUpdated[1] = [walls[1], ...walls[0]]
        wallUpdated[walls.length - 2] = [
            walls[walls.length - 2],
            ...walls[walls.length - 1],
        ]

        // remove exits arrays
        wallUpdated.slice(0, 1)
        wallUpdated.slice(walls.length - 1, 1)
    }

    // [ exit, exit , _ , _ , _ , _ ]
    if (
        (exit_a.index === 0 && exit_b.index === 1) ||
        (exit_a.index === 1 && exit_b.index === 0)
    ) {
        // merge exits
        wallUpdated[2] = [walls[2], ...walls[1]]
        wallUpdated[walls.length - 1] = [walls[walls.length - 1], ...walls[0]]

        // remove exits arrays
        wallUpdated.slice(0, 2)
    }

    // [  _ , _ , _ , _ , exit, exit ]
    if (
        (exit_a.index === walls.length - 1 &&
            exit_b.index === walls.length - 2) ||
        (exit_a.index === walls.length - 2 && exit_b.index === walls.length - 1)
    ) {
        // merge exits
        wallUpdated[0] = [walls[0], ...walls[walls.length - 1]]
        wallUpdated[walls.length - 3] = [
            walls[walls.length - 2],
            ...walls[walls.length - 3],
        ]

        // remove exits arrays
        wallUpdated.slice(walls.length - 2, 2)
    }

    console.log('wallUpdated')
    console.log('')
    console.log('')

    return wallUpdated
}

const findExitSet = (walls, missIndex = undefined) => {
    const foundExit = find(walls, (wallSet, index) => {
        if (wallSet.length === 2) {
            if (missIndex !== undefined) {
                return index !== missIndex
            }

            return true
        }
    })

    const foundExitIndex = findIndex(walls, (wallSet, index) => {
        if (wallSet.length === 2) {
            if (missIndex !== undefined) {
                return index !== missIndex
            }
            return true
        }
    })

    console.log('{ foundExit, foundExitIndex }', {
        exit: foundExit,
        index: foundExitIndex,
    })

    return { exit: foundExit, index: foundExitIndex }
}

// Check if ny other highlightedCell shares the same polygon
const polygonConnectsEmptyCells = (
    polygonLookingFor,
    cellPoint,
    highlightedCellsFull
) => {
    // console.log('highlightedCellsFull', highlightedCellsFull)
    const found = find(highlightedCellsFull, highlightedCell => {
        // if this is the same cell as the one we currently use
        if (coordinateSimilar(highlightedCell.point, cellPoint)) {
            return false
        }

        const foundPolygon = find(highlightedCell.polygons, polygon => {
            if (coordinateSimilar(polygon, polygonLookingFor)) {
                // console.log('cell centres', cellPoint, highlightedCell.point)
                return true
            }
        })

        return foundPolygon !== undefined
    })
    return found !== undefined
}

const coordinateSimilar = (pointA, pointB) =>
    pointA[0] === pointB[0] && pointA[1] === pointB[1]

const thickenWallPolygon = (polygon, centerPoint) => {
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
    const expandedVertexX = polygon[0] + normalizedDirectionX * 20
    const expandedVertexY = polygon[1] + normalizedDirectionY * 20

    const expandedPolygon = [expandedVertexX, expandedVertexY]

    return [polygon, expandedPolygon]
}

const drawCellPolygons = (context, polygons, fill) => {
    const bounds = getPolygonBounds(polygons)
    context.fillStyle = fill ? fill : getGradient(context, bounds)
    drawCell(context, polygons)
    context.fill()
    context.stroke()
    context.closePath()
}

const randomPoints = numberOfPoints => {
    const points = []
    for (let i = 0; i < numberOfPoints; i++) {
        const point = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
        }
        points.push(point)
    }
    return points
}

function drawCell(context, cell) {
    context.beginPath()
    context.moveTo(cell[0][0], cell[0][1])
    for (let j = 1, m = cell.length; j < m; ++j) {
        context.lineTo(cell[j][0], cell[j][1])
    }
    context.closePath()
}

function drawTrees(context) {
    for (let treeLine of treeLines) {
        const startPoint = { x: treeLine[0][0], y: treeLine[0][1] }
        const endPoint = { x: treeLine[1][0], y: treeLine[1][1] }
        const dx = endPoint.x - startPoint.x
        const dy = endPoint.y - startPoint.y
        const treeCount = Math.sqrt(dx ** 2 + dy ** 2) * TREE_DENSITY
        for (let point = 0; point < treeCount; point++) {
            context.beginPath()
            context.fillStyle = Math.random() < 0.5 ? '#040' : '#060'
            context.arc(
                startPoint.x +
                    point * (dx / treeCount) +
                    (-TREE_DISTANCE_VARIATION / 2 +
                        Math.random() * TREE_DISTANCE_VARIATION),
                startPoint.y +
                    point * (dy / treeCount) +
                    (-TREE_DISTANCE_VARIATION / 2 +
                        Math.random() * TREE_DISTANCE_VARIATION),
                Math.random() * TREE_MAX_SIZE,
                0,
                Math.PI * 2
            )
            context.fill()
        }
    }
}

function getPolygonBounds(polygon) {
    let minX, minY, maxX, maxY
    for (let point of polygon) {
        minX = Math.min(point[0], minX || Infinity)
        minY = Math.min(point[1], minY || Infinity)
        maxX = Math.max(point[0], maxX || -Infinity)
        maxY = Math.max(point[1], maxY || -Infinity)
    }
    return [minX, minY, maxX, maxY]
}

function getColor() {
    const colors = [`#a4ab1d`, `#715440`, `#258133`, `#258133`, `#D2952a`]
    return colors[Math.floor(Math.random() * colors.length)]
}

function darkenColor(color) {
    const colors = [color.slice(1, 3), color.slice(3, 5), color.slice(5, 7)]
    const hexNumbers = colors.map(c =>
        Math.abs(parseInt(c, 16) - 15).toString(16)
    )
    return `#${hexNumbers.map(n => (n.length < 2 ? `0${n}` : n)).join('')}`
}

function getGradient(context, bounds) {
    const gradient = context.createLinearGradient(...bounds)
    const color = getColor()
    const darkerColor = darkenColor(color)

    for (let i = 0; i < 1; i += 0.025) {
        gradient.addColorStop(i, color)
        gradient.addColorStop(i + 0.003, color)
        gradient.addColorStop(i + 0.01, darkerColor)
        gradient.addColorStop(i + 0.02, darkerColor)
        gradient.addColorStop(i + 0.024, color)
    }
    return gradient
}
