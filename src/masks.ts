import { numberOfAddress, stitchZones } from "./constants"

export const stitch = (i: number) => {
    return i % 8 === 0 //&& isInStitch(i)
}


const isInStitch = (i: number, stitchZone = stitchZones[0]) => {
    const positionInHead = i % numberOfAddress
    return positionInHead < stitchZone || positionInHead > numberOfAddress
}