import { ref, onMounted, watchEffect } from "vue";
import { usePrinter, drop } from "./printer";
import { printbar } from "./printbar";
import { head, nozzle } from "./head";

/**
 * Display a printer in a canvas element
 * Everytime the printer's reactives attributes changes, the canvas is redrawn.
 * @param canvasId HTMLElement id attribute to hook the printer visualization
 * @param printer printer description
 * @returns
 */
export const useCanvas = (
  _canvasId = "printerCanvas",
  _printer = usePrinter(),
) => {
  // Deconstruc _printer parameter with methods and states to use in canvas
  const { printbars, drops, getClosestHead, loadTiff } = _printer;

  // Define reactives variables (changing them would trigger redrawing)
  const canvasId = ref(_canvasId);
  const canvas = ref<HTMLCanvasElement>();
  const context = ref<CanvasRenderingContext2D | null>(null);
  const nozzleSize = ref(1.5);
  const dropSize = ref(0.25);
  const screenCoverage = ref(1);
  const zoom = ref(10);
  const offset = ref([10, 10]);

  // Define variables shared by different methods in the composable, but not reactives
  const dragStart: coord = [0, 0];
  let eventTimeout: number;
  let wheelDelta = 0;

  /**
   * Draw the canvas when the composable is mounted
   */
  onMounted(() => draw());

  /**
   * Draw the canvas
   * @returns void
   */
  const draw = () => {
    canvas.value = document.getElementById(canvasId.value) as HTMLCanvasElement;
    if (canvas.value === null) return;

    context.value = canvas.value.getContext("2d");
    if (context.value === null) return;

    canvas.value.width = window.innerWidth;
    canvas.value.height = window.innerHeight;

    clear();
    drawPrinter();
    drawPrint();
  };

  /**
   * Clear the canvas (used before redrawing)
   * @returns void
   */
  const clear = () => {
    if (context.value === null || canvas.value === undefined) return;

    context.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
  };

  /**
   * Draw the printer (printbars > heads > nozzles)
   */
  const drawPrinter = () => {
    printbars.forEach((pb) => drawPrintbar(pb));
  };

  /**
   * Draw a printbar
   * @param printbar composable
   */
  const drawPrintbar = (printbar: printbar) => {
    printbar.heads.forEach((h) => drawHead(h));
  };

  /**
   * Draw a head
   * @param head composable
   */
  const drawHead = (head: head) => {
    head.nozzles.value.forEach((n) => drawNozzle(n));
  };

  /**
   * Draw the print
   */
  const drawPrint = () => {
    const dropsToDraw = [...drops.value]; // deconscruct drops ref to break reactiveness (for performance reasons)

    // loop through drops (use for for performances reasons)
    for (let i = 0, len = dropsToDraw.length; i < len; i++) {
      drawDrop(dropsToDraw[i]);
    }
  };

  /**
   * Draw a nozzle
   * @param nozzle
   * @returns void
   */
  const drawNozzle = (nozzle: nozzle) => {
    if (!nozzle.exist) return;

    if (context.value === null) return;

    const ctx = context.value;

    ctx.beginPath();
    ctx.fillStyle = "black";
    ctx.arc(
      nozzle.x * zoom.value + offset.value[0],
      nozzle.y * zoom.value + offset.value[1],
      nozzleSize.value,
      0,
      Math.PI * 2,
      true,
    );
    ctx.fillStyle = nozzle.color;
    ctx.fill();
  };

  /**
   * Draw a drop
   * @param drop
   * @returns void
   */
  const drawDrop = (drop: drop) => {
    const { x, y, color } = drop;

    if (screenCoverage.value !== 1) {
      if (Math.random() > screenCoverage.value) return;
    }

    if (context.value === null) return;

    const ctx = context.value;

    const arcX = x * zoom.value + offset.value[0];
    const arcY = y * zoom.value + window.innerHeight / 2;
    const arcSize = (dropSize.value * zoom.value) / 20;

    ctx.beginPath();
    ctx.arc(arcX, arcY, arcSize, 0, Math.PI * 2, true);
    ctx.fillStyle = color;
    ctx.fill();
  };

  /**
   * Handle wheel events (zoom, angle, stitch)
   * @param ev
   */
  const wheel = (ev: WheelEvent) => {
    wheelDelta += ev.deltaY;

    clearTimeout(eventTimeout);

    eventTimeout = setTimeout(() => {
      const coord = getEventAbsoluteCoord(ev);
      if (coord === undefined) return;

      const head = getClosestHead(coord);
      if (head === undefined) return;

      if (ev.shiftKey) {
        head.adjustStitch(wheelDelta / 10000);
        wheelDelta = 0;
        return;
      }

      if (ev.altKey) {
        head.rotate(wheelDelta / 100000);
        wheelDelta = 0;
        return;
      }

      zoom.value += wheelDelta / 50;
      wheelDelta = 0;

      const x = (-(ev.x - window.innerWidth / 2) * 8) / zoom.value;
      changeOffset([x, 0]);
    }, 100);
  };

  /**
   * Handle mousedown event to pan in the canvas
   * Save the start of the mouse movement
   * @param ev
   */
  const moveStart = (ev: MouseEvent) => {
    dragStart[0] = ev.x;
    dragStart[1] = ev.y;
  };

  /**
   * Handle mouseup event to pan in the canvas
   * Trigger the move
   * @param ev
   */
  const moveEnd = (ev: MouseEvent) => {
    changeOffset([ev.x - dragStart[0], 0]);
  };

  /**
   * Calculate the absolute position of a MouseEvent within the canvas
   * The nozzle position is always calculated at 1:1 size
   * Zoom is applied during drawing
   * When a event occur in the window, the method calculate it's absolute position in the nozzle scale (1:1)
   * @param ev
   * @returns
   */
  const getEventAbsoluteCoord = (ev: MouseEvent): coord | undefined => {
    if (ev.target === null) return;

    const rect = (ev.target as HTMLCanvasElement).getBoundingClientRect();

    return [
      (ev.x - rect.left - offset.value[0]) / zoom.value,
      (ev.y - rect.top - offset.value[1]) / zoom.value,
    ];
  };

  /**
   * Handle dragover events (to permit drop event)
   * @returns
   */
  const dragOver = () => {
    return false;
  };

  /**
   * Handle drop events to load tiff files
   * @param ev
   * @returns void
   */
  const drop = async (ev: DragEvent) => {
    if (ev.dataTransfer?.items[0]) {
      const file = ev.dataTransfer.items[0].getAsFile();
      if (file === null) return;

      loadTiff(await file.arrayBuffer());
    }
  };

  /**
   * Change offset
   * Helper method
   * @param _offset
   */
  const changeOffset = (_offset: coord) => {
    const x = offset.value[0] + _offset[0];
    const y = offset.value[1] + _offset[1];

    offset.value = [x, y];
  };

  /**
   * All reactives variables used in the draw functions will trigger a re-draw
   * If print, printbars, nozzles are changed, the canvas will be re-draw.
   */
  watchEffect(() => {
    draw();
  });

  /**
   * Return methods and states used by the canvas element
   * printer is return for troubleshooting purposes
   */
  return { wheel, moveStart, moveEnd, dragOver, drop, printer: _printer };
};

/**
 * [x, y] coordinates
 */
export type coord = [number, number];
