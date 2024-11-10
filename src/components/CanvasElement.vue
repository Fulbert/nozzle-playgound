<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import * as masks from '../masks'
import { nozzle } from '../head';

const {nozzles, zoom, offset, draw: drawTrigger} = defineProps<{
  nozzles: nozzle[],
  zoom: number;
  offset: number[]
  draw: number
}>()

const canvasId = 'canvasEl'

const context = ref<CanvasRenderingContext2D>()
const canvas = ref<HTMLCanvasElement>()
const nozzleSize = ref(1.5);
const dropSize = ref(0.5);
const printLength = ref(100); // pixels
const screenCoverage = ref(1);

onMounted(() => {
  canvas.value = document.getElementById(canvasId) as HTMLCanvasElement;

  if (canvas) {
    context.value = canvas.value.getContext('2d') || undefined;
    canvas.value.width = window.innerWidth;
    canvas.value.height = window.innerHeight;
    
    draw()
  }
})

watch(() => drawTrigger, () => {
  draw();
})

const clear = () => {
  if (context.value === undefined || canvas.value === undefined) return

  context.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
}

const draw = () => {
  clear()
  drawNozzlePlate();
  drawPrint();
}

const drawNozzlePlate = () => {
  nozzles.forEach(n => drawNozzle(n));
}

const drawPrint= () => {
  for (let y = 0 ; y < window.innerHeight ; y++) {
    drawLine(nozzles, y, masks.stitch)
  }
}

const drawLine = (nozzles: nozzle[], line: number, mask: (n: nozzle) => boolean) => {
  const drops = nozzles.filter(n => n.exist)
    .filter((n) => mask(n))

  drops.forEach(d => drawDrop(d.x, line))
}

const drawNozzle = (coord: nozzle) => {
  if (!coord.exist) return

  if (context.value === undefined) return
  const ctx = context.value;

  ctx.beginPath();
  ctx.arc(
    coord.x * zoom + offset[0], 
    coord.y * zoom + offset[1],
    nozzleSize.value, 
    0, Math.PI * 2, true);
  ctx.fill();
}

const drawDrop = (x: number, y: number) => {
  if (screenCoverage.value !== 1) {
    if (Math.random() > screenCoverage.value)
    return;
  }
  
  if (context.value === undefined)
    return;

  const ctx = context.value

  const arcX = x * zoom + offset[0]
  const arcY = y // + window.innerHeight / 2
  const arcSize = dropSize.value * zoom / 20

  ctx.beginPath()
  ctx.arc(arcX, 
    arcY,
    arcSize,
    0, Math.PI * 2, true);
  ctx.fill();
}
</script>

<template>
  <canvas id="canvasEl"/>
</template>