<template>
  <div
    class="fish"
    :class="[species, type]"
    :style="{
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      transform: `rotate(${direction}rad)`,
      opacity: energy / 100,
      backgroundColor: color,
      border: species === 'pike' ? '2px solid #3a1a3a' : 'none'
    }"
    :title="`${fishNames[species]} (${Math.round(energy)}%, размер: ${Math.round(size)})`"
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
    species: String,
    energy: Number,
    color: String
  },
  data() {
    return {
      fishNames: {
        pike: 'Щука',
        silver_carp: 'Толстолобик',
        crucian: 'Карась',
        carp: 'Карп'
      }
    };
  }
};
</script>

<style>
.fish {
  position: absolute;
  border-radius: 50%;
  transition: transform 0.5s ease, left 0.5s ease, top 0.5s ease;
  transform-origin: center;
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
  border-left: 10px solid rgba(0, 0, 0, 0.5);
  transform: translateY(-50%);
}

/* Стиль для щуки */
.fish.pike {
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
}

.fish.pike::after {
  border-left-width: 15px;
  right: -8px;
}
</style>