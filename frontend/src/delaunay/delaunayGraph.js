import * as d3 from "d3"
import { Delaunay } from "d3-delaunay"
import findPaths from "../util/findPaths"
import {map} from "lodash"
import PathFinder from "../util/PathFinder";

class DelaunayGraph {

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

    renderSVG = (svgRef) => {
        const svg = d3.select(svgRef.current)
            .attr("viewBox", [0, 0, this.scaleX, this.scaleY])

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

        return svg
    }

    findCavePath = ({ startIndex, endIndex }) => {
        const startPoint = this.cavePositions[startIndex]

        const shortestPath = this.pathFinder.findPath(startPoint)

        console.log('shortestPath', shortestPath)
    }

}

export default DelaunayGraph;
