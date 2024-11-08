import { computed, ref } from "vue"
import { useNozzlePlate } from "./head"

export const usePrintbar = () => {
    const heads = ref(Array.from({length: 2},
        (_i, _k) => {return useNozzlePlate(_k)}
    ))

    const getNozzles = computed(() => {
        const _nozzles: number[][] = []
        heads.value.forEach(n => _nozzles.push(...n.nozzlesCoordinates))

        return _nozzles;
    })
    return {heads, getNozzles}
}