<template>
  <div class="ecosystem-container">
    <div class="control-panel">
      <div class="settings">
        <h3>Начальные настройки</h3>
        <div class="setting-item" v-for="(value, key) in localSettings" :key="key">
          <label>{{ getLabel(key) }}:</label>
          <input 
            v-model.number="localSettings[key]" 
            type="number"
            min="0"
            @input="validateInput(key, $event)"
          >
          <span v-if="inputErrors[key]" class="error-message">{{ inputErrors[key] }}</span>
        </div>
        
        <button @click="applySettings" :disabled="hasErrors">Применить настройки</button>
      </div>

      <div class="info-panel">
        <h3>Текущее состояние</h3>
        <div>Время: {{ formatTime(realT) }}</div>
        <div>Растений: {{ plants.length }}</div>
        <div>Беспозвоночных: {{ invertebrates.length }}</div>
        <div>Личинок: {{ larvae.length }}</div>
        <div class="speed-control">
          <label>Скорость симуляции:</label>
          <input 
            type="range" 
            v-model.number="simulationSpeed" 
            min="0.1" 
            max="10" 
            step="0.1"
          >
          <span>{{ simulationSpeed }}x</span>
        </div>
        
        <div class="control-buttons">
          <button @click="toggleSimulation" :class="{ active: isRunning }">
            {{ isRunning ? '⏸ Пауза' : '▶ Старт' }}
          </button>
          <button @click="resetSimulation">🔄 Сброс</button>
          <button @click="store.toggleDetectionRadius">
            {{ store.showDetectionRadius ? '👁️‍🗨️ Скрыть радиус' : '👁️ Показать радиус' }}
          </button>
          <!-- Кнопка для настройки радиусов -->
          <button @click="toggleRadiusSettings" :class="{ active: showRadiusSettings }">
            {{ showRadiusSettings ? '🔼 Скрыть настройки радиусов' : '🔽 Настройки радиусов' }}
          </button>
        </div>

        <div v-if="showRadiusSettings" class="radius-settings-section">
          <h4>Настройки радиусов видимости:</h4>
          <div class="radius-controls">
            <div v-for="(radius, species) in store.Radius" :key="species" class="radius-control">
              <label>{{ getLabel(species) }}:</label>
              <div class="slider-wrapper">
                <input 
                  type="range" 
                  v-model.number="store.Radius[species]"
                  min="20" 
                  max="100" 
                  step="5"
                  @input="store.setDetectionRadius({ species, radius: store.Radius[species] })"
                >
              </div>
              <span class="radius-value">{{ store.Radius[species] }}px</span>
            </div>
          </div>
        </div>

        <div v-if="showEcosystemAlert" class="ecosystem-alert-overlay">
          <div class="ecosystem-alert">
            <h3>⚠️ Экосистема разрушена!</h3>
            <p>Все организмы погибли. Хотите начать заново?</p>
            <button @click="restartEcosystem">Запустить новую экосистему</button>
          </div>
        </div>
      </div>
    </div>

    <div class="pond-visualization">
      <div class="pond" :style="{ width: `${width}px`, height: `${height}px` }">
        <!-- Рыбы -->
        <Fish 
          v-for="fish in fishes" 
          :key="fish.id"
          :x="fish.x"
          :y="fish.y"
          :size="fish.size"
          :direction="fish.direction"
          :species="fish.species"
          :type="fish.type"
          :color="fish.color"
          :hunger="fish.hunger"
          :detectionRadius="fish.detectionRadius"
          :title="getFishTitle(fish)"
        />
        
        <!-- Растения -->
        <div 
          v-for="plant in plants" 
          :key="plant.id"
          class="plant"
          :style="getPlantStyle(plant)"
          :title="`Растение (размер: ${plant.size.toFixed(1)})`"
        ></div>
        
        <!-- Беспозвоночные -->
        <div 
          v-for="invertebrate in invertebrates" 
          :key="invertebrate.id"
          class="invertebrate"
          :style="getInvertebrateStyle(invertebrate)"
          :title="`Беспозвоночное (размер: ${invertebrate.size.toFixed(1)})`"
        ></div>
        <!-- Личинки с индикатором созревания -->
        <div 
          v-for="larva in larvae"
          :key="larva.id"
          class="larva-container"
          :style="{
            left: `${larva.x}px`,
            top: `${larva.y}px`
          }"
        >
          <div class="larva-maturity-bar">
            <div 
              class="maturity-progress"
              :style="{ width: `${larva.hatchProgress}%` }"
            ></div>
          </div>
          <div 
            class="larva"
            :class="larva.species"
            :style="{
              width: `${larva.size * 1.5}px`,
              height: `${larva.size}px`,
              transform: `translate(-50%, -50%) rotate(${larva.direction || 0}rad)`
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useEcosystemStore } from '../stores/ecosystem';
import { computed, ref, watch } from 'vue';
import Fish from './Fish.vue';

