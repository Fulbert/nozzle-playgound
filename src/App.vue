<script setup lang="ts">
import { ref } from 'vue';
import CanvasElement from './components/CanvasElement.vue'
import { usePrintbar } from './printbar';

const {heads, getNozzles} = usePrintbar();

const zoom = ref(10)

const wheel = (ev: WheelEvent) => {
  if (ev.altKey)
    heads.value[0].rotate(ev.deltaY / 100000);
  if (ev.ctrlKey) {
    ev.preventDefault()
    zoom.value += ev.deltaY / 1000;
  }
}

</script>

<template>
  <div @wheel="wheel">
    <CanvasElement :nozzles="getNozzles" :zoom="zoom" />
  </div>
</template>
