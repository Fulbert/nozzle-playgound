<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as masks from '../masks'

const {nozzles, zoom, offset} = defineProps<{
  nozzles: number[][],
  zoom: number;
  offset: number[]
}>()

const canvasId = 'canvasEl'

const context = ref<CanvasRenderingContext2D>()
const canvas = ref<HTMLCanvasElement>()
const nozzleSize = ref(1.5);
const dropSize = ref(1);
const printLength = ref(100); // pixels
const screenCoverage = ref(1);

onMounted(() => {
  canvas.value = document.getElementById(canvasId) as HTMLCanvasElement;

  if (canvas) {
    context.value = canvas.value.getContext('2d') || undefined;
    canvas.value.width = window.innerWidth;
    canvas.value.height = window.innerHeight -100;
    
    draw()
  }
})

watch(() => nozzles, () => draw())
watch(() => zoom, () => draw())
watch(() => offset, () => draw())

const clear = () => {
  if (context.value === undefined || canvas.value === undefined) return

  context.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
}

const draw = () => {
  console.log('draw')
  clear()
  drawNozzlePlate();
  drawPrint();
  
}

const drawNozzlePlate = () => {
  nozzles.forEach(n => drawNozzle(n));
}

const drawPrint= () => {
  const nozzlesX = nozzles.map((n) => n[0])

  nozzlesX.reduce((p, c, _i, _a) => {
    if(p > c) console.log(p, c, _i)
    return c
  }, 0)

  for (let i = 0 ; i < printLength.value ; i++) {
    drawLine(nozzlesX, i, masks.stitch)
  }
}

const drawLine = (nozzlesX: number[], line: number, mask: (i: number) => boolean) => {
  const drops = nozzlesX.filter((_n, i) => mask(i))

  drops.forEach(d => drawDrop(d, line))
}

const drawNozzle = (coord = [0,0]) => {
  if (context.value === undefined) return
  const ctx = context.value;

  ctx.beginPath();
  ctx.arc(
    coord[0] * zoom + offset[0], 
    coord[1] * zoom + offset[1],
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

  ctx.beginPath()
  ctx.arc(x * zoom + offset[0], 
    nozzles[nozzles.length - 1][1] * zoom + offset[1] + 10 + y,
    dropSize.value * zoom / 20, 0, Math.PI * 2, true);
  ctx.fill();
}
</script>

<template>
  <canvas id="canvasEl"/>
</template>