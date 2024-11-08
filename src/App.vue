<script setup lang="ts">
import { computed, onMounted } from 'vue';
import CanvasElement from './components/CanvasElement.vue'
import { useNozzlePlate } from './head';

const nozzlePlates = [useNozzlePlate()]

const nozzles = computed(() => {
  const _nozzles: number[][] = []
  nozzlePlates.forEach(n => _nozzles.push(...n.nozzlesCoordinates.value))

  return _nozzles;
})

const rotate = (ev: WheelEvent) => {
  nozzlePlates[0].rotate(ev.deltaY / 1000);
}

</script>

<template>
  <div @wheel="rotate">
    <CanvasElement :nozzles="nozzles" />
  </div>
</template>
