import { generateDelaunay, findClosestNeighbourDistance } from './delaunay'

const run = () => {
    // const inputWidth = 1000
    // const inputHeight = 1000
    // const inputPositions = JSON.parse('[[100,200], [500,500], [900,1500], [200,600], [500,100], [45,650], [100,1150], [500,200]]')
    // const circleRadius = 50
    //
    // const generatedSvg = generateDelaunay(inputWidth, inputHeight, inputPositions, circleRadius)
    // console.log(generatedSvg)

    const closestDistance = findClosestNeighbourDistance([100,400], [1,2,3], [[600,501], [100,801], [200,1001]], 600)
    console.log('closestDistance', closestDistance)
}

run()
