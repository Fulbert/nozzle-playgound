import { numberOfAddress, stitchZones } from "./constants"
import { nozzle } from "./head"

export const stitch = (n: nozzle) => {
    return n[4] % 16 === 0
}


const isInStitch = (i: number, stitchZone = stitchZones[0]) => {
    const positionInHead = i % numberOfAddress
    return positionInHead < stitchZone || positionInHead > numberOfAddress
}