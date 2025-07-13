<template>
  <div class="ecosystem-container">
    <div class="control-panel">
      <div class="settings" v-if="store.showSettingsPanel">
        <h3>Начальные настройки</h3>
        
        <!-- Настройки для каждого типа организмов -->
        <div class="organism-settings">
          <!-- Рыбы -->
          <div class="setting-group" v-for="(countKey, species) in fishSettings" :key="species">
            <div class="setting-header">
              <label>{{ getLabel(species) }}:</label>
              <input 
                v-model.number="localSettings[countKey]" 
                type="number"
                min="0"
                @input="validateInput(countKey, $event)"
                class="number-input"
              >
              <button class="settings-icon" @click="toggleSettingsMenu(species)">⚙️
              </button>
              <span v-if="inputErrors[countKey]" class="error-message">{{ inputErrors[countKey] }}</span>
            </div>
            
            <!-- Выпадающее меню настроек для рыбы -->
            <div v-if="activeSettingsMenu === species" class="settings-dropdown">
              <div class="setting-item">
                <label>Скорость: {{ fishParams[species].speed.toFixed(1) }}</label>
                <input 
                  type="range" 
                  v-model.number="fishParams[species].speed"
                  min="0.5" 
                  max="20" 
                  step="0.1"
                >
              </div>
              <div class="setting-item">
                <label>Начальный голод: {{ fishParams[species].initialHunger }}</label>
                <input 
                  type="range" 
                  v-model.number="fishParams[species].initialHunger"
                  min="0" 
                  max="190" 
                  step="1"
                >
              </div>
              <div class="setting-item">
                <label>Голод для размножения: {{ fishParams[species].reproduceHunger }}</label>
                <input 
                  type="range" 
                  v-model.number="fishParams[species].reproduceHunger"
                  min="10" 
                  max="200" 
                  step="1"
                >
              </div>
              <div class="setting-item">
                <label>Возраст для размножения: {{ fishParams[species].reproduceAge }}</label>
                <input 
                  type="range" 
                  v-model.number="fishParams[species].reproduceAge"
                  min="0" 
                  max="100" 
                  step="1"
                >
              </div>
              <button @click="applyFishSettings(species)">Применить</button>
            </div>
          </div>
          
          <!-- Растения -->
          <div class="setting-group">
            <div class="setting-header">
              <label>Растения:</label>
              <input 
                v-model.number="localSettings.initialPlants" 
                type="number"
                min="0"
                @input="validateInput('initialPlants', $event)"
                class="number-input"
              >
              <button class="settings-icon" @click="toggleSettingsMenu('plants')">
                ⚙️
              </button>
              <span v-if="inputErrors.initialPlants" class="error-message">{{ inputErrors.initialPlants }}</span>
            </div>
            
            <!-- Выпадающее меню настроек для растений -->
            <div v-if="activeSettingsMenu === 'plants'" class="settings-dropdown">
              <div class="setting-item">
                <label>Макс. размер: {{ plantParams.maxSize }}</label>
                <input 
                  type="range" 
                  v-model.number="plantParams.maxSize"
                  min="1" 
                  max="30" 
                  step="1"
                >
              </div>
              <div class="setting-item">
                <label>Скорость роста: {{ plantParams.growthRate.toFixed(2) }}</label>
                <input 
                  type="range" 
                  v-model.number="plantParams.growthRate"
                  min="0" 
                  max="1" 
                  step="0.01"
                  class="slider"
                >
              </div>
              <button @click="applyPlantSettings">Применить</button>
            </div>
          </div>
          
          <!-- Беспозвоночные -->
          <div class="setting-group">
            <div class="setting-header">
              <label>Беспозвоночные:</label>
              <input 
                v-model.number="localSettings.initialInvertebrates" 
                type="number"
                min="0"
                @input="validateInput('initialInvertebrates', $event)"
                class="number-input"
              >
              <button class="settings-icon" @click="toggleSettingsMenu('invertebrates')">
                ⚙️
              </button>
              <span v-if="inputErrors.initialInvertebrates" class="error-message">{{ inputErrors.initialInvertebrates }}</span>
            </div>
            
            <!-- Выпадающее меню настроек для беспозвоночных -->
            <div v-if="activeSettingsMenu === 'invertebrates'" class="settings-dropdown">
              <div class="setting-item">
                <label>Макс. размер: {{ invertebrateParams.maxSize }}</label>
                <input 
                  type="range" 
                  v-model.number="invertebrateParams.maxSize"
                  min="1" 
                  max="30" 
                  step="1"
                  class="slider"
                >
              </div>
              <div class="setting-item">
                <label>Скорость: {{ invertebrateParams.speed.toFixed(2) }}</label>
                <input 
                  type="range" 
                  v-model.number="invertebrateParams.speed"
                  min="0" 
                  max="2" 
                  step="0.01"
                  class="slider"
                >
              </div>
              <button @click="applyInvertebrateSettings">Применить</button>
            </div>
          </div>
        </div>
        <div class="settings-buttons">
          <button @click="applySettings">Применить настройки</button>
          <button @click="resetToDefaults" class="reset-btn">Сбросить</button>
        </div>
      </div>

      <div class="info-panel">
        <h3>Текущее состояние</h3>
        <div>Время: {{ formatTime(realT) }}</div>
        <div v-for="(count, species) in fishCounts" :key="species">
          {{ getLabel(species) }}: {{ count }}
        </div>
        <div>Растений: {{ plants.length }}</div>
        <div>Беспозвоночных: {{ invertebrates.length }}</div>
        <div>Икры: {{ larvae.length }}</div>
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
          <h4>Настройки радиусов</h4>
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
          :title= "getFishTitle(larva)"
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
import Swal from 'sweetalert2'
import { useEcosystemStore } from '../stores/ecosystem';
import { computed, ref, watch } from 'vue';
import Fish from './Fish.vue';

