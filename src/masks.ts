import { nozzle } from "./head"

export const stitch = (n: nozzle) => {
    return n.isInStitch &&
        (n.pixel % 32 === 0 || n.pixel % 32 - 17 === 0)
}

export const angle = (n: nozzle) => {
    return !n.isInStitch &&
        (n.pixel % 64 === 0) //|| n.pixel % 64 - 33 === 0)
}