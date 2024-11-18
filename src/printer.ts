import { decode, TiffIfd } from "tiff";
import { ref } from "vue";
import { usePrintbar } from "./printbar";
import { head, nozzle } from "./head";
import { pixelSize } from "./constants";

export const usePrinter = (numberOfPrintbars = 1) => {
    const printbars = Array.from({length: numberOfPrintbars},
        (_i, _k) => usePrintbar(_k)
    )

    let file: TiffIfd

    const drops = ref<drop[]>([])

    const loadTiff  = (fileBuffer: ArrayBuffer) => {
        try {
            const tiff =  decode(fileBuffer)[0]
            if (tiff === undefined)
                return
    
            file = tiff
        } catch (e) { throw `Can't load tiff: ${e}` }

        console.log(`File loaded ${file.width};${file.height}`)
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
        const newDrops: drop[] = []
        if (file === undefined)
            return drops

        const nozzles = printbars.flatMap(pb => pb.getNozzles.value)

        const width = file.width
        const isTestPattern = nozzles.length % width === 0
        const numberOfHeads = printbars[0].heads.length

        for(let i = 0, head = 0, len = file.data.length ; i < len; ) {
            const fire = file.data[i]
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

        drops.value = newDrops
    }

    return {printbars, drops, loadTiff, getClosestNozzle, getClosestHead, calculateDrops }
}

export interface drop extends nozzle {

}