const store = useEcosystemStore();
const showEcosystemAlert = ref(false);
const wasRunning = ref(false);
const inputErrors = ref({}); // Для хранения ошибок
const showRadiusSettings =  ref(false); // Новая переменная для управления видимостью настроек радиусов

// Инициализация параметров из хранилища
const plantParams = ref({ ...store.plantParams });
const invertebrateParams = ref({ ...store.invertebrateParams });

// переменные для управления выпадающими меню
const activeSettingsMenu = ref(null);
const fishParams = ref({
  pike: { ...store.fishSettings.pike },
  silver_carp: { ...store.fishSettings.silver_carp },
  crucian: { ...store.fishSettings.crucian },
  carp: { ...store.fishSettings.carp }
});

// Сопоставление видов рыб с ключами настроек
const fishSettings = {
  pike: 'initialPike',
  silver_carp: 'initialSilverCarp',
  crucian: 'initialCrucian',
  carp: 'initialCarp'
};

// Функция для переключения меню настроек
const toggleSettingsMenu = (menu) => {
  activeSettingsMenu.value = activeSettingsMenu.value === menu ? null : menu;
};

// Функция для применения настроек рыбы
const applyFishSettings = (species) => {
  store.updateFishParams({
    species,
    params: {
      speed: fishParams.value[species].speed,
      initialHunger: fishParams.value[species].initialHunger, // Не забываем это!
      reproduceHunger: fishParams.value[species].reproduceHunger,
      reproduceAge: fishParams.value[species].reproduceAge,
      detectionRadius: fishParams.value[species].detectionRadius
    }
  });
  activeSettingsMenu.value = null;
};

// Функция для применения настроек растений
const applyPlantSettings = () => {
  store.setPlantParams(plantParams.value);
  activeSettingsMenu.value = null;
};

// Функция для применения настроек беспозвоночных
const applyInvertebrateSettings = () => {
  store.setInvertebrateParams(invertebrateParams.value);
  activeSettingsMenu.value = null;
};


