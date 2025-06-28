<template>
  <div class="pond-container">
    <div class="pond" :style="{ width: `${width}px`, height: `${height}px` }">
      <Plant
        v-for="plant in plants"
        :key="plant.id"
        :x="plant.x"
        :y="plant.y"
        :size="plant.size"
      />
      
      <Fish
        v-for="fish in fishes"
        :key="fish.id"
        :x="fish.x"
        :y="fish.y"
        :size="fish.size"
        :direction="fish.direction"
        :type="fish.type"
        :energy="fish.energy"
      />
      
      <Larva
        v-for="larva in larvae"
        :key="larva.id"
        :x="larva.x"
        :y="larva.y"
        :size="larva.size"
      />
    </div>
    
    <div class="controls">
      <button @click="toggleSimulation">
        {{ isRunning ? 'Пауза' : 'Старт' }}
      </button>
      <button @click="reset">Сброс</button>
      <div>Время: {{ time }}</div>
      <div>Рыб: {{ fishes.length }}</div>
      <div>Растений: {{ plants.length }}</div>
      <div>Личинок: {{ larvae.length }}</div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useEcosystemStore } from '../stores/ecosystem';
import Fish from './Fish.vue';
import Plant from './Plant.vue';
import Larva from './Larva.vue';

export default {
  components: { Fish, Plant, Larva },
  setup() {
    const store = useEcosystemStore();
    
    // Инициализация при первом запуске
    if (store.fishes.length === 0) {
      store.initialize();
    }
    
    // Запускаем обновление экосистемы
    setInterval(store.updateEcosystem, 50);
    
    return {
      width: computed(() => store.width),
      height: computed(() => store.height),
      fishes: computed(() => store.fishes),
      plants: computed(() => store.plants),
      larvae: computed(() => store.larvae),
      time: computed(() => store.time),
      isRunning: computed(() => store.isRunning),
      toggleSimulation: store.toggleSimulation,
      reset: store.reset
    };
  }
};
</script>

<style>
.pond {
  position: relative;
  background-color: #a0c8f0;
  border: 2px solid #1a5fb4;
  margin-bottom: 10px;
  overflow: hidden;
}

.controls {
  padding: 10px;
  background: #f0f0f0;
  border-radius: 5px;
}

button {
  margin-right: 10px;
  padding: 5px 10px;
}
</style>