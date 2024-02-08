import * as d3 from "https://cdn.skypack.dev/d3@7"
import { Delaunay } from "https://cdn.skypack.dev/d3-delaunay@6"

function generateDelaunay() {
    const height = document.body.clientHeight
    const width = document.body.clientWidth

    const n = 100
    const positions = Float64Array.from(
        { length: n * 2 },
        (_, i) => Math.random() * (i & 1 ? height : width)
    )

    const delaunay = new Delaunay(positions)
    const voronoi = delaunay.voronoi([0.5, 0.5, width - 0.5, height - 0.5])

    const element = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    const svg = d3
        .select(element)
        .attr("height", "100%")
        .attr("width", "100%")
        .attr("viewBox", [0, 0, width, height])

    svg
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "#826434")
        .attr("stroke-width", 8)
        .attr("d", voronoi.render())

    svg
        .append("path")
        .attr("fill", "#a81720")
        .attr("stroke", "#a81720")
        .attr("stroke-width", 8)
        .attr("d", delaunay.renderPoints(null, 2))

    return svg.node()
}

document.getElementById("getDelaunayData").addEventListener("click", function () {
    const resultContainer = document.getElementById("delaunayResult")

    // Clear previous content
    resultContainer.innerHTML = ""

    // Generate and append the SVG to the result container
    const generatedSvg = generateDelaunay()
    resultContainer.appendChild(generatedSvg)
})
