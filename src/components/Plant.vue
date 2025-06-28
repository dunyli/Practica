<template>
  <div
    class="plant"
    :style="{
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`
    }"
  ></div>
</template>

<script>
export default {
  props: {
    x: Number,
    y: Number,
    size: Number
  }
};
</script>

<style>
.plant {
  position: absolute;
  background-color: #2ec27e;
  border-radius: 50%;
  transform: translate(-50%, -50%);
}
</style>