const resetToDefaults = async () => {
  // 1. Подтверждение действия
  const result = await Swal.fire({
    title: 'Подтверждение сброса',
    text: 'Вы уверены, что хотите сбросить все настройки к начальным?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Сбросить',
    cancelButtonText: 'Отмена'
  });

  if (!result.isConfirmed) return;

  // 2. Дефолтные значения для всех параметров
  const defaultState = {
    // Количества организмов
    settings: {
      initialPike: 2,
      initialSilverCarp: 3,
      initialCrucian: 3,
      initialCarp: 3,
      initialPlants: 20,
      initialInvertebrates: 15
    },
    
    // Параметры рыб
    fishSettings: {
      pike: { speed: 2.0, initialHunger: 30, reproduceHunger: 80, reproduceAge: 1, detectionRadius: 50 },
      silver_carp: { speed: 1.5, initialHunger: 30, reproduceHunger: 80, reproduceAge: 1, detectionRadius: 40 },
      crucian: { speed: 1.8, initialHunger: 30, reproduceHunger: 80, reproduceAge: 1, detectionRadius: 45 },
      carp: { speed: 1.3, initialHunger: 30, reproduceHunger: 80, reproduceAge: 1, detectionRadius: 45 }
    },
    
    // Параметры растений и беспозвоночных
    plantParams: { maxSize: 30, growthRate: 0.15 },
    invertebrateParams: { maxSize: 18, speed: 0.6 },
    
    // Радиусы
    Radius: {
      pike: 50,
      silver_carp: 40,
      crucian: 45,
      carp: 45
    }
  };

  // 3. Обновляем хранилище
  store.updateSettings(defaultState.settings);
  Object.keys(defaultState.fishSettings).forEach(species => {
    store.updateFishParams({
      species,
      params: defaultState.fishSettings[species]
    });
  });
  store.setPlantParams(defaultState.plantParams);
  store.setInvertebrateParams(defaultState.invertebrateParams);
  
  // 4. Обновляем радиусы
  Object.keys(defaultState.Radius).forEach(species => {
    store.setDetectionRadius({
      species,
      radius: defaultState.Radius[species]
    });
  });

  // 5. Синхронизируем локальные состояния
  localSettings.value = { ...defaultState.settings };
  fishParams.value = { ...defaultState.fishSettings };
  plantParams.value = { ...defaultState.plantParams };
  invertebrateParams.value = { ...defaultState.invertebrateParams };

  // 6. Полный сброс симуляции
  store.reset();

  // 7. Уведомление (опционально)
  await Swal.fire({
    title: 'Готово!',
    text: 'Все настройки сброшены к начальным значениям',
    icon: 'success',
    confirmButtonText: 'OK'
  });
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

const getFishTitle = (entity) => {
  // Для рыб
  if (!entity.hasOwnProperty('hatchProgress')) {
    const hungerValue = entity.hunger !== undefined ? entity.hunger.toFixed(1) : 'N/A';
    return `${getLabel(entity.species)}
Голод: ${hungerValue}
Возраст: ${entity.age?.toFixed(1) || 'N/A'}
Размер: ${entity.size?.toFixed(1) || 'N/A'} `;
  }
  // Для личинок
  else {
    return `Икра: ${getLabel(entity.species)}
Готовность: ${entity.hatchProgress?.toFixed(0) || '0'}%
Размер: ${entity.size?.toFixed(1) || 'N/A'}
Голод: ${entity.hunger?.toFixed(1) || 'N/A'}`;
  }
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
  // 1. Применяем настройки для рыб
  Object.keys(fishParams.value).forEach(species => {
    store.updateFishParams({
      species,
      params: {
        speed: Number(fishParams.value[species].speed),
        initialHunger: Number(fishParams.value[species].initialHunger),
        reproduceHunger: Number(fishParams.value[species].reproduceHunger),
        reproduceAge: Number(fishParams.value[species].reproduceAge),
        detectionRadius: Number(fishParams.value[species].detectionRadius)
      }
    });
  });

  // 2. Применяем настройки растений и беспозвоночных
  store.setPlantParams({
    growthRate: Number(plantParams.value.growthRate),
    maxSize: Number(plantParams.value.maxSize)
  });

  store.setInvertebrateParams({
    speed: Number(invertebrateParams.value.speed),
    maxSize: Number(invertebrateParams.value.maxSize)
  });

  // 3. Обрабатываем начальные количества
  const sanitizedSettings = {};
  Object.keys(localSettings.value).forEach(key => {
    sanitizedSettings[key] = Math.max(0, Number(localSettings.value[key]) || 0);
  });

  // 4. Важное: принудительно пересоздаем организмы
  store.updateSettings(sanitizedSettings);
};

const toggleSimulation = () => {
  if (!store.isRunning) {
    // При первом старте применяем настройки
    if (store.fishes.length === 0) {
      applySettings();
    }
    store.startSimulation();
  } else {
    store.stopSimulation();
  }  
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

.settings-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.reset-btn {
  background-color: #f44336; /* Красный цвет для кнопки сброса */
}

.reset-btn:hover {
  background-color: #d32f2f;
}

/* Базовый сброс стилей для всех браузеров */
input[type="range"] {
  -webkit-appearance: none;  /* Chrome, Safari */
  -moz-appearance: none;     /* Firefox */
  appearance: none;         /* Стандартный способ */
  width: 100%;
  max-width: 250px;
  margin: 15px 0;
  background: transparent;
  height: 20px;  /* Высота контейнера ползунка */
}

/* Стиль трека (линии) для WebKit (Chrome/Safari) */
input[type="range"]::-webkit-slider-runnable-track {
  width: 100%;
  height: 6px;
  background: #ddd;
  border-radius: 3px;
  border: none;
}

/* Стиль бегунка для WebKit */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  margin-top: -6px;
  background: #4CAF50;
  border-radius: 50%;
  border: none;
  cursor: pointer;
}

/* Стиль трека для Firefox */
input[type="range"]::-moz-range-track {
  width: 100%;
  height: 6px;
  background: #ddd;
  border-radius: 3px;
  border: none;
}

/* Стиль бегунка для Firefox */
input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: #4CAF50;
  border-radius: 50%;
  border: none;
  cursor: pointer;
}

