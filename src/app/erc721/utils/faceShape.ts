import { FaceContourPoints, Points } from '../types'
import { randomFromInterval, getEggShapePoints } from './base'

function findIntersectionPoints(radian: number, a: number, b: number) {
  if (radian < 0) {
    radian = 0
  }
  if (radian > Math.PI / 2) {
    radian = Math.PI / 2
  }
  // a is width, b is height
  // Slope of the line
  const m = Math.tan(radian)
  // check if radian is close to 90 degrees
  if (Math.abs(radian - Math.PI / 2) < 0.0001) {
    return { x: 0, y: b }
  }
  // only checks the first quadrant
  const y = m * a
  if (y < b) {
    // it intersects with the left side
    return { x: a, y: y }
  } else {
    // it intersects with the top side
    // console.log(m);
    const x = b / m
    // console.log(x, b);
    return { x: x, y: b }
  }
}

export function generateRectangularFaceContourPoints(a: number, b: number, segment_points: number) {
  // a is width, b is height, segment_points is the number of points
  var result: Points = []
  for (var i = 0; i < segment_points; i++) {
    var degree = (Math.PI / 2 / segment_points) * i + randomFromInterval(-Math.PI / 11 / segment_points, Math.PI / 11 / segment_points)
    var intersection = findIntersectionPoints(degree, a, b)
    result.push([intersection.x, intersection.y])
  }
  for (var i = segment_points; i > 0; i--) {
    // x is negative, y is positive
    var degree = (Math.PI / 2 / segment_points) * i + randomFromInterval(-Math.PI / 11 / segment_points, Math.PI / 11 / segment_points)
    var intersection = findIntersectionPoints(degree, a, b)
    result.push([-intersection.x, intersection.y])
  }
  for (var i = 0; i < segment_points; i++) {
    // x is negative, y is negative
    // first compute the degree
    var degree = (Math.PI / 2 / segment_points) * i + randomFromInterval(-Math.PI / 11 / segment_points, Math.PI / 11 / segment_points)
    var intersection = findIntersectionPoints(degree, a, b)
    result.push([-intersection.x, -intersection.y])
  }
  for (var i = segment_points; i > 0; i--) {
    // x is positive, y is negative
    // first compute the degree
    var degree = (Math.PI / 2 / segment_points) * i + randomFromInterval(-Math.PI / 11 / segment_points, Math.PI / 11 / segment_points)
    var intersection = findIntersectionPoints(degree, a, b)
    result.push([intersection.x, -intersection.y])
  }
  return result
}

export function generateFaceContourPoints(numPoints = 100): FaceContourPoints {
  var faceSizeX0 = randomFromInterval(50, 100)
  var faceSizeY0 = randomFromInterval(70, 100)

  var faceSizeY1 = randomFromInterval(50, 80)
  var faceSizeX1 = randomFromInterval(70, 100)
  var faceK0 = randomFromInterval(0.001, 0.005) * (Math.random() > 0.5 ? 1 : -1)
  var faceK1 = randomFromInterval(0.001, 0.005) * (Math.random() > 0.5 ? 1 : -1)
  var face0TranslateX = randomFromInterval(-5, 5)
  var face0TranslateY = randomFromInterval(-15, 15)

  var face1TranslateY = randomFromInterval(-5, 5)
  var face1TranslateX = randomFromInterval(-5, 25)
  var eggOrRect0 = Math.random() > 0.1
  var eggOrRect1 = Math.random() > 0.3

  var results0 = eggOrRect0
    ? getEggShapePoints(faceSizeX0, faceSizeY0, faceK0, numPoints)
    : generateRectangularFaceContourPoints(faceSizeX0, faceSizeY0, numPoints)
  var results1 = eggOrRect1
    ? getEggShapePoints(faceSizeX1, faceSizeY1, faceK1, numPoints)
    : generateRectangularFaceContourPoints(faceSizeX1, faceSizeY1, numPoints)
  for (var i = 0; i < results0.length; i++) {
    results0[i][0] += face0TranslateX
    results0[i][1] += face0TranslateY
    results1[i][0] += face1TranslateX
    results1[i][1] += face1TranslateY
  }
  var results: Points = []
  let center = [0, 0]
  for (var i = 0; i < results0.length; i++) {
    results.push([
      results0[i][0] * 0.7 + results1[(i + results0.length / 4) % results0.length][1] * 0.3,
      results0[i][1] * 0.7 - results1[(i + results0.length / 4) % results0.length][0] * 0.3
    ])
    center[0] += results[i][0]
    center[1] += results[i][1]
  }
  center[0] /= results.length
  center[1] /= results.length
  // center the face
  for (var i = 0; i < results.length; i++) {
    results[i][0] -= center[0]
    results[i][1] -= center[1]
  }

  let width = results[0][0] - results[results.length / 2][0]
  let height = results[results.length / 4][1] - results[(results.length * 3) / 4][1]
  // add the first point to the end to close the shape
  results.push(results[0])
  results.push(results[1])
  // console.log(results);
  return { face: results, width: width, height: height, center: [0, 0] }
}
