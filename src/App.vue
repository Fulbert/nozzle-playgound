<script setup lang="ts">
import { ref } from 'vue';
import CanvasElement from './components/CanvasElement.vue'
import { usePrintbar } from './printbar';

const {heads, getNozzles, getClosestNozzle} = usePrintbar();

const zoom = ref(10)
const offset = ref([10,10])
const dragStart = [0,0]
let eventTimeout: number;
let wheelDelta = 0;

const wheel = (ev: WheelEvent) => {
  ev.preventDefault();

  wheelDelta += ev.deltaY,

  clearTimeout(eventTimeout);

  eventTimeout = setTimeout(() => {
    if (ev.ctrlKey) {
      zoom.value += wheelDelta / 100;
    }

    const coord = getEventAbsoluteCoord(ev)
    if (coord === undefined) throw `Can't get event absolute coordinates. Event: ${ev}`

    const nozzle = getClosestNozzle(coord)
    if (nozzle === undefined) throw `Can't find close nozzle for coordinates ${coord}`
    
    const head = nozzle[3]

    if (ev.shiftKey)
      heads.value[head].adjustStitch(wheelDelta / 10000);
    if (ev.altKey)
      heads.value[head].rotate(wheelDelta / 100000);
    wheelDelta = 0
  }, 50);
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

const click = (ev: MouseEvent) => {
  const coord = getEventAbsoluteCoord(ev)
  if (coord === undefined) return

  const nozzle = getClosestNozzle(coord) || undefined

  console.log(nozzle)
}

const getEventAbsoluteCoord = (ev: MouseEvent) : [number, number] | undefined => {
  if (ev.target === null) return

  const rect = (ev.target as HTMLCanvasElement).getBoundingClientRect()

  return [
    (ev.x - rect.left - offset.value[0])/zoom.value,
    (ev.y - rect.top - offset.value[1])/zoom.value
  ]
}

</script>

<template>
  <div>
    <CanvasElement :nozzles="getNozzles" :zoom="zoom" :offset="offset" 
      @click="click"
      @wheel="wheel"
      @dragstart="moveStart"
      @dragend="moveEnd"
      draggable="true" />
  </div>
</template>