/* Стиль для Edge/IE */
input[type="range"]::-ms-track {
  width: 100%;
  height: 6px;
  background: transparent;
  border-color: transparent;
  color: transparent;
}

input[type="range"]::-ms-thumb {
  width: 18px;
  height: 18px;
  background: #4CAF50;
  border-radius: 50%;
  border: none;
  cursor: pointer;
}

/* Особые стили для ползунка скорости */
.speed-control input[type="range"] {
  max-width: none;
  flex-grow: 1;
}

.settings-dropdown input[type="range"] {
  flex-grow: 1;
  margin-right: 10px;
}

.number-input {
  width: 80px;
  padding: 5px;
  margin-right: 10px;
}

.setting-item {
  margin: 10px;
  display: flex;
  align-items: center;
}

.setting-item label {
  display: block;
  margin-bottom: 2px;
  font-size: 0.9 em;
  color: #555;
}

/* Добавляем новые стили для выпадающих меню */
.setting-group {
  margin-bottom: 6px;
  position: relative;
}

.setting-header {
  margin-bottom: 6px;
  display: flex;
  align-items: center;
}

.setting-header label {
  width: 140px;
  margin-right: 10px;
}

.setting-header input {
  width: 60px;
  padding: 5px;
  margin-right: 10px;
}

.settings-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  margin: 0;
  font-size: 16px;
  color: #666;
}

.settings-icon:hover {
  color: #333;
}

.settings-dropdown {
  margin-top: 4px;
  padding: 4px 6px;
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  
}

.settings-dropdown .setting-item {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.settings-dropdown .setting-item label {
  width: 130px;
  margin-right: 8px;
  font-size: 0.85em;
}

.settings-dropdown .setting-item input {
  width: 60px;
  padding: 2px;
  font-size: 0.85em;
}

.settings-dropdown button {
  margin-top: 5px;
  padding: 5px 10px;
  font-size: 14px;
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
  height: 100vh;
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