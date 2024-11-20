<script setup lang="ts">
import { useCanvas } from '../canvas';

/**
 * Import methods and state used for canvas from composable
 * printer is imported for troubleshooting purpose (Vue plugin inpection)
 */
const { wheel, moveStart, moveEnd, dragOver, drop } = useCanvas();
</script>

<template>
  <canvas
    id="printerCanvas"
    draggable="true"
    dropzone="copy"
    @wheel.prevent="wheel"
    @mousedown.prevent="moveStart"
    @mouseup.prevent="moveEnd"
    @dragover.prevent="dragOver"
    @drop.prevent="drop"
  />
</template>
