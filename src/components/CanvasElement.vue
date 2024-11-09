<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const {nozzles, zoom, offset} = defineProps<{
  nozzles: number[][],
  zoom: number;
  offset: number[]
}>()

const canvasId = 'canvasEl'

const context = ref<CanvasRenderingContext2D>()
const canvas = ref<HTMLCanvasElement>()
const nozzleSize = ref(1.5);
const dropSize = ref(0.3);
const printLength = ref(10); // pixels

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
  drawLine()
}

const drawNozzlePlate = () => {
  nozzles.forEach(n => drawNozzle(n));
}

const drawLine = () => {
  const drops = nozzles.map(n => n[0])
  drops.forEach(d => drawDrop(d))
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

const drawDrop = (d: number) => {
  if (context.value === undefined) return
  const ctx = context.value
  ctx.beginPath()
  /**
  ctx.moveTo(d * zoom + offset[0], nozzles[nozzles.length - 1][1] * zoom + offset[1] + 10);
  ctx.lineTo(d * zoom + offset[0], nozzles[nozzles.length - 1][1] * zoom + offset[1] + 100);
  ctx.stroke(); */
  ctx.arc(d * zoom + offset[0], 
    nozzles[nozzles.length - 1][1] * zoom + offset[1] + 10,
    dropSize.value * zoom / 20, 0, Math.PI * 2, true);
  ctx.fill();
}
</script>

<template>
  <canvas id="canvasEl"/>
</template>