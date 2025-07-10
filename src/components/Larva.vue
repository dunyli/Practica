<template>
  <div
    class="larva"
    :class="species"
    :style="{
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: larvaColor
    }"
    :title="`Личинка ${fishNames[species]}`"
  ></div>
</template>

<script>
export default {
  props: {
    x: Number,
    y: Number,
    size: Number,
    species: String,
    hatchProgress: Number
  },
  data() {
    return {
      fishNames: {
        pike: 'щуки',
        silver_carp: 'толстолобика',
        crucian: 'карася',
        carp: 'карпа'
      },
      colors: {
        pike: '#8a2be2',
        silver_carp: '#7cfc00',
        crucian: '#ffd700',
        carp: '#ff8c00'
      }
    };
  },
  computed: {
    larvaColor() {
      return this.colors[this.species] || '#f9f06b';
    },
    isHatching() {
      return this.hatchProgress > 90;
    }
  }
};
</script>

<style>
.larva {
  position: absolute;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.9;
  transition: all 0.3s ease;
}
</style>