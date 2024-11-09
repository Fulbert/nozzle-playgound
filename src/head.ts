import { ref } from 'vue';
import * as k from './constants.ts'

export const useNozzlePlate = (_position = 0) => {  
    const position = ref(_position);

    const nozzlesCoordinates = ref<nozzle[]>(generateNozzlesCoordinates(position.value));

    const moveX = (move: number) => {
        nozzlesCoordinates.value = moveNozzles([move,0], nozzlesCoordinates.value)
    }
    
    // rotate nozzle coordinates
    const rotate = (alpha: number) => {
        nozzlesCoordinates.value = nozzlesCoordinates.value.map(c => rotatePoint(c, alpha))
    }

    // Adjust stitch
    const adjustStitch = (move: number) => {
        moveX(move);
    }

    const reset = () => {
        nozzlesCoordinates.value = generateNozzlesCoordinates(position.value)
    }

    const rotatePoint = (
        coord: nozzle, 
        alpha = 0, 
        center = [22,10]
    ): nozzle => {
        const dX = coord[0] - center[0];
        const dY = coord[1] - center[1];

        return [
            center[0] + dX * Math.cos(alpha) - dY * Math.sin(alpha),
            center[1] + dX * Math.sin(alpha) + dY * Math.cos(alpha),
            coord[2]
        ]
    }

    

    return {nozzlesCoordinates, adjustStitch, position, rotate, reset }
}

const generateNozzlesCoordinates = (_position: number): nozzle[] => {
    let coordinates: nozzle[] = [];

    const nozzleMask = generateNozzleMask();
    
    for(let n = 0; n < k.numberOfAddress; n++){

        // xCoord is the nozzle id multiplied by the size of a pixel
        const xCoord = n * k.nozzleXDistance + _position * k.pixelSize

        // Column of the nozzle 
        // There's 32 nozzles per column
        const colPosition = ((n % k.nozzlesPerCol) * k.nozzleYDistance) / k.numberOfGroup

        // Group of the nozzle
        // There's 4 verticals zones in a head
        // Nozzle are distributed in the zone in the following order 0>2>1>3
        const mod = (n % k.nozzlesPerCol) % k.numberOfGroup;
        const group = k.colGroupOrder[mod]
        let groupPosition =  group * k.groupSize
        groupPosition += group > 1 ? k.gap : 0 // add gap to second row of nozzle

        // Calculate skew
        const skew = n * k.skewPerNozzle

        // yCoord is the position in the group + the position of the group + skew
        const yCoord = groupPosition + colPosition + skew

        coordinates.push([
            xCoord, 
            yCoord,
            !nozzleMask[n]
        ]);
    }

    console.log(`Generated ${coordinates.length} nozzle coordinates`);
    
    coordinates = moveNozzles([_position * ( k.nozzlesPerHead + k.stitchZones[2]) * k.pixelSize, 0], coordinates)

    return coordinates
}

// Generate a mask for nozzles address
const generateNozzleMask = () => {
    const mask: boolean[] = [];

    for(let n = 0; n < k.numberOfAddress; n++){
        let exist = true;
        
        if (n < k.stitchZones[0] && n % 4 !== 0)
            exist = false
        if (n >= k.stitchZones[0] && n < k.stitchZones[1] && n % 2 !== 0)
            exist = false
        if (n >= k.stitchZones[1] && n < k.stitchZones[2] && (n % 4)-3 === 0)
            exist = false

        const rightStitchZones = k.stitchZones.map((z) => k.numberOfAddress - z);
        if (n >= rightStitchZones[2] && n < rightStitchZones[1] && (n % 4) === 0)
            exist = false
        if (n >= rightStitchZones[1] && n < rightStitchZones[0] && n % 2 === 0)
            exist = false
        if (n >= rightStitchZones[0] && (n % 4)-3 !== 0)
            exist = false


        mask.push(exist)
    }

    console.log(`Generated ${mask.length} address mask`)

    return mask
}

const moveNozzles = (move: number[], coordinates: nozzle[]): nozzle[] => {
    return coordinates.map(c => [c[0] + move[0], c[1] + move[1], c[2]])
}


export type nozzle = [number, number, boolean]