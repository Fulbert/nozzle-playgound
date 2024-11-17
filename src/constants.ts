// Constant used in app
export const resolution = 1200; // dpi
export const nozzlesPerHead = 2048; // nozzle
export const stitchZones = [32,96,128] // nozzle address boundaries (300,600,900,1200)
export const numberOfAddress = nozzlesPerHead + stitchZones[2]; // addresses
export const nozzlesIn1200dpiZone = nozzlesPerHead - (stitchZones[2] * 2); // nozzle
export const nozzlesPerCol = 32; // nozle
export const colGroupOrder = [0,2,1,3]; // group order
export const numberOfGroup = colGroupOrder.length; // groups of nozzle
export const nozzlesPerGroup = nozzlesPerCol / numberOfGroup // nozzle

export const nozzlePlateZoneGap = 5; // mm - distance between the two groups of nozzles
export const inch = 25.4; // mm
export const pixelSize = inch / resolution; // mm
export const nozzleXDistance = pixelSize; // mm
export const nozzleYDistance = 0.2963 // mm
export const groupSize = nozzlesPerGroup * nozzleYDistance;
export const skew = 1.3123; // mm
export const skewPerNozzle = skew / 68 / 32;
export const gap = 2.6458;

export const colors = ['cyan', 'yellow']