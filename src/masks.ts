import { numberOfAddress, stitchZones } from "./constants"

export const stitch = (i: number) => {
    return i % 16 === 0 || i % 16 - 7 === 0
}


const isInStitch = (i: number, stitchZone = stitchZones[0]) => {
    const positionInHead = i % numberOfAddress
    return positionInHead < stitchZone || positionInHead > numberOfAddress
}