<script setup lang="ts">
import {useCanvas} from '../canvas'

const {click, wheel, moveStart, moveEnd, dragOver, drop} = useCanvas()

</script>

<template>
  <canvas id="canvasEl"
    @click.prevent="click"
    @wheel.prevent="wheel"
    @dragstart.prevent="moveStart"
    @dragend.prevent="moveEnd"
    @dragover.prevent="dragOver"
    @drop.prevent="drop"
    draggable="true" dropzone="copy" />
</template>