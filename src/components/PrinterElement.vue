<script setup lang="ts">
import {useCanvas} from '../canvas'

const { wheel, moveStart, moveEnd, dragOver, drop} = useCanvas()

</script>

<template>
  <canvas id="canvasEl"
    @wheel.prevent="wheel"
    @mousedown.prevent="moveStart"
    @mouseup.prevent="moveEnd"
    @dragover.prevent="dragOver"
    @drop.prevent="drop"
    draggable="true" dropzone="copy" />
</template>