import { decode, TiffIfd } from "tiff";
import { computed, ref } from "vue";
import { usePrintbar } from "./printbar";
import { head, nozzle } from "./head";
import { pixelSize } from "./constants";

export const usePrinter = (numberOfPrintbars = 1) => {
    const printbars = Array.from({length: numberOfPrintbars},
        (_i, _k) => usePrintbar(_k)
    )

    let file = ref<TiffIfd>()

    const drops = computed<drop[]>(() => {
        const image = file.value
        const newDrops: drop[] = []
        if (image === undefined)
            return newDrops

        const nozzles = printbars.flatMap(pb => pb.getNozzles.value)

        const width = image.width
        const isTestPattern = nozzles.length % width === 0
        const numberOfHeads = printbars[0].heads.length

        for(let i = 0, head = 0, len = image.data.length ; i < len; ) {
            const fire = image.data[i]
            if (fire === 255){
                i++
                continue
            }

            const x = i % width
            const y = (i - x) / width

            const offset = head * width
            const drop = {...nozzles[x + offset]}

            if (!drop.exist){
                i++
                continue
            }

            drop.y = y * pixelSize
            newDrops.push(drop)

            if (isTestPattern){
                if (head === numberOfHeads - 1) {
                    head = 0
                    i++;
                }
                else head++;
            }
            else i++
        }

        return newDrops
    })

    const loadTiff  = (fileBuffer: ArrayBuffer) => {
        try {
            const tiff =  decode(fileBuffer)[0]
            if (tiff === undefined)
                return
    
            file.value = tiff
        } catch (e) { throw `Can't load tiff: ${e}` }

        console.log(`File loaded ${file.value.width};${file.value.height}`)
    }

    const getClosestNozzle = (coord: [number, number], precision = 1, returnNozzleStitchMasked = false): nozzle | undefined => {
        const closeNozzles: nozzle[] = []

        printbars.forEach(pb => {
            const nozzle = pb.getClosestNozzle(coord, precision, returnNozzleStitchMasked)

            if (nozzle === undefined)
                return

            closeNozzles.push(nozzle)
        })

        return closeNozzles[0]
    }

    const getClosestHead = (coord: [number, number], precision = 1, returnNozzleStitchMasked = false): head | undefined => {
        const closeNozzle = getClosestNozzle(coord, precision, returnNozzleStitchMasked)
        
        if (closeNozzle === undefined)
            return

        return printbars[closeNozzle.printbar].heads[closeNozzle.head]
    }

    const calculateDrops = () => {
        
    }

    return {printbars, drops, loadTiff, getClosestNozzle, getClosestHead, calculateDrops }
}

export interface drop extends nozzle {

}