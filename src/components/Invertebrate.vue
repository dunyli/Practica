<template>
  <div
    class="invertebrate"
    :style="{
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      transform: `rotate(${Math.random() * 360}deg)`
    }"
    title="Беспозвоночное"
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
.invertebrate {
  position: absolute;
  background-color: #ad7fa8;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.8;
}
</style>