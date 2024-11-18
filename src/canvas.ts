import { ref, onMounted, watchEffect } from 'vue'
import { usePrinter, drop } from './printer';
import { printbar } from './printbar';
import { head, nozzle } from './head';

/**
 * Display a printer in a canvas
 * @param canvasId HTMLElement id attribute to hook the printer visualization
 * @param printer printer description
 * @returns 
 */
export const useCanvas = (_canvasId = 'canvasEl', _printer = usePrinter()) => {
    const {
        printbars,
        drops,
        getClosestHead,
        loadTiff,
        calculateDrops
    } = _printer

    const context = ref<CanvasRenderingContext2D>()
    const canvas = ref<HTMLCanvasElement>()
    const nozzleSize = ref(1.5);
    const dropSize = ref(0.25);
    const screenCoverage = ref(1);
    const zoom = ref(10)  
    const offset = ref([10,10])
    const dragStart = [0,0]
    let eventTimeout: number;
    let wheelDelta = 0;

    const clear = () => {
        if (context.value === undefined || canvas.value === undefined) return

        context.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
    }

    onMounted(() => draw())

    const draw = () => { 
        canvas.value = document.getElementById(_canvasId) as HTMLCanvasElement;
        if (canvas.value === null)
            return

        context.value = canvas.value.getContext('2d') || undefined;
        if (context.value === undefined )
            return

        canvas.value.width = window.innerWidth;
        canvas.value.height = window.innerHeight;
        
        clear()
        drawPrinter();
        drawPrint();
    }

    const drawPrinter = () => {
        printbars.forEach(pb => drawPrintbar(pb))
    }

    const drawPrintbar = (printbar: printbar) => {
        printbar.heads.forEach(h => drawHead(h))
    }

    const drawHead = (head: head) => {
        head.nozzlesCoordinates.value.forEach(n => drawNozzle(n));
    }

    const drawPrint= () => {
        const dropsToDraw = drops.value
        for (let i = 0, len = dropsToDraw.length ; i < len ; i++) {
            drawDrop(dropsToDraw[i], i)
        }
    }

    const drawNozzle = (coord: nozzle) => {
        if (!coord.exist) return

        if (context.value === undefined) return
        const ctx = context.value;

        ctx.beginPath();
        ctx.fillStyle = 'black'
        ctx.arc(
            coord.x * zoom.value + offset.value[0], 
            coord.y * zoom.value + offset.value[1],
            nozzleSize.value, 
            0, Math.PI * 2, true);
        ctx.fillStyle = coord.color
        ctx.fill();
    }

    const drawDrop = (drop: drop, _i = 1) => {
        const {x, y, color} = drop

        if (screenCoverage.value !== 1) {
            if (Math.random() > screenCoverage.value)
            return;
        }
        
        if (context.value === undefined)
            return;

        const ctx = context.value

        const arcX = (x * zoom.value) + offset.value[0]
        const arcY = (y * zoom.value) + (window.innerHeight / 2)
        const arcSize = dropSize.value * zoom.value / 20

        ctx.beginPath()
        ctx.arc(arcX, 
            arcY,
            arcSize,
            0, Math.PI * 2, true); 
        ctx.fillStyle = color
        ctx.fill();
    }

    const wheel = (ev: WheelEvent) => {
        wheelDelta += ev.deltaY,

        clearTimeout(eventTimeout);

        eventTimeout = setTimeout(() => {
            const coord = getEventAbsoluteCoord(ev)
            if (coord === undefined) throw `Can't get event absolute coordinates. Event: ${ev}`

            const head = getClosestHead(coord)
            if (head === undefined) throw `Can't find close nozzle for coordinates ${coord}`


            if (ev.shiftKey){
                head.adjustStitch(wheelDelta / 10000);
                wheelDelta = 0
                return
            }

            if (ev.altKey){
                head.rotate(wheelDelta / 100000);
                wheelDelta = 0
                return
            }

            zoom.value += wheelDelta / 50;
            wheelDelta = 0

            const x = -(ev.x - (window.innerWidth / 2))*8 / zoom.value
            changeOffset([x, 0])

        }, 100);
    }

    const moveStart = (ev: MouseEvent) => {
        dragStart[0] = ev.x
        dragStart[1] = ev.y
    }

    const moveEnd = (ev: MouseEvent) => {
        changeOffset([ev.x - dragStart[0], 0])
    }

    const getEventAbsoluteCoord = (ev: MouseEvent) : [number, number] | undefined => {
        if (ev.target === null) return

        const rect = (ev.target as HTMLCanvasElement).getBoundingClientRect()

        return [
            (ev.x - rect.left - offset.value[0])/zoom.value,
            (ev.y - rect.top - offset.value[1])/zoom.value
        ]
    }

    const dragOver = () => {
        return false;
    }

    const drop = async (ev: DragEvent) => {
        if (ev.dataTransfer?.items[0]) {
            const file = ev.dataTransfer.items[0].getAsFile();
            if (file === null)
            return

            loadTiff(await file.arrayBuffer())
            calculateDrops()
        }
    }

    const changeOffset = (_offset: [number, number]) => {
        const x = offset.value[0] + _offset[0]
        const y = offset.value[1] + _offset[1]

        offset.value = [x, y]
    }

    watchEffect(() => {
        draw()
    })

    return {wheel, moveStart, moveEnd, dragOver, drop, drops}
}