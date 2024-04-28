import { Delaunay } from "d3-delaunay"
import { find, flatMap, map } from 'lodash'
import { findPaths } from '../util/findPaths.js'
import { PathFinder } from '../util/PathFinder.js'

const TREE_DISTANCE_VARIATION = 100;
const TREE_DENSITY = 0.1;
const TREE_MAX_SIZE = 5;

export class DelaunayGraph2 {
  constructor(points, canvas) {
    this.points = points

    this.canvas = canvas
    this.context = canvas.getContext("2d")

    // Scale context
    const sizeX = 1700;
    const sizeY = 1700;
    const dpr = 1;
    canvas.width = sizeX * dpr;
    canvas.height = sizeY * dpr;
    this.context.scale(dpr, dpr);

    this.delaunay = Delaunay.from(this.points);
    this.voronoi = this.delaunay.voronoi([0, 0, canvas.width, canvas.height]);
    const voronoiPolygons = [...this.voronoi.cellPolygons()]
    this.polygonCells = this.points.map((point, index) => ({
      index: index,
      point: point,
      polygons: voronoiPolygons[index]
    }))
    this.context.strokeStyle = "#040";

    this.highlightedCells = []

    this.renderCanvas()

    this.initializePathfinder()
  }

  renderCanvas = () => {
    // console.log('this.highlightedCells', this.highlightedCells)
    for (const cell of this.polygonCells) {
      if (this.isCellHighlighted(cell.point)) {
        drawPolygon(this.context, cell.polygons, true)
      } else {
        drawPolygon(this.context, cell.polygons, false)
      }
    }
  }

  isCellHighlighted = (cellCheck) => {
    const found = find(this.highlightedCells, (cell) =>
      (cell[0] === cellCheck[0]) &&
      (cell[1] === cellCheck[1])
    )

    return found !== undefined
  }

  initializePathfinder = () => {
    this.neighborSet = map(this.points, (point, i) => ({
      pointIndex: i,
      neighbors: [...this.voronoi.neighbors(i)]
    }))
    this.edges = findPaths(this.points, this.neighborSet)
    this.pathFinder = new PathFinder({
      points: this.points,
      edges: this.edges
    })
  }

  findCavePath = ({ startIndex, endIndex }) => {
    const startPoint = this.points[startIndex]
    const endPoint = this.points[endIndex]

    const shortestPath = this.pathFinder.findPath(startPoint, endPoint)
    this.pathDisplayed = shortestPath
    this.highlightedCells = flatMap(shortestPath.flat(), (pathElement) => [pathElement.a, pathElement.b])
  }
}

const drawPolygon = (context, polygon, isHighlighted) => {
  const bounds = getPolygonBounds(polygon);
  context.fillStyle = isHighlighted ? "#fff" : getGradient(context, bounds);
  drawCell(context, polygon);
  context.fill();
  context.stroke();
  context.closePath();
}

const randomPoints = (numberOfPoints) => {
  const points = [];
  for (let i = 0; i < numberOfPoints; i++) {
    const point = {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
    };
    points.push(point);
  }
  return points;
};

function drawCell(context, cell) {
  context.beginPath();
  context.moveTo(cell[0][0], cell[0][1]);
  for (let j = 1, m = cell.length; j < m; ++j) {
    context.lineTo(cell[j][0], cell[j][1]);
  }
  context.closePath();
}

function drawTrees(context) {
  for (let treeLine of treeLines) {
    const startPoint = { x: treeLine[0][0], y: treeLine[0][1] };
    const endPoint = { x: treeLine[1][0], y: treeLine[1][1] };
    const dx = endPoint.x - startPoint.x;
    const dy = endPoint.y - startPoint.y;
    const treeCount = Math.sqrt(dx ** 2 + dy ** 2) * TREE_DENSITY;
    for (let point = 0; point < treeCount; point++) {
      context.beginPath();
      context.fillStyle = Math.random() < 0.5 ? "#040" : "#060";
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
      );
      context.fill();
    }
  }
}

function getPolygonBounds(polygon) {
  let minX, minY, maxX, maxY;
  for (let point of polygon) {
    minX = Math.min(point[0], minX || Infinity);
    minY = Math.min(point[1], minY || Infinity);
    maxX = Math.max(point[0], maxX || -Infinity);
    maxY = Math.max(point[1], maxY || -Infinity);
  }
  return [minX, minY, maxX, maxY];
}

function getColor() {
  const colors = [`#a4ab1d`, `#715440`, `#258133`, `#258133`, `#D2952a`];
  return colors[Math.floor(Math.random() * colors.length)];
}

function darkenColor(color) {
  const colors = [color.slice(1, 3), color.slice(3, 5), color.slice(5, 7)];
  const hexNumbers = colors.map((c) =>
    Math.abs(parseInt(c, 16) - 15).toString(16)
  );
  return `#${hexNumbers.map((n) => (n.length < 2 ? `0${n}` : n)).join("")}`;
}

function getGradient(context, bounds) {
  const gradient = context.createLinearGradient(...bounds);
  const color = getColor();
  const darkerColor = darkenColor(color);

  for (let i = 0; i < 1; i += 0.025) {
    gradient.addColorStop(i, color);
    gradient.addColorStop(i + 0.003, color);
    gradient.addColorStop(i + 0.01, darkerColor);
    gradient.addColorStop(i + 0.02, darkerColor);
    gradient.addColorStop(i + 0.024, color);
  }
  return gradient;
}
