import { useMemo } from 'react'
import { BothEyes, FaceContourPoints, Points } from '@/app/erc721/types'
import { randomFromInterval } from '@/app/erc721/utils/'

export interface Props {
  faceContourPoints: FaceContourPoints
  bothEyes: BothEyes
  hairLines: Points[]
  mouthPoints: Points
}

const HairColors = [
  'rgb(0, 0, 0)', // Black
  'rgb(44, 34, 43)', // Dark Brown
  'rgb(80, 68, 68)', // Medium Brown
  'rgb(167, 133, 106)', // Light Brown
  'rgb(220, 208, 186)', // Blond
  'rgb(233, 236, 239)', // Platinum Blond
  'rgb(165, 42, 42)', // Red
  'rgb(145, 85, 61)', // Auburn
  'rgb(128, 128, 128)', // Grey
  'rgb(185, 55, 55)', // Fire
  'rgb(255, 192, 203)', // Pastel Pink
  'rgb(255, 105, 180)', // Bright Pink
  'rgb(230, 230, 250)', // Lavender
  'rgb(64, 224, 208)', // Turquoise
  'rgb(0, 191, 255)', // Bright Blue
  'rgb(148, 0, 211)', // Deep Purple
  'rgb(50, 205, 50)', // Lime Green
  'rgb(255, 165, 0)', // Vivid Orange
  'rgb(220, 20, 60)', // Crimson Red
  'rgb(192, 192, 192)', // Silver
  'rgb(255, 215, 0)', // Gold
  'rgb(255, 255, 255)', // White
  'rgb(124, 252, 0)', // Lawn Green
  'rgb(127, 255, 0)', // Chartreuse
  'rgb(0, 255, 127)', // Spring Green
  'rgb(72, 209, 204)', // Medium Turquoise
  'rgb(0, 255, 255)', // Cyan
  'rgb(0, 206, 209)', // Dark Turquoise
  'rgb(32, 178, 170)', // Light Sea Green
  'rgb(95, 158, 160)', // Cadet Blue
  'rgb(70, 130, 180)', // Steel Blue
  'rgb(176, 196, 222)', // Light Steel Blue
  'rgb(30, 144, 255)', // Dodger Blue
  'rgb(135, 206, 235)', // Sky Blue
  'rgb(0, 0, 139)', // Dark Blue
  'rgb(138, 43, 226)', // Blue Violet
  'rgb(75, 0, 130)', // Indigo
  'rgb(139, 0, 139)', // Dark Magenta
  'rgb(153, 50, 204)', // Dark Orchid
  'rgb(186, 85, 211)', // Medium Orchid
  'rgb(218, 112, 214)', // Orchid
  'rgb(221, 160, 221)', // Plum
  'rgb(238, 130, 238)', // Violet
  'rgb(255, 0, 255)', // Magenta
  'rgb(216, 191, 216)', // Thistle
  'rgb(255, 20, 147)', // Deep Pink
  'rgb(255, 69, 0)', // Orange Red
  'rgb(255, 140, 0)', // Dark Orange
  'rgb(255, 165, 0)', // Orange
  'rgb(250, 128, 114)', // Salmon
  'rgb(233, 150, 122)', // Dark Salmon
  'rgb(240, 128, 128)', // Light Coral
  'rgb(205, 92, 92)', // Indian Red
  'rgb(255, 99, 71)', // Tomato
  'rgb(255, 160, 122)', // Light Salmon
  'rgb(220, 20, 60)', // Crimson
  'rgb(139, 0, 0)', // Dark Red
  'rgb(178, 34, 34)', // Fire Brick
  'rgb(250, 235, 215)', // Antique White
  'rgb(255, 239, 213)', // Papaya Whip
  'rgb(255, 235, 205)', // Blanched Almond
  'rgb(255, 222, 173)', // Navajo White
  'rgb(245, 245, 220)', // Beige
  'rgb(255, 228, 196)', // Bisque
  'rgb(255, 218, 185)', // Peach Puff
  'rgb(244, 164, 96)', // Sandy Brown
  'rgb(210, 180, 140)', // Tan
  'rgb(222, 184, 135)', // Burly Wood
  'rgb(250, 250, 210)', // Light Goldenrod Yellow
  'rgb(255, 250, 205)', // Lemon Chiffon
  'rgb(255, 245, 238)', // Sea Shell
  'rgb(253, 245, 230)', // Old Lace
  'rgb(255, 228, 225)', // Misty Rose
  'rgb(255, 240, 245)', // Lavender Blush
  'rgb(250, 240, 230)', // Linen
  'rgb(255, 228, 181)', // Moccasin
  'rgb(255, 250, 250)', // Snow
  'rgb(240, 255, 255)', // Azure
  'rgb(240, 255, 240)', // Honeydew
  'rgb(245, 245, 245)', // White Smoke
  'rgb(245, 255, 250)', // Mint Cream
  'rgb(240, 248, 255)', // Alice Blue
  'rgb(240, 248, 255)', // Ghost White
  'rgb(248, 248, 255)', // Ghost White
  'rgb(255, 250, 240)', // Floral White
  'rgb(253, 245, 230)' // Old Lace
]
const BackgroundColors = [
  'rgb(245, 245, 220)', // Soft Beige
  'rgb(176, 224, 230)', // Pale Blue
  'rgb(211, 211, 211)', // Light Grey
  'rgb(152, 251, 152)', // Pastel Green
  'rgb(255, 253, 208)', // Cream
  'rgb(230, 230, 250)', // Muted Lavender
  'rgb(188, 143, 143)', // Dusty Rose
  'rgb(135, 206, 235)', // Sky Blue
  'rgb(245, 255, 250)', // Mint Cream
  'rgb(245, 222, 179)', // Wheat
  'rgb(47, 79, 79)', // Dark Slate Gray
  'rgb(72, 61, 139)', // Dark Slate Blue
  'rgb(60, 20, 20)', // Dark Brown
  'rgb(25, 25, 112)', // Midnight Blue
  'rgb(139, 0, 0)', // Dark Red
  'rgb(85, 107, 47)', // Olive Drab
  'rgb(128, 0, 128)', // Purple
  'rgb(0, 100, 0)', // Dark Green
  'rgb(0, 0, 139)', // Dark Blue
  'rgb(105, 105, 105)', // Dim Gray
  'rgb(240, 128, 128)', // Light Coral
  'rgb(255, 160, 122)', // Light Salmon
  'rgb(255, 218, 185)', // Peach Puff
  'rgb(255, 228, 196)', // Bisque
  'rgb(255, 222, 173)', // Navajo White
  'rgb(255, 250, 205)', // Lemon Chiffon
  'rgb(250, 250, 210)', // Light Goldenrod Yellow
  'rgb(255, 239, 213)', // Papaya Whip
  'rgb(255, 245, 238)', // Sea Shell
  'rgb(255, 248, 220)', // Cornsilk
  'rgb(255, 255, 240)', // Ivory
  'rgb(240, 255, 240)', // Honeydew
  'rgb(240, 255, 255)', // Azure
  'rgb(240, 248, 255)', // Alice Blue
  'rgb(248, 248, 255)', // Ghost White
  'rgb(255, 250, 250)', // Snow
  'rgb(255, 240, 245)', // Lavender Blush
  'rgb(255, 228, 225)', // Misty Rose
  'rgb(230, 230, 250)', // Lavender
  'rgb(216, 191, 216)', // Thistle
  'rgb(221, 160, 221)', // Plum
  'rgb(238, 130, 238)', // Violet
  'rgb(218, 112, 214)', // Orchid
  'rgb(186, 85, 211)', // Medium Orchid
  'rgb(147, 112, 219)', // Medium Purple
  'rgb(138, 43, 226)', // Blue Violet
  'rgb(148, 0, 211)', // Dark Violet
  'rgb(153, 50, 204)', // Dark Orchid
  'rgb(139, 69, 19)', // Saddle Brown
  'rgb(160, 82, 45)', // Sienna
  'rgb(210, 105, 30)', // Chocolate
  'rgb(205, 133, 63)', // Peru
  'rgb(244, 164, 96)', // Sandy Brown
  'rgb(222, 184, 135)', // Burly Wood
  'rgb(255, 250, 240)', // Floral White
  'rgb(253, 245, 230)', // Old Lace
  'rgb(250, 240, 230)' // Linen
]

