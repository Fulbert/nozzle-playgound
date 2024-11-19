import { decode, TiffIfd } from "tiff";
import { computed, ref, toRaw } from "vue";
import { printbar, usePrintbar } from "./printbar";
import { head, nozzle } from "./head";
import { pixelSize } from "./constants";
import { coord } from "./canvas";

/**
 * Create a printer composable
 * @param numberOfPrintbars number of printbar included in the printer
 * @returns
 */
export const usePrinter = (_numberOfPrintbars = 1, _numberOfHeads = 2) => {
  const numberOfPrintbars = ref(_numberOfPrintbars);
  const numberOfHeads = ref(_numberOfHeads);

  // Array of printbars (composable)
  const printbars: printbar[] = Array.from(
    { length: numberOfPrintbars.value },
    (_i, _k) => usePrintbar(_k, numberOfHeads.value),
  );

  // Get all the printer nozzles
  const getNozzles = computed(() =>
    printbars.flatMap((pb) => pb.getNozzles.value),
  );

  // Tiff file loaded
  const file = ref<TiffIfd>();

  // Drops positions (computed and reactive to file or printhead changes)
  const drops = computed<drop[]>(() => {
    const timeStart = new Date();
    const image = file.value;

    if (image === undefined) return [];

    const data = [...toRaw(image.data)];
    const newDrops: drop[] = [];
    if (image === undefined) return newDrops;

    // Deconstruct nozzle refs for performance
    const nozzles = [...getNozzles.value];

    const width = image.width;
    const isTestPattern = nozzles.length % width === 0;
    const numberOfHeads = printbars[0].heads.length;

    /**
     * Loop though all the image pixels to create drops
     * If the image is a test pattern (image width = head width), the image is repeated on each heads
     * If the image is of any other size, it's printed from nozzle 0
     */
    for (let pixel = 0, head = 0, len = image.data.length; pixel < len; ) {
      // Exit the loop if the pixel is empty
      const fire = data[pixel] === 255;
      if (fire) {
        pixel++;
        continue;
      }

      // Calculate pixel coord
      const x = pixel % width;
      const y = (pixel - x) / width;

      // Select corresponding nozzle and create a drop with the same nozzle properties
      const offset = head * width;
      const drop = { ...nozzles[x + offset] };

      // Exit the loop if the nozzle doesn't exist (in stitch area)
      if (!drop.exist) {
        pixel++;
        continue;
      }

      // Calculate the drop y position
      drop.y = y * pixelSize;

      newDrops.push(drop);

      // Increment pixel and eventually head
      if (isTestPattern) {
        if (head === numberOfHeads - 1) {
          head = 0;
          pixel++;
        } else head++;
      } else pixel++;
    }

    const timeEnd = new Date();
    console.log(
      `Takes ${
        timeEnd.getSeconds() * 1000 +
        timeEnd.getMilliseconds() -
        (timeStart.getSeconds() * 1000 + timeStart.getMilliseconds())
      }ms`,
    );
    return newDrops;
  });

  /**
   * Load a tiff file in the file ref
   * @param fileBuffer
   * @returns
   */
  const loadTiff = (fileBuffer: ArrayBuffer) => {
    try {
      const tiff = decode(fileBuffer)[0];
      if (tiff === undefined) return;

      file.value = tiff;
    } catch (e) {
      throw `Can't load tiff: ${e}`;
    }
  };

  /**
   * Look for the closest nozzle from the coord
   * @param coord
   * @param precision
   * @param returnNozzleStitchMasked
   * @returns
   */
  const getClosestNozzle = (
    coord: coord,
    precision = 1,
    returnNozzleStitchMasked = false,
  ): nozzle | undefined => {
    const closeNozzles: nozzle[] = [];

    // Fetch closest nozzle from each printbars
    printbars.forEach((pb) => {
      const nozzle = pb.getClosestNozzle(
        coord,
        precision,
        returnNozzleStitchMasked,
      );

      if (nozzle === undefined) return;

      closeNozzles.push(nozzle);
    });

    return closeNozzles[0];
  };

  /**
   * Get the closest head composable from the coord
   * @param coord
   * @param precision
   * @param returnNozzleStitchMasked
   * @returns
   */
  const getClosestHead = (
    coord: coord,
    precision = 1,
    returnNozzleStitchMasked = false,
  ): head | undefined => {
    const closeNozzle = getClosestNozzle(
      coord,
      precision,
      returnNozzleStitchMasked,
    );

    if (closeNozzle === undefined) return;

    return printbars[closeNozzle.printbar].heads[closeNozzle.head];
  };

  return { printbars, drops, loadTiff, getClosestNozzle, getClosestHead };
};

// A drop share the same properties than a nozzle
export type drop = nozzle;
