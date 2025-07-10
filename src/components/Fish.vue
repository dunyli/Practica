<template>
  <div class="fish-wrapper">
    <!-- Радиус обнаружения-->
    <div 
      v-if="showRadius"
      class="detection-radius"
      :style="radiusStyle"
      :title="`Радиус обнаружения: ${radius}px`"
    ></div>
    <!-- Шкала голода -->
    <div class="hunger-bar" :style="hungerBarStyle"></div>
    <div
      class="fish"
      :class="[species, type]"
      :style="fishStyle"
      :title="getFishTitle"
    ></div>
  </div>
</template>

<script>
import { useEcosystemStore } from '@/stores/ecosystem';
import { computed } from 'vue';

export default {
  props: {
    x: Number,
    y: Number,
    size: Number,
    direction: Number,
    type: String,
    species: String,
    color: String,
    hunger: {
      type: Number,
      required: true,
      validator: value => value >= 0 && value <= 200
    },
    detectionRadius: Number
  },

    setup(props) {

    const store = useEcosystemStore();
    // Получаем радиус для текущего вида рыбы
    const radius = computed(() => props.detectionRadius || 40);
    
    const showRadius = computed(() => store.showDetectionRadius);


    const radiusStyle = computed(() => ({
      left: `calc(50% - ${radius.value}px)`,
      top: `calc(50% - ${radius.value}px)`,
      width: `${radius.value * 2}px`,
      height: `${radius.value * 2}px`,
      backgroundColor: hexToRgba(props.color, 0.2)
    }));

    const fishStyle = computed(() => ({
      width: `${props.size}px`,
      height: `${props.size}px`,
      transform: `rotate(${props.direction}rad)`,
      backgroundColor: props.color,
    }));

    // Стиль для шкалы голода
    const hungerBarStyle = computed(() => {
      const hungerPercent = Math.min(props.hunger, 200) / 2; // Преобразуем 0-200 в 0-100%
      const barWidth = props.size * 1.5; // Ширина шкалы немного больше размера рыбы
      
      return {
        width: `${barWidth}px`,
        height: '3px',
        background: `linear-gradient(to right, #4CAF50 ${100 - hungerPercent}%, #F44336 ${100 - hungerPercent}%)`,
        left: `calc(50% - ${barWidth / 2}px`,
        top: `-8px`
      };
    });

    function hexToRgba(hex, alpha) {
      const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    return {
      store,
      showRadius,
      radius,
      radiusStyle,
      fishStyle,
      hungerBarStyle,
    };
  }
};
</script>

<style scoped>

.fish-wrapper {
  position: absolute;
  transform: translate(-50%, -50%);
  left: v-bind('x + "px"');
  top: v-bind('y + "px"');
}

.fish {
  position: relative;
  border-radius: 50%;
  transition: all 0.3s ease;
  transform-origin: center;
  z-index: 1;
}

.detection-radius {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.7;
  transition: all 0.3s ease; 
  filter: blur(2px)
}

.hunger-bar {
  position: absolute;
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  z-index: 2;
}

</style>