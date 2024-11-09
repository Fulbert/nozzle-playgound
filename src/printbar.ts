import { computed, ref } from "vue"
import { useNozzlePlate } from "./head"

export const usePrintbar = (numberOfHeads = 2) => {
    const heads = ref(Array.from({length: numberOfHeads},
        (_i, _k) => {return useNozzlePlate(_k)}
    ))

    const getNozzles = computed(() => {
        return heads.value.flatMap((h) => h.nozzlesCoordinates);
    })

    const getNozzle = (coord: number[]) => {
        const nozzles = getNozzles.value.filter((n, i) => {
            const dX = n[0] - coord[0]
            const dY = (n[1] - coord[1])
            const isCLose = Math.sqrt(dX * dX + dY * dY) < 0.5
            if (isCLose) console.log(i) 
            return isCLose
        })

        console.log(nozzles)
    }

    return {heads, getNozzles, getNozzle}
}