const store = useEcosystemStore();
const showEcosystemAlert = ref(false);
const wasRunning = ref(false);
const inputErrors = ref({}); // Для хранения ошибок
const showRadiusSettings =  ref(false); // Новая переменная для управления видимостью настроек радиусов

const expandedFishSettings = ref({
  pike: false,
  silver_carp: false,
  crucian: false,
  carp: false
});

const fishParams = ref({
  pike: { ...store.fishSettings.pike },
  silver_carp: { ...store.fishSettings.silver_carp },
  crucian: { ...store.fishSettings.crucian },
  carp: { ...store.fishSettings.carp }
});



const toggleFishSettings = (species) => {
  expandedFishSettings.value[species] = !expandedFishSettings.value[species];
};

const applyFishSettings = (species) => {
  store.updateFishParams({species, params: fishParams.value[species]});
};

const resetFishSettings = (species) => {
  fishParams.value[species] = { ...store.fishSettings[species] };
};

// Методы для проверки ввода

const validateInput = (key, event) => {
  const value = event.target.value;
  
  if (value === "") {
    inputErrors.value[key] = "Введите число";
  } else if (parseInt(value) < 0) {
    inputErrors.value[key] = "Число не может быть отрицательным";
    event.target.value = Math.max(0, parseInt(value));
    localSettings.value[key] = Math.max(0, parseInt(value));
  } else {
    delete inputErrors.value[key];
    localSettings.value[key] = parseInt(value) || 0;
  }
};

const hasErrors = computed(() => {
  return Object.keys(inputErrors.value).length > 0;
});


// Вычисляемое свойство для проверки состояния экосистемы
const isEcosystemDead = computed(() => {
  return store.fishes.length === 0 && 
         store.plants.length === 0 && 
         store.invertebrates.length === 0 &&
         store.larvae.length === 0 &&
         store.simulationTime > 1; // Игнорируем начальное состояние
});

// Наблюдатель за состоянием экосистемы
watch(isEcosystemDead, (dead) => {
  if (dead && store.isRunning) {
    wasRunning.value = true;
    store.stopSimulation();
    showEcosystemAlert.value = true;
  }
});

// Функция перезапуска экосистемы
const restartEcosystem = () => {
  showEcosystemAlert.value = false;
  store.reset();
  if (wasRunning.value) {
    wasRunning.value = false;
  }
};

// Добавляем функцию форматирования времени
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const realT = computed(() => store.realTime);
const localSettings = ref({ ...store.settings });
const simulationSpeed = ref(store.simulationSpeed);

// Обновляем скорость симуляции при изменении
watch(simulationSpeed, (newSpeed) => {
  store.setSimulationSpeed(newSpeed);
});

const getLabel = (key) => {
  const labels = {
    initialPike: 'Щуки',
    initialSilverCarp: 'Толстолобики',
    initialCrucian: 'Караси',
    initialCarp: 'Карпы',
    initialPlants: 'Растения',
    initialInvertebrates: 'Беспозвоночные',
    pike: 'Щука',
    silver_carp: 'Толстолобик',
    crucian: 'Карась',
    carp: 'Карп'
  };
  return labels[key] || key;
};

const getFishTitle = (fish) => {
  // fish.hunger существует и является числом
  const hungerValue = fish.hunger !== undefined ? fish.hunger.toFixed(1) : 'N/A';
  
  return `${getLabel(fish.species)}\nГолод: ${hungerValue}\nВозраст: ${fish.age.toFixed(1)}`;
};

const getPlantStyle = (plant) => ({
  left: `${plant.x}px`,
  top: `${plant.y}px`,
  width: `${plant.size}px`,
  height: `${plant.size}px`,
  transform: 'translate(-50%, -50%)'
});

const getInvertebrateStyle = (invertebrate) => ({
  left: `${invertebrate.x}px`,
  top: `${invertebrate.y}px`,
  width: `${invertebrate.size}px`,
  height: `${invertebrate.size}px`,
  backgroundColor: invertebrate.color || '#ba68c8',
  transform: 'translate(-50%, -50%)'
});

const applySettings = () => {
  // Заменяем возможные пустые значения на 0
  Object.keys(localSettings.value).forEach(key => {
    if (localSettings.value[key] === "") {
      localSettings.value[key] = 0;
    }
  });
  
  store.updateSettings(localSettings.value);
};

const toggleSimulation = () => {

  // Проверяем, есть ли хотя бы один организм каждого типа
  const hasOrganisms = store.fishes.length > 0 || store.plants.length > 0 || store.invertebrates.length > 0;
  
  if (!hasOrganisms) {
    // Если организмов нет, применяем текущие настройки
    applySettings();
  }
  store.toggleSimulation();
};

const toggleRadiusSettings = () => {
  showRadiusSettings.value = !showRadiusSettings.value;
};

const resetSimulation = () => {
  store.reset();
  // Сброс локальных настроек
  localSettings.value = { ...store.settings };
  simulationSpeed.value = store.simulationSpeed;
};

