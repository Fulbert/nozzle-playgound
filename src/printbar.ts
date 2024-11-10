import { computed, ref } from "vue"
import { nozzle, useNozzlePlate } from "./head"

export const usePrintbar = (numberOfHeads = 2) => {
    const heads = ref(Array.from({length: numberOfHeads},
        (_i, _k) => {return useNozzlePlate(_k)}
    ))

    const getNozzles = computed(() => {
        return heads.value.flatMap((h) => h.nozzlesCoordinates);
    })

    /**
     * Return nozzles nearby the coordinates within precision
     * @param coord [number, number] x,y coordinates
     * @param precision number maximum distance (mm) to look nozzle (absolute)
     * @param returnNozzleStitchMasked boolean return nozzle masked in stitch (those nozzles doesn't exist)
     * @returns nozzle[] sorted from closest to farthest
     */
    const getNozzlesNearby = (coord: [number, number], precision = 0.5, returnNozzleStitchMasked = false) => {
        const nozzles = getNozzles.value.filter((n) => {
            const dist = distance([n.x, n.y], coord)
            return dist < precision && (n.exist && !returnNozzleStitchMasked)
        }).sort((a, b) => {
            const distA = distance([a.x, a.y], coord)
            const distB = distance([b.x, b.y], coord)
            return distA - distB
        })

        return nozzles
    }

    /**
     * Return closest nozzle from coordinates or undefined if no nozzle closer than 1 mm (aboslute)
     * @param coord [number, number] x,y coordinates
     * @param precision number maximum distance (mm) to look nozzle (absolute)
     * @param returnNozzleStitchMasked boolean return nozzle masked in stitch (those nozzles doesn't exist)
     * @returns nozzle | undefined
     */
    const getClosestNozzle = (coord: [number, number], precision = 1, returnNozzleStitchMasked = false): nozzle | undefined => {
        return getNozzlesNearby(coord, precision, returnNozzleStitchMasked)[0]
    }

    return {heads, getNozzles, getNozzlesNearby, getClosestNozzle}
}

const distance = (coord1: [number, number], coord2: [number, number]) => {
    const dX = coord1[0] - coord2[0]
    const dY = coord1[1] - coord2[1]
    return Math.sqrt(dX * dX + dY * dY)
}