<script setup lang="ts">
import { ref } from 'vue'

const canvasId = "canvasEl"

onMounted(() => {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d'); 

  drawNozzlePlate(ctx);
})

const drawNozzlePlate = (ctx) => {

}
</script>

<template>
  <canvas id="canvasEl" />
</template>