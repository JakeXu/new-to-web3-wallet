import { Point, Points } from '../types'
import { randomFromInterval, factorial } from './base'

function binomialCoefficient(n: number, k: number) {
  return factorial(n) / (factorial(k) * factorial(n - k))
}

function calculateBezierPoint(t: number, controlPoints: Points): Point {
  let x = 0,
    y = 0
  const n = controlPoints.length - 1

  for (let i = 0; i <= n; i++) {
    let bc = binomialCoefficient(n, i)
    let a = Math.pow(1 - t, n - i)
    let b = Math.pow(t, i)
    const point = controlPoints[i]
    x += bc * a * b * point[0]
    y += bc * a * b * point[1]
  }

  return [x, y]
}

function computeBezierCurve(controlPoints: Points, numberOfPoints: number): Points {
  let curve: Points = []
  for (let i = 0; i <= numberOfPoints; i++) {
    let t = i / numberOfPoints
    let point = calculateBezierPoint(t, controlPoints)
    curve.push(point)
  }
  return curve
}

export function generateHairLines0(faceContours: Points, numHairLines = 100): Points[] {
  var faceContourCopy = faceContours.slice(0, faceContours.length - 2)
  var results: Points[] = []
  for (var i = 0; i < numHairLines; i++) {
    var numHairPoints = 20 + Math.floor(randomFromInterval(-5, 5))
    // we generate some hair lines
    var hair_line: Points = []
    var index_offset = Math.floor(randomFromInterval(30, 140))
    for (var j = 0; j < numHairPoints; j++) {
      hair_line.push([
        faceContourCopy[(faceContourCopy.length - (j + index_offset)) % faceContourCopy.length][0],
        faceContourCopy[(faceContourCopy.length - (j + index_offset)) % faceContourCopy.length][1]
      ])
    }
    var d0 = computeBezierCurve(hair_line, numHairPoints)
    hair_line = []
    index_offset = Math.floor(randomFromInterval(30, 140))
    for (var j = 0; j < numHairPoints; j++) {
      hair_line.push([
        faceContourCopy[(faceContourCopy.length - (-j + index_offset)) % faceContourCopy.length][0],
        faceContourCopy[(faceContourCopy.length - (-j + index_offset)) % faceContourCopy.length][1]
      ])
    }
    var d1 = computeBezierCurve(hair_line, numHairPoints)
    var d: Points = []
    for (var j = 0; j < numHairPoints; j++) {
      d.push([
        d0[j][0] * (j * (1 / numHairPoints)) ** 2 + d1[j][0] * (1 - (j * (1 / numHairPoints)) ** 2),
        d0[j][1] * (j * (1 / numHairPoints)) ** 2 + d1[j][1] * (1 - (j * (1 / numHairPoints)) ** 2)
      ])
    }

    results.push(d)
  }
  return results
}
export function generateHairLines1(faceContours: Points, numHairLines = 100): Points[] {
  var faceContourCopy = faceContours.slice(0, faceContours.length - 2)
  var results: Points[] = []
  for (var i = 0; i < numHairLines; i++) {
    var numHairPoints = 20 + Math.floor(randomFromInterval(-5, 5))
    // we generate some hair lines
    var hair_line: Points = []
    var index_start = Math.floor(randomFromInterval(20, 160))
    hair_line.push([
      faceContourCopy[(faceContourCopy.length - index_start) % faceContourCopy.length][0],
      faceContourCopy[(faceContourCopy.length - index_start) % faceContourCopy.length][1]
    ])

    for (var j = 1; j < numHairPoints + 1; j++) {
      index_start = Math.floor(randomFromInterval(20, 160))
      hair_line.push([
        faceContourCopy[(faceContourCopy.length - index_start) % faceContourCopy.length][0],
        faceContourCopy[(faceContourCopy.length - index_start) % faceContourCopy.length][1]
      ])
    }
    var d = computeBezierCurve(hair_line, numHairPoints)

    results.push(d)
  }
  return results
}

export function generateHairLines2(faceContours: Points, numHairLines = 100): Points[] {
  var faceContourCopy = faceContours.slice(0, faceContours.length - 2)
  var results: Points[] = []
  var pickedIndices = []
  for (var i = 0; i < numHairLines; i++) {
    pickedIndices.push(Math.floor(randomFromInterval(10, 180)))
  }
  pickedIndices.sort()
  for (var i = 0; i < numHairLines; i++) {
    var numHairPoints = 20 + Math.floor(randomFromInterval(-5, 5))
    // we generate some hair lines
    var hair_line: Points = []
    var index_offset = pickedIndices[i]
    var lower = randomFromInterval(0.8, 1.4)
    var reverse = Math.random() > 0.5 ? 1 : -1
    for (var j = 0; j < numHairPoints; j++) {
      var powerscale = randomFromInterval(0.1, 3)
      var portion = (1 - (j / numHairPoints) ** powerscale) * (1 - lower) + lower
      hair_line.push([
        faceContourCopy[(faceContourCopy.length - (reverse * j + index_offset)) % faceContourCopy.length][0] * portion,
        faceContourCopy[(faceContourCopy.length - (reverse * j + index_offset)) % faceContourCopy.length][1] * portion
      ])
    }
    var d = computeBezierCurve(hair_line, numHairPoints)
    if (Math.random() > 0.7) d = d.reverse()
    if (results.length == 0) {
      results.push(d)
      continue
    }
    var lastHairPoint = results[results.length - 1][results[results.length - 1].length - 1]
    var lastPointsDistance = Math.sqrt((d[0][0] - lastHairPoint[0]) ** 2 + (d[0][1] - lastHairPoint[1]) ** 2)
    if (Math.random() > 0.5 && lastPointsDistance < 100) {
      results[results.length - 1] = results[results.length - 1].concat(d)
    } else {
      results.push(d)
    }
  }
  return results
}

export function generateHairLines3(faceContours: Points, numHairLines = 100): Points[] {
  var faceContourCopy = faceContours.slice(0, faceContours.length - 2)
  var results: Points[] = []
  var pickedIndices = []
  for (var i = 0; i < numHairLines; i++) {
    pickedIndices.push(Math.floor(randomFromInterval(10, 180)))
  }
  pickedIndices.sort()
  var splitPoint = Math.floor(randomFromInterval(0, 200))
  for (var i = 0; i < numHairLines; i++) {
    var numHairPoints = 30 + Math.floor(randomFromInterval(-8, 8))
    // we generate some hair lines
    var hair_line: Points = []
    var index_offset = pickedIndices[i]
    var lower = randomFromInterval(1, 2.3)
    if (Math.random() > 0.9) lower = randomFromInterval(0, 1)
    var reverse = index_offset > splitPoint ? 1 : -1
    for (var j = 0; j < numHairPoints; j++) {
      var powerscale = randomFromInterval(0.1, 3)
      var portion = (1 - (j / numHairPoints) ** powerscale) * (1 - lower) + lower
      hair_line.push([
        faceContourCopy[(faceContourCopy.length - (reverse * j * 2 + index_offset)) % faceContourCopy.length][0] * portion,
        faceContourCopy[(faceContourCopy.length - (reverse * j * 2 + index_offset)) % faceContourCopy.length][1]
      ])
    }
    var d = computeBezierCurve(hair_line, numHairPoints)
    results.push(d)
  }
  return results
}
