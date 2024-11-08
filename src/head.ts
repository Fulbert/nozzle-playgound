import * as k from './constants.ts'

export class NozzlePlate {
    public nozzlesCoordinates: number[][]

    constructor () {
        this.nozzlesCoordinates = this.generateNozzlesCoordinates()
    };
    
    // rotate nozzle coordinates
    public rotate = (alpha: number) => {
        this.nozzlesCoordinates = this.nozzlesCoordinates.map(c => this.rotatePoint(c, alpha))
    }

    // Generate line based on nozzle lateral position
    public generateLine = () => {
        return this.nozzlesCoordinates.map(n => n[0])
    }

    public reset = () => {
        this.nozzlesCoordinates = this.generateNozzlesCoordinates()
    }

    private generateNozzlesCoordinates = (): number[][] => {
        const coordinates = [];
    
        const nozzleMask = this.generateNozzleMask();
        
        for(let n = 0; n < k.numberOfAddress; n++){
            // Exit if nozzle doesn't exist
            if(!nozzleMask[n])
                continue
    
            // xCoord is the nozzle id multiplied by the size of a pixel
            const xCoord = n * k.nozzleXDistance
    
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
                yCoord
            ]);
        }
    
        console.log(`Generated ${coordinates.length} nozzle coordinates`);
    
        return coordinates
    }

    // Generate a mask for nozzles address
    private generateNozzleMask = () => {
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

    private rotatePoint = (coord = [0,0], alpha = 0, center = [0,0]) => {
        const dX = coord[0] - center[0];
        const dY = coord[1] - center[1];

        return [
            center[0] + dX * Math.cos(alpha) - dY * Math.sin(alpha),
            center[1] + dX * Math.sin(alpha) + dY * Math.cos(alpha)
        ]
    }
}