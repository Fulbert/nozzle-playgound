<script setup lang="ts">
import { ref } from 'vue';
import CanvasElement from './components/CanvasElement.vue'
import { usePrintbar } from './printbar';

const {heads, getNozzles} = usePrintbar();

const zoom = ref(10)
const offset = ref([0,0])
const dragStart = [0,0]
let eventTimeout: number;
let wheelDelta = 0;

const wheel = (ev: WheelEvent) => {
  ev.preventDefault();

  wheelDelta += ev.deltaY,

  clearTimeout(eventTimeout);

  eventTimeout = setTimeout(() => {
    if (ev.shiftKey)
      heads.value[0].adjustStitch(wheelDelta / 10000);
    if (ev.altKey)
      heads.value[0].rotate(wheelDelta / 100000);
    if (ev.ctrlKey) {
      zoom.value += wheelDelta / 100;
    }
    wheelDelta = 0
  }, 100);
}

const moveStart = (ev: DragEvent) => {
  dragStart[0] = ev.x
  dragStart[1] = ev.y
}

const moveEnd = (ev: DragEvent) => {
  offset.value = [
    offset.value[0] + ev.x - dragStart[0], 
    offset.value[1] + ev.y - dragStart[1]
  ]
}

</script>

<template>
  <div @wheel="wheel" @dragstart="moveStart" @dragend="moveEnd" draggable="true">
    <CanvasElement :nozzles="getNozzles" :zoom="zoom" :offset="offset" />
  </div>
</template>
