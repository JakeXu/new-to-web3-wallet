import { type Point, Points } from '../types'

export function randomFromInterval(min: number, max: number) {
  // min and max included
  return Math.random() * (max - min) + min
}

export function factorial(n: number): number {
  if (n <= 1) return 1
  return n * factorial(n - 1)
}

export function cubicBezier(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const x = (1 - t) ** 3 * p0[0] + 3 * (1 - t) ** 2 * t * p1[0] + 3 * (1 - t) * t ** 2 * p2[0] + t ** 3 * p3[0]
  const y = (1 - t) ** 3 * p0[1] + 3 * (1 - t) ** 2 * t * p1[1] + 3 * (1 - t) * t ** 2 * p2[1] + t ** 3 * p3[1]
  return [x, y]
}

export function getEggShapePoints(a: number, b: number, k: number, segment_points: number): Points {
  // the function is x^2/a^2 * (1 + ky) + y^2/b^2 = 1
  var result: Points = []
  //   var pointString = "";
  for (var i = 0; i < segment_points; i++) {
    // x positive, y positive
    // first compute the degree
    var degree = (Math.PI / 2 / segment_points) * i + randomFromInterval(-Math.PI / 1.1 / segment_points, Math.PI / 1.1 / segment_points)
    var y = Math.sin(degree) * b
    var x = Math.sqrt(((1 - (y * y) / (b * b)) / (1 + k * y)) * a * a) + randomFromInterval(-a / 200.0, a / 200.0)
    // pointString += x + "," + y + " ";
    result.push([x, y])
  }
  for (var i = segment_points; i > 0; i--) {
    // x is negative, y is positive
    var degree = (Math.PI / 2 / segment_points) * i + randomFromInterval(-Math.PI / 1.1 / segment_points, Math.PI / 1.1 / segment_points)
    var y = Math.sin(degree) * b
    var x = -Math.sqrt(((1 - (y * y) / (b * b)) / (1 + k * y)) * a * a) + randomFromInterval(-a / 200.0, a / 200.0)
    // pointString += x + "," + y + " ";
    result.push([x, y])
  }
  for (var i = 0; i < segment_points; i++) {
    // x is negative, y is negative
    var degree = (Math.PI / 2 / segment_points) * i + randomFromInterval(-Math.PI / 1.1 / segment_points, Math.PI / 1.1 / segment_points)
    var y = -Math.sin(degree) * b
    var x = -Math.sqrt(((1 - (y * y) / (b * b)) / (1 + k * y)) * a * a) + randomFromInterval(-a / 200.0, a / 200.0)
    // pointString += x + "," + y + " ";
    result.push([x, y])
  }
  for (var i = segment_points; i > 0; i--) {
    // x is positive, y is negative
    var degree = (Math.PI / 2 / segment_points) * i + randomFromInterval(-Math.PI / 1.1 / segment_points, Math.PI / 1.1 / segment_points)
    var y = -Math.sin(degree) * b
    var x = Math.sqrt(((1 - (y * y) / (b * b)) / (1 + k * y)) * a * a) + randomFromInterval(-a / 200.0, a / 200.0)
    // pointString += x + "," + y + " ";
    result.push([x, y])
  }
  return result
}
