import { computed, ref } from "vue"
import { nozzle, useHead } from "./head"
import { colors } from "./constants"

export const usePrintbar = (_number = 0, _numberOfHeads = 2) => {
    const number = ref(_number)
    const color = ref(colors[_number])
    const numberOfHeads = ref(_numberOfHeads)

    const heads = Array.from({length: numberOfHeads.value},
        (_i, _k) => useHead(number.value, _k)
    )

    const getNozzles = computed(() => heads.flatMap((h) => [...h.getNozzles.value]))

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

    return {color, heads, getNozzles, getNozzlesNearby, getClosestNozzle}
}

const distance = (coord1: [number, number], coord2: [number, number]) => {
    const dX = coord1[0] - coord2[0]
    const dY = coord1[1] - coord2[1]
    return Math.sqrt(dX * dX + dY * dY)
}

export type printbar = ReturnType<typeof usePrintbar>