const Avatar = (props: Props) => {
  return useMemo(() => {
    const { faceContourPoints, bothEyes, hairLines, mouthPoints } = props
    const { face: computedFacePoints, width, height, center } = faceContourPoints
    const { left, right } = bothEyes
    const eyeLeftContour = left.upper.slice(10, 90).concat(left.lower.slice(10, 90).reverse())
    const eyeRightContour = right.upper.slice(10, 90).concat(right.lower.slice(10, 90).reverse())
    let hairColor: string
    let dyeColorOffset = '50%'
    let faceScale = 1.5 + Math.random() * 0.6
    const haventSleptForDays = Math.random() > 0.8

    if (Math.random() > 0.1) {
      // use natural hair color
      hairColor = HairColors[Math.floor(Math.random() * 10)]
    } else {
      hairColor = 'url(#rainbowGradient)'
      dyeColorOffset = randomFromInterval(0, 100) + '%'
    }

    const distanceBetweenEyes = randomFromInterval(width / 4.5, width / 4)
    const eyeHeightOffset = randomFromInterval(height / 8, height / 6)
    const leftEyeOffsetX = randomFromInterval(-width / 20, width / 10)
    const leftEyeOffsetY = randomFromInterval(-height / 50, height / 50)
    const rightEyeOffsetX = randomFromInterval(-width / 20, width / 10)
    const rightEyeOffsetY = randomFromInterval(-height / 50, height / 50)

    // now we generate the pupil shifts
    // we first pick a point from the upper eye lid
    const leftInd0 = Math.floor(randomFromInterval(10, left.upper.length - 10))
    const rightInd0 = Math.floor(randomFromInterval(10, right.upper.length - 10))
    const leftInd1 = Math.floor(randomFromInterval(10, left.upper.length - 10))
    const rightInd1 = Math.floor(randomFromInterval(10, right.upper.length - 10))
    const leftLerp = randomFromInterval(0.2, 0.8)
    const rightLerp = randomFromInterval(0.2, 0.8)

    const leftPupilShiftY = left.upper[leftInd0][1] * leftLerp + left.lower[leftInd1][1] * (1 - leftLerp)
    const rightPupilShiftY = right.upper[rightInd0][1] * rightLerp + right.lower[rightInd1][1] * (1 - rightLerp)
    const leftPupilShiftX = left.upper[leftInd0][0] * leftLerp + left.lower[leftInd1][0] * (1 - leftLerp)
    const rightPupilShiftX = right.upper[rightInd0][0] * rightLerp + right.lower[rightInd1][0] * (1 - rightLerp)

    const rightNoseCenterX = randomFromInterval(width / 18, width / 12)
    const rightNoseCenterY = randomFromInterval(0, height / 5)
    const leftNoseCenterX = randomFromInterval(-width / 18, -width / 12)
    const leftNoseCenterY = rightNoseCenterY + randomFromInterval(-height / 30, height / 20)

    return (
      <svg viewBox="-100 -100 200 200" xmlns="http://www.w3.org/2000/svg" width="320" height="320" id="face-svg">
        <defs>
          <clipPath id="leftEyeClipPath">
            <polyline points={eyeLeftContour.toString()} />
          </clipPath>
          <clipPath id="rightEyeClipPath">
            <polyline points={eyeRightContour.toString()} />
          </clipPath>
          <filter id="fuzzy">
            <feTurbulence id="turbulence" baseFrequency="0.05" numOctaves="3" type="fractalNoise" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
          </filter>
          <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: HairColors[Math.floor(Math.random() * 10)], stopOpacity: 1 }} />
            <stop
              offset={dyeColorOffset}
              style={{ stopColor: HairColors[Math.floor(Math.random() * HairColors.length)], stopOpacity: 1 }}
            />
            <stop offset="100%" style={{ stopColor: HairColors[Math.floor(Math.random() * HairColors.length)], stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <title>THAT&apos;S AN UGLY FACE</title>
        <desc>HTTPS://TXSTC55.GITHUB.IO/UGLY-AVATAR/</desc>
        <rect x="-100" y="-100" width="100%" height="100%" fill={BackgroundColors[Math.floor(Math.random() * BackgroundColors.length)]} />
        <polyline
          id="faceContour"
          points={computedFacePoints.toString()}
          fill="#ffc9a9"
          stroke="black"
          strokeWidth={3.0 / faceScale}
          strokeLinejoin="round"
          filter="url(#fuzzy)"
        />
        <g
          transform={`translate(${center[0] + distanceBetweenEyes + rightEyeOffsetX},${-(-center[1] + eyeHeightOffset + rightEyeOffsetY)})`}
        >
          <polyline
            id="rightCountour"
            points={eyeRightContour.toString()}
            fill="white"
            stroke="white"
            strokeWidth="0.0"
            strokeLinejoin="round"
            filter="url(#fuzzy)"
          />
        </g>
        <g
          transform={`translate(${-(center[0] + distanceBetweenEyes + leftEyeOffsetX)},${-(-center[1] + eyeHeightOffset + leftEyeOffsetY)})`}
        >
          <polyline
            id="leftCountour"
            points={eyeLeftContour.toString()}
            fill="white"
            stroke="white"
            strokeWidth="0.0"
            strokeLinejoin="round"
            filter="url(#fuzzy)"
          />
        </g>
        <g
          transform={`translate(${center[0] + distanceBetweenEyes + rightEyeOffsetX},${-(-center[1] + eyeHeightOffset + rightEyeOffsetY)})`}
        >
          <polyline
            id="rightUpper"
            points={right.upper.toString()}
            fill="none"
            stroke="black"
            strokeWidth={(haventSleptForDays ? 5.0 : 3.0) / faceScale}
            strokeLinejoin="round"
            strokeLinecap="round"
            filter="url(#fuzzy)"
          />
          <polyline
            id="rightLower"
            points={right.lower.toString()}
            fill="none"
            stroke="black"
            strokeWidth={(haventSleptForDays ? 5.0 : 3.0) / faceScale}
            strokeLinejoin="round"
            strokeLinecap="round"
            filter="url(#fuzzy)"
          />
          {Array.from(new Array(10).keys()).map(key => (
            <circle
              key={key}
              r={Math.random() * 2 + 3.0}
              cx={rightPupilShiftX + Math.random() * 5 - 2.5}
              cy={rightPupilShiftY + Math.random() * 5 - 2.5}
              stroke="black"
              fill="none"
              strokeWidth={1.0 + Math.random() * 0.5}
              filter="url(#fuzzy)"
              clipPath="url(#rightEyeClipPath)"
            />
          ))}
        </g>
        <g
          transform={`translate(${-(center[0] + distanceBetweenEyes + leftEyeOffsetX)},${-(-center[1] + eyeHeightOffset + leftEyeOffsetY)})`}
        >
          <polyline
            id="leftUpper"
            points={left.upper.toString()}
            fill="none"
            stroke="black"
            strokeWidth={(haventSleptForDays ? 5.0 : 3.0) / faceScale}
            strokeLinejoin="round"
            filter="url(#fuzzy)"
          />
          <polyline
            id="leftLower"
            points={left.lower.toString()}
            fill="none"
            stroke="black"
            strokeWidth={(haventSleptForDays ? 5.0 : 3.0) / faceScale}
            strokeLinejoin="round"
            filter="url(#fuzzy)"
          />
          {Array.from(new Array(10).keys()).map(key => (
            <circle
              key={key}
              r={Math.random() * 2 + 3.0}
              cx={leftPupilShiftX + Math.random() * 5 - 2.5}
              cy={leftPupilShiftY + Math.random() * 5 - 2.5}
              stroke="black"
              fill="none"
              strokeWidth={1.0 + Math.random() * 0.5}
              filter="url(#fuzzy)"
              clipPath="url(#rightEyeClipPath)"
            />
          ))}
        </g>
        <g id="hairs">
          {hairLines.map((hair, index) => (
            <polyline
              key={index}
              points={hair.toString()}
              fill="none"
              stroke={hairColor}
              strokeWidth={0.5 + Math.random() * 2.5}
              strokeLinejoin="round"
              filter="url(#fuzzy)"
            />
          ))}
        </g>
        {Math.random() > 0.5 ? (
          <g id="pointNose">
            <g id="rightNose">
              {Array.from(new Array(10).keys()).map(key => (
                <circle
                  key={key}
                  r={Math.random() * 2 + 1.0}
                  cx={rightNoseCenterX + Math.random() * 4 - 2}
                  cy={rightNoseCenterY + Math.random() * 4 - 2}
                  stroke="black"
                  fill="none"
                  strokeWidth={1.0 + Math.random() * 0.5}
                  filter="url(#fuzzy)"
                />
              ))}
            </g>
            <g id="leftNose">
              {Array.from(new Array(10).keys()).map(key => (
                <circle
                  key={key}
                  r={Math.random() * 2 + 1.0}
                  cx={leftNoseCenterX + Math.random() * 4 - 2}
                  cy={leftNoseCenterY + Math.random() * 4 - 2}
                  stroke="black"
                  fill="none"
                  strokeWidth={1.0 + Math.random() * 0.5}
                  filter="url(#fuzzy)"
                />
              ))}
            </g>
          </g>
        ) : (
          <g id="lineNose">
            <path
              d={`M ${leftNoseCenterX} ${leftNoseCenterY}, Q${rightNoseCenterX} ${rightNoseCenterY * 1.5},${(leftNoseCenterX + rightNoseCenterX) / 2} ${-eyeHeightOffset * 0.2}`}
              fill="none"
              stroke="black"
              strokeWidth={2.5 + Math.random()}
              strokeLinejoin="round"
              filter="url(#fuzzy)"
            ></path>
          </g>
        )}
        <g id="mouth">
          <polyline
            points={mouthPoints.toString()}
            fill="rgb(215,127,140)"
            stroke="black"
            strokeWidth={2.7 + Math.random() * 0.5}
            strokeLinejoin="round"
            filter="url(#fuzzy)"
          />
        </g>
      </svg>
    )
  }, [JSON.stringify(props)])
}

export default Avatar
