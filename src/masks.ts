import { nozzle } from "./head"

export const stitch = (n: nozzle) => {
    return (n.pixel % 16 === 0 || n.pixel % 16 - 9 === 0) && n.isInStitch
}