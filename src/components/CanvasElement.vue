<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NozzlePlate } from '../head.ts'

const canvasId = 'canvasEl'

const nozzlePlates = [new NozzlePlate()]

const context = ref<CanvasRenderingContext2D>()
const zoom = ref(15);
const offset = ref([50,50])
const nozzleSize = ref(1.5);
const dropSize = ref(0.3);

onMounted(() => {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;

  nozzlePlates[0].rotate(0);

  if (canvas) {
    context.value = canvas.getContext('2d') || undefined;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    drawNozzlePlate();
    drawLine()
  }
})

const drawNozzlePlate = () => {
  nozzlePlates[0].nozzlesCoordinates.forEach(n => drawNozzle(n));
}

const drawLine = () => {
  const drops = nozzlePlates[0].generateLine()
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
    nozzlePlates[0].nozzlesCoordinates[nozzlePlates[0].nozzlesCoordinates.length - 1][1] * zoom.value + offset.value[1] * 2,
    dropSize.value, 0, Math.PI * 2, true);
  ctx.fill();
}
</script>

<template>
  <canvas id="canvasEl"/>
</template>