import * as d3 from "d3"
import { Delaunay } from "d3-delaunay"

export const generateDelaunay = (svgRef, settings) => {
    console.log('generate delaunay, settings:', settings)
    if (settings === null) {
        return null
    }

    const {
        cavePositions,
        caveStartIndex,
        caveEndIndex,
        maxCaveRadius
    } = settings

    const {scaleX, scaleY} = determineGraphScale(cavePositions)

    const delaunay = new Delaunay(cavePositions.flat())
    const voronoi = delaunay.voronoi([0, 0, scaleX, scaleY])

    const svg = renderSVG(svgRef, scaleX, scaleY, voronoi, delaunay)
    const svgWithCircles = renderMaxCircles(svg, cavePositions, voronoi, maxCaveRadius)

    return svgWithCircles.node()
}

const determineGraphScale = (cavePositions) => {
    let maxX = 0;
    let maxY = 0;

    for (const [x, y] of cavePositions) {
        maxX = Math.max(maxX, x);

        maxY = Math.max(maxY, y);
    }

    console.log("maxX:", maxX);
    console.log("maxY:", maxY);

    return { scaleX: maxX + 100, scaleY: maxY + 100 }
}

const renderSVG = (svgRef, width, height, voronoi, delaunay) => {
    const svg = d3.select(svgRef.current)
        .attr("viewBox", [0, 0, width, height])

    // const svg = d3
    //     .select(rootElement)
    //     .attr("height", "100%")
    //     .attr("width", "100%")
    //     .attr("viewBox", [0, 0, width, height])

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

const addPosition = () => {
    const inputElement = document.getElementById('addPosition')
    const positionsList = document.getElementById('positionsList')

    try {
        const newPosition = inputElement.value
        if (newPosition.length !== 3 || isNaN(newPosition[0]) || isNaN(newPosition[2])) {
            throw new Error('SOME ERROR')
        }

        console.log('newPosition', newPosition)

        const pointHTML = `
                <div>
                    <input type="checkbox" name="selectedPoint" value="{index}" onclick="handleCheckboxClick(this)">
                    <span class="caveCentrePoint">[{x}, {y}]</span>
                </div>
            `

        const improvedPointHTML = adaptPointHTML(pointHTML, positionsList.children.length, newPosition[0], newPosition[2])

        console.log('radio button created\n', improvedPointHTML)

        // Create a temporary container element
        const tempContainer = document.createElement('div')

        // Set the HTML content of the container element
        tempContainer.innerHTML = improvedPointHTML

        // Append the container element (including the generated HTML) to the positionsList
        positionsList.appendChild(tempContainer)

        // Clear the input field
        inputElement.value = ''

    }
    catch (e) {
        alert('Invalid position format. Please enter a valid position as [x, y]. \n Error:', e)
    }
}

const adaptPointHTML = (pointHTML, index, x, y) => {
    const pointTemplate = pointHTML.replace(/{index}/g, index).replace(/{x}/g, x).replace(/{y}/g, y)
    return pointTemplate
}

const handleCheckboxClick = (clickedRadioButton) => {
    console.log('Selected Point Index:', clickedRadioButton.value)
}

const getPointsArray = () => {
    // const selectedRadio = document.querySelector('input[name="selectedPoint"]:checked')
    const points = document.getElementsByClassName('caveCentrePoint')

    // Convert HTMLCollection to array and map over each element
    const pointsArray = Array.from(points).map(point => {
        // Assuming the innerHTML is always in the format [x,y]
        return JSON.parse(point.innerHTML)
    })

    return pointsArray
}

// document.getElementById("getDelaunayData").addEventListener("click", function () {
//     const resultContainer = document.getElementById("delaunayResult")
//     const inputWidth = parseInt(document.getElementById("inputWidth").value, 10)
//     const inputHeight = parseInt(document.getElementById("inputHeight").value, 10)
//     const pointPositions = getPointsArray()
//     console.log('pointPositions', pointPositions)
//     const circleRadius = parseFloat(document.getElementById("circleRadius").value) || 5 // Set a default radius if not provided
//
//     // Clear previous content
//     resultContainer.innerHTML = ""
//
//     // Generate and append the SVG to the result container
//     const generatedSvg = generateDelaunay(inputWidth, inputHeight, pointPositions, circleRadius)
//     resultContainer.appendChild(generatedSvg)
// })
