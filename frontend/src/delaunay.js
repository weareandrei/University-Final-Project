import * as d3 from "https://cdn.skypack.dev/d3@7"
import { Delaunay } from "https://cdn.skypack.dev/d3-delaunay@6"

const generateDelaunay = (width, height, positions, maxCirleRadius) => {
    const positionsFlatten = positions.flat()

    const delaunay = new Delaunay(positionsFlatten)
    const voronoi = delaunay.voronoi([0, 0, width, height])

    const svg = renderSVG(width, height, voronoi, delaunay)
    const svgWithCircles = renderMaxCircles(svg, positions, voronoi, maxCirleRadius)

    return svgWithCircles.node()
}

const renderSVG = (width, height, voronoi, delaunay) => {
    const rootElement = document.createElementNS("http://www.w3.org/2000/svg", "svg")

    const svg = d3
        .select(rootElement)
        .attr("height", "100%")
        .attr("width", "100%")
        .attr("viewBox", [0, 0, width, height])

    // Render Voronoi diagram
    // console.log('voronoi diagram: ', voronoi)
    svg
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "#826434")
        .attr("stroke-width", 8)
        .attr("d", voronoi.render())

    // Render Delaunay points
    // console.log('delaunay points: ', delaunay)
    svg
        .append("path")
        .attr("fill", "#a81720")
        .attr("stroke", "#a81720")
        .attr("stroke-width", 8)
        .attr("d", delaunay.renderPoints(null, 2))

    return svg
}

const renderMaxCircles = (svg, positions, voronoi, maxCirleRadius) => {
    const cellPolygons = Array.from(voronoi.cellPolygons())
    console.log('cellPolygons from voronoi', cellPolygons)
    console.log('\n\n\n')

    // Create a group for circles
    const circlesGroup = svg.append("g")

    // Append circles to the group with adjusted radius and position
    positions.forEach((position, index) => {
        console.log('POSITION: ', position)
        console.log('INDEX: ', index)

        const circle = circlesGroup
            .append("circle")
            .attr("cx", position[0])
            .attr("cy", position[1])
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", 8)


        // Get the list of neighbour points
        const neighbours = voronoi.neighbors(index)
        const closestNeighbourDistance = findClosestNeighbourDistance(position, positions, maxCirleRadius)
        console.log('closestNeighbourDistance', closestNeighbourDistance)

        if (closestNeighbourDistance > maxCirleRadius) {
            circle.attr("r", maxCirleRadius)
        } else {
            circle.attr("r", closestNeighbourDistance / 2)

        }

        console.log('\n\n\n')
    })

    return svg
}
const findClosestNeighbourDistance = (currentPosition, neighbourPositions, maxCirleRadius) => {
    let smallestDistance = maxCirleRadius

    for (let index = 0; index < neighbourPositions.length; index++) {
        const neighbourPosition = neighbourPositions[index]

        if (currentPosition[0] === neighbourPosition[0] && currentPosition[1] === neighbourPosition[1]) {
            continue
        }

        const distance = calculateDistance(currentPosition[0], currentPosition[1], neighbourPosition[0], neighbourPosition[1])
        if (distance < smallestDistance) {
            smallestDistance = distance
        }

    }

    return smallestDistance
}

const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

document.getElementById("getDelaunayData").addEventListener("click", function () {
    const resultContainer = document.getElementById("delaunayResult")
    const inputWidth = parseInt(document.getElementById("inputWidth").value, 10)
    const inputHeight = parseInt(document.getElementById("inputHeight").value, 10)
    const inputPositions = JSON.parse(document.getElementById("inputPositions").value)
    const circleRadius = parseFloat(document.getElementById("circleRadius").value) || 5 // Set a default radius if not provided

    // Clear previous content
    resultContainer.innerHTML = ""

    // Generate and append the SVG to the result container
    const generatedSvg = generateDelaunay(inputWidth, inputHeight, inputPositions, circleRadius)
    resultContainer.appendChild(generatedSvg)
})
