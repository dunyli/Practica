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
      
      <Invertebrate
        v-for="inv in invertebrates"
        :key="inv.id"
        :x="inv.x"
        :y="inv.y"
        :size="inv.size"
      />
      
      <Fish
        v-for="fish in fishes"
        :key="fish.id"
        :x="fish.x"
        :y="fish.y"
        :size="fish.size"
        :direction="fish.direction"
        :type="fish.type"
        :species="fish.species"
        :energy="fish.energy"
        :color="fish.color"
      />
      
      <Larva
        v-for="larva in larvae"
        :key="larva.id"
        :x="larva.x"
        :y="larva.y"
        :size="larva.size"
        :species="larva.species"
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
      <div>Беспозвоночных: {{ invertebrates.length }}</div>
      <div>Личинок: {{ larvae.length }}</div>
      
      <div class="species-count">
        <div v-for="(count, species) in speciesCount" :key="species">
          {{ fishNames[species] }}: {{ count }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useEcosystemStore } from '../stores/ecosystem';
import Fish from './Fish.vue';
import Plant from './Plant.vue';
import Larva from './Larva.vue';
import Invertebrate from './Invertebrate.vue';

export default {
  components: { Fish, Plant, Larva, Invertebrate },
  setup() {
    const store = useEcosystemStore();
    
    if (store.fishes.length === 0) {
      store.initialize();
    }
    
    setInterval(store.updateEcosystem, 50);
    
    const fishNames = {
      pike: 'Щука',
      silver_carp: 'Толстолобик',
      crucian: 'Карась',
      carp: 'Карп'
    };
    
    const speciesCount = computed(() => {
      const count = {};
      store.fishes.forEach(fish => {
        count[fish.species] = (count[fish.species] || 0) + 1;
      });
      return count;
    });
    
    return {
      width: computed(() => store.width),
      height: computed(() => store.height),
      fishes: computed(() => store.fishes),
      plants: computed(() => store.plants),
      invertebrates: computed(() => store.invertebrates),
      larvae: computed(() => store.larvae),
      time: computed(() => store.time),
      isRunning: computed(() => store.isRunning),
      speciesCount,
      fishNames,
      toggleSimulation: store.toggleSimulation,
      reset: store.reset
    };
  }
};
</script>

<style>
.species-count {
  margin-top: 10px;
  padding: 5px;
  background: #e0e0e0;
  border-radius: 3px;
}
</style>