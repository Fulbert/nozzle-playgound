<script setup lang="ts">
import { computed, ref } from 'vue';
import CanvasElement from './components/CanvasElement.vue'
import { useNozzlePlate } from './head';

const nozzlePlates = [useNozzlePlate()]

const nozzles = computed(() => {
  const _nozzles: number[][] = []
  nozzlePlates.forEach(n => _nozzles.push(...n.nozzlesCoordinates.value))

  return _nozzles;
})

const zoom = ref(10)

const wheel = (ev: WheelEvent) => {
  if (ev.altKey)
    nozzlePlates[0].rotate(ev.deltaY / 100000);
  if (ev.ctrlKey) {
    ev.preventDefault()
    zoom.value += ev.deltaY / 1000;
  }
}

</script>

<template>
  <div @wheel="wheel">
    <CanvasElement :nozzles="nozzles" :zoom="zoom" />
  </div>
</template>
