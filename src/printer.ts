import { decode, TiffIfd } from "tiff";
import {  computed, ref } from "vue";
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

    const setJetsFiring = (line: boolean[]) => {
        printbars[0].heads.forEach(h => h.setJetsFiring(line))
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
        for(let i = 0, dropsPrinted = 0, len = file.data.length ; i < len ; i++) {
            const fire = file.data[i]
            if (fire !== 0)
                continue

            dropsPrinted++;

            const x = i % width
            const y = (i - x) / width
            
            // Deconstruct
            const drop = {...nozzles[x]}

            if (!drop.exist)
                continue

            drop.y = y * pixelSize
            newDrops.push(drop)
        }

        drops.value = newDrops
    }

    return {printbars, drops, loadTiff, getClosestNozzle, getClosestHead, calculateDrops }
}

export interface drop extends nozzle {

}