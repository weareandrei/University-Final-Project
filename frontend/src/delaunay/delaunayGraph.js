import * as d3 from "d3"
import { Delaunay } from "d3-delaunay"
import {findPaths} from "../util/findPaths.js"
import {map} from "lodash"
import {PathFinder} from "../util/PathFinder.js";

export class DelaunayGraph {



    constructor(settings) {
        this.cavePositions = settings.cavePositions
        this.maxCaveRadius = settings.maxCaveRadius

        this.determineGraphScale(this.cavePositions)

        this.delaunay = new Delaunay(this.cavePositions.flat())
        this.voronoi = this.delaunay.voronoi([0, 0, this.scaleX, this.scaleY])

        // TODO: do I want to use delaunay or voronoi neighbors?
        // const V = [...this.voronoi.neighbors(2)];
        // const D = [...this.delaunay.neighbors(2)];
        //
        // console.log('V', V)
        // console.log('D', D)

        this.neighborSet = map(this.cavePositions, (point, i) => ({
            pointIndex: i,
            neighbors: [...this.voronoi.neighbors(i)]
        }))
        this.edges = findPaths(this.cavePositions, this.neighborSet)
        this.pathFinder = new PathFinder({
            points: this.cavePositions,
            edges: this.edges
        })

        this.pathDisplayed = null
        this.SVG_REF = undefined
    }

    setRef = (SVG_REF) => {
        this.SVG_REF = SVG_REF
    }

    determineGraphScale = () => {
        let maxX = 0;
        let maxY = 0;

        for (const [x, y] of this.cavePositions) {
            maxX = Math.max(maxX, x);

            maxY = Math.max(maxY, y);
        }

        this.scaleX = maxX + 100
        this.scaleY = maxY + 100
    }

    renderSVG = () => {
        const svg = d3.select(this.SVG_REF.current)
            .attr("viewBox", [0, 0, this.scaleX, this.scaleY])

        svg.selectAll("*").remove();

        // Render Voronoi diagram
        svg
            .append("path")
            .attr("fill", "none")
            .attr("stroke", "#826434")
            .attr("stroke-width", 8)
            .attr("d", this.voronoi.render())

        // Render Delaunay points
        svg
            .append("path")
            .attr("fill", "#a81720")
            .attr("stroke", "#a81720")
            .attr("stroke-width", 8)
            .attr("d", this.delaunay.renderPoints(null, 2))

        console.log(this.pathDisplayed)

        if (this.pathDisplayed !== null) {
            map(this.pathDisplayed, (path) => {
                const point1 = path.a
                const point2 = path.b
                svg
                  .append('path')
                  .attr('d', d3.line()([point1, point2]))
                  .attr('stroke', 'orange')
                  .attr('stroke-width', 10)
            })
        }

        return svg
    }

    findCavePath = ({ startIndex, endIndex }) => {
        const startPoint = this.cavePositions[startIndex]
        const endPoint = this.cavePositions[endIndex]

        const shortestPath = this.pathFinder.findPath(startPoint, endPoint)
        console.log('shortestPath', shortestPath)
        this.pathDisplayed = shortestPath
    }

}

// export default DelaunayGraph;
// module.exports = DelaunayGraph // for testing
