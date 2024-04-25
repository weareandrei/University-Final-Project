export const measureDistanceBetweenPoints = (point_a, point_b) => {
    // console.log('measureDistanceBetweenPoints', point_a, point_b);
    const [x1, y1] = point_a;
    const [x2, y2] = point_b;

    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// export default measureDistanceBetweenPoints;
// module.exports = measureDistanceBetweenPoints // for testing