// Получаем данные из хранилища
const width = computed(() => store.width);
const height = computed(() => store.height);
const fishes = computed(() => store.fishes);
const plants = computed(() => store.plants);
const larvae = computed(() => store.larvae);
const invertebrates = computed(() => store.invertebrates);
const fishCounts = computed(() => store.fishCounts);
const isRunning = computed(() => store.isRunning);

</script>

<style scoped>

.fish-settings {
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 5px;
}

.fish-header {
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px;
  background-color: #f5f5f5;
}

.fish-settings-content {
  padding: 10px;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
}

.fish-param {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.fish-param label {
  width: 180px;
  margin-right: 10px;
  font-size: 0.9em;
}

.fish-param input[type="range"] {
  flex-grow: 1;
  margin-right: 10px;
}

.toggle-icon {
  font-size: 0.8em;
}

.radius-settings-section {
  margin-top: 5px; /* Уменьшаем отступ сверху */
  padding-top: 0; /* Убираем отступ внутри блока */
}

.radius-controls {
  margin-top: 5px;
  padding: 0px;
  background: #f5f5f5;
  border-radius: 6px;
}

.radius-control {
  display: grid;
  grid-template-columns: 100px 1fr 30px;
  align-items: center;
  gap: 6px;
  margin: 8px 0;
}

.slider-wrapper {
  min-width: 100px;
}

.radius-control label {
  text-align: right;
  white-space: nowrap;
}

.radius-control input[type="range"] {
  width: 100%;
}

.radius-value {
  text-align: left;
  min-width: 40px;
}

.larva-container {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.larva-maturity-bar {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  width: 25px;
  height: 4px;
  background-color: #cec9c9; /* Светло-серый фон всей шкалы */
  border-radius: 2px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
  /* Добавляем отступ между шкалой и личинкой */
  margin-bottom: 3px;
  /* Шкала должна быть выше личинки */
  z-index: 11;
}

.maturity-progress {
  position: absolute;
  height: 100%;
  width: 0%; /* Начальная ширина (будет увеличиваться) */
  background: #80561b; /* цвет заполнения */
  border-radius: 3px;
  transition: width 0.3s ease;
}


.larva {
  position: absolute;
  border-radius: 50%;
  transform-origin: center;
  transition: all 0.3s ease;
}

/* Цвета для разных видов личинок */
.larva.pike {
  background: radial-gradient(ellipse at center, 
    #ff6464 0%,
    #ff0000 70%);
}

.larva.carp {
  background: radial-gradient(ellipse at center, 
    #ffc896 0%, 
    #ffa500 70%);
}

.larva.crucian {
  background: radial-gradient(ellipse at center, 
    #ffff96 0%, 
    #ffff00 70%);
}

.larva.silver_carp {
  background: radial-gradient(ellipse at center, 
    #c896ff 0%, 
    #9600ff 70%);
}

.input-error {
  border: 1px solid #ff4444;
  background-color: #ffeeee;
}

.error-message {
  color: #ff4444;
  font-size: 0.8em;
  margin-left: 10px;
}

.setting-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.setting-item label {
  display: inline-block;
  width: 120px;
  margin-right: 10px;
}

.setting-item input {
  width: 60px;
  padding: 5px;
}

.ecosystem-alert-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.ecosystem-alert {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

.ecosystem-alert button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
}

.ecosystem-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  margin-bottom: 20px;
  color: #1a5fb4;
}

.control-panel {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  width: 100%;
  max-width: 800px;
}

.settings, .info-panel {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  width: 50%;
}

.setting-item {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.setting-item label {
  display: inline-block;
  width: 120px;
  margin-right: 10px;
}

.setting-item input {
  width: 60px;
  padding: 3px;
}

.speed-control {
  margin: 15px 0;
  display: flex;
  align-items: center;
}

.speed-control label {
  width: 120px;
  margin-right: 10px;
}

.speed-control input[type="range"] {
  flex-grow: 1;
  margin-right: 10px;
}

button {
  margin-top: 10px;
  padding: 8px 15px;
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
}

button:hover {
  background-color: #45a049;
}

.control-buttons {
  margin-top: 10px;
  display: flex;
  gap: 6px;
}

.pond-visualization {
  width: 100%;
  display: flex;
  justify-content: center;
}

.pond {
  background-color: #a0c8f0;
  border: 2px solid #1a5fb4;
  position: relative;
  overflow: visible;
}

.fish {
  position: absolute;
  border-radius: 50%;
  transition: left 0.3s linear, top 0.3s linear;
}

.plant {
  position: absolute;
  background-color: #195e37;
  border-radius: 50%;
}

.invertebrate {
  position: absolute;
  background-color: #7a7878; /* Темно-серый */
  border-radius: 50%;
  opacity: 0.8;
  transform: translate(-50%, -50%);
}

/* Цвета для разных видов рыб */
.pike { background-color: #ff0000; } /* Красный для щук */
.silver_carp { background-color: #800080; } /* Фиолетовый для толстолобиков */
.crucian { background-color: #ffff00; } /* Желтый для карасей */
.carp { background-color: #ffa500; } /* Оранжевый для карпов */
</style>