<!--
Copyright 2021 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

/**
* @author Rikard Lindstrom <rlindstrom@google.com>
*/
-->
<!-- <script>
  import { onMount } from "svelte";
  import { afterUpdate } from "svelte";

  export let data;
  export let index;
  console.log(data);

  //const local_data = data;

  onMount(() => {
    const local_data = data;
    // const canvas = document.getElementById('imageCanvas');
    const canvas = document.getElementById('canvas_'+index);
    const context = canvas.getContext('2d');
    console.log(index);

    // 픽셀 데이터 배열을 canvas에 적용
    for (let y = 0; y < 96; y++) {
      for (let x = 0; x < 96; x++) {
        const r = local_data[y][x][0];
        const g = local_data[y][x][1];
        const b = local_data[y][x][2];
        context.fillStyle = `rgb(${r},${g},${b})`;
        context.fillRect(x, y, 1, 1);
      }
    }
  });
  

</script> -->

<script>
  import { onMount, afterUpdate } from "svelte";

  export let data;
  export let index;

  let canvas, context;

  onMount(() => {
    canvas = document.getElementById('canvas_' + index);
    context = canvas.getContext('2d');
    drawCanvas(data); 
  });

  afterUpdate(() => {
    drawCanvas(data); 
  });

  function drawCanvas(data) {
    for (let y = 0; y < 96; y++) {
      for (let x = 0; x < 96; x++) {
        const [r, g, b] = data[y][x];
        context.fillStyle = `rgb(${r},${g},${b})`;
        context.fillRect(96-x, y, 1, 1);
      }
    }
  }
</script>

<canvas id={"canvas_"+index} width="96" height="96"></canvas>

<style lang="scss">
  canvas{
    width: 100%;
    height: 100%;
  }
</style>
