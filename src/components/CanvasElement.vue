<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { generateLine, generateNozzlesCoordinates } from '../head.ts'

const canvasId = 'canvasEl'

const nozzles = ref(generateNozzlesCoordinates())
const context = ref<CanvasRenderingContext2D>()
const zoom = ref(4);
const offset = ref([10,10])
const nozzleSize = ref(1.5);
const dropSize = ref(0.3);

onMounted(() => {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;

  if (canvas) {
    context.value = canvas.getContext('2d') || undefined;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    drawNozzlePlate();
    drawLine()
  }
})

const drawNozzlePlate = () => {
  nozzles.value.forEach(n => drawNozzle(n));
}

const drawLine = () => {
  const drops = generateLine(nozzles.value)
  drops.forEach(d => drawDrop(d))
}

const drawNozzle = (coord = [0,0]) => {
  if (context.value === undefined) return
  const ctx = context.value;

  ctx.beginPath();
  ctx.arc(
    coord[0] * zoom.value + offset.value[0], 
    coord[1] * zoom.value + offset.value[1],
    nozzleSize.value, 
    0, Math.PI * 2, true);
  ctx.fill();
}

const drawDrop = (d: number) => {
  if (context.value === undefined) return
  const ctx = context.value

  ctx.beginPath()
  ctx.arc(d * zoom.value + offset.value[0], 
    nozzles.value[nozzles.value.length - 1][1] * zoom.value + offset.value[1] * 2,
    dropSize.value, 0, Math.PI * 2, true);
  ctx.fill();
}
</script>

<template>
  <canvas id="canvasEl"/>
</template>