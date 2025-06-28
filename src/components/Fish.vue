<template>
  <div
    class="fish"
    :class="type"
    :style="{
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      transform: `rotate(${direction}rad)`,
      opacity: energy / 100
    }"
  ></div>
</template>

<script>
export default {
  props: {
    x: Number,
    y: Number,
    size: Number,
    direction: Number,
    type: String,
    energy: Number
  }
};
</script>

<style>
.fish {
  position: absolute;
  border-radius: 50%;
  transition: transform 0.5s ease, left 0.5s ease, top 0.5s ease;
}

.fish.herbivore {
  background-color: #4e9a06;
}

.fish.predator {
  background-color: #cc0000;
}

.fish::after {
  content: '';
  position: absolute;
  right: -5px;
  top: 50%;
  width: 0;
  height: 0;
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
  border-left: 10px solid currentColor;
  transform: translateY(-50%);
}
</style>