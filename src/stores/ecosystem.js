import { defineStore } from 'pinia';

export const useEcosystemStore = defineStore('ecosystem', {
  state: () => ({
    width: 900,
    height: 600,
    fishes: [],
    plants: [],
    larvae: [],
    invertebrates: [],
    simulationTime: 0,
    realTime: 0,
    isRunning: false,
    lastFrameTime: 0,
    animationFrameId: null,
    simulationSpeed: 1,
    showSettingsPanel: true, // флаг видимости панели
    Radius: {
      pike: 45,
      silver_carp: 45,
      crucian: 45,
      carp: 45
    }, // Радиус распознавания для всех рыб
    showDetectionRadius: true, // Флаг для отображения радиуса
    plantParams: {
      maxSize: 30,
      growthRate: 0.15
    },
    invertebrateParams: {
      maxSize: 18,
      speed: 0.6
    },
    fishSettings: {
      pike: {
        speed: 2.0,
        initialHunger: 30,
        reproduceHunger: 80,
        reproduceAge: 1,
        detectionRadius: 45
      },
      silver_carp: {
        speed: 1.5,
        initialHunger: 30,
        reproduceHunger: 80,
        reproduceAge: 1,
        detectionRadius: 45
      },
      crucian: {
        speed: 1.8,
        initialHunger: 30,
        reproduceHunger: 80,
        reproduceAge: 1,
        detectionRadius: 45
      },
      carp: {
        speed: 1.3,
        initialHunger: 30,
        reproduceHunger: 80,
        reproduceAge: 1,
        detectionRadius: 45
      }
    },
    settings: {
      initialPike: 2,
      initialSilverCarp: 4,
      initialCrucian: 4,
      initialCarp: 4,
      initialPlants: 20,
      initialInvertebrates: 20

    }
  }),

  getters: {

    formattedTime(state) {
      const totalSeconds = Math.floor(state.realTime);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },

    fishCounts(state) {
      return {
        pike: state.fishes.filter(f => f.species === 'pike').length,
        silver_carp: state.fishes.filter(f => f.species === 'silver_carp').length,
        crucian: state.fishes.filter(f => f.species === 'crucian').length,
        carp: state.fishes.filter(f => f.species === 'carp').length
      };
    },

    getDetectionRadius: (state) => (species) => {
      return state.Radius[species] || 40;
    }
  },

  actions: {
    init() {
      // Проверяем, есть ли сохраненные настройки
      if (!localStorage.getItem('ecosystemSettings')) {
        this.applyDefaultSettings();
      }
      this.loadSettings();
      this.reset();
    },

    resetAllParams() {
      this.fishSettings = {
        pike: { speed: 2.0, initialHunger: 30, reproduceHunger: 80, reproduceAge: 3, detectionRadius: 50 },
        silver_carp: { speed: 1.5, initialHunger: 30, reproduceHunger: 80, reproduceAge: 3, detectionRadius: 40 },
        crucian: { speed: 1.8, initialHunger: 30, reproduceHunger: 80, reproduceAge: 3, detectionRadius: 45 },
        carp: { speed: 1.3, initialHunger: 30, reproduceHunger: 80, reproduceAge: 3, detectionRadius: 45 }
      };
      
      this.plantParams = { maxSize: 30, growthRate: 0.15 };
      this.invertebrateParams = { maxSize: 18, speed: 0.6 };
      
      this.Radius = {
        pike: 50,
        silver_carp: 40,
        crucian: 45,
        carp: 45
      };
    },

    // Основной метод обновления параметров рыб
    updateAllFishParams() {
      this.fishes.forEach(fish => {
        const settings = this.fishSettings[fish.species];
        if (settings) {
          fish.speed = settings.speed;
          fish.detectionRadius = settings.detectionRadius;
          fish.reproduceHunger = settings.reproduceHunger;
          fish.reproduceAge = settings.reproduceAge;
          // Обновляем голод, не превышая начальное значение
          fish.hunger = Math.min(fish.hunger, settings.initialHunger);
        }
      });
    },

    // Методы обновления других организмов
    updateAllPlantsParams() {
      this.plants.forEach(plant => {
        plant.growthRate = this.plantParams.growthRate;
      });
    },

    updateAllInvertebratesParams() {
      this.invertebrates.forEach(inv => {
        inv.speed = this.invertebrateParams.speed;
      });
    },

    // Унифицированные методы обновления параметров
    updateFishParams({ species, params }) {
      this.fishSettings[species] = { ...this.fishSettings[species], ...params };
      this.updateAllFishParams();
    },

    setPlantParams(params) {
      this.plantParams = { ...this.plantParams, ...params };
      this.updateAllPlantsParams();
    },

    setInvertebrateParams(params) {
      this.invertebrateParams = { ...this.invertebrateParams, ...params };
      this.updateAllInvertebratesParams();
    },

    resetFishHunger() {
      this.fishes.forEach(fish => {
        const speciesSettings = this.fishSettings[fish.species];
        if (speciesSettings && speciesSettings.initialHunger !== undefined) {
          fish.hunger = Math.min(fish.hunger, speciesSettings.initialHunger);
        }
      });
    },


    async applyDefaultSettings() {
      const defaultSettings = {
        // Начальные количества
        settings: {
          initialPike: 2,
          initialSilverCarp: 4,
          initialCrucian: 4,
          initialCarp: 4,
          initialPlants: 20,
          initialInvertebrates: 20
        },
        
        // Параметры рыб
        fishSettings: {
          pike: { speed: 2.0, initialHunger: 30, reproduceHunger: 80, reproduceAge: 3, detectionRadius: 50 },
          silver_carp: { speed: 1.5, initialHunger: 30, reproduceHunger: 80, reproduceAge: 3, detectionRadius: 40 },
          crucian: { speed: 1.8, initialHunger: 30, reproduceHunger: 80, reproduceAge: 3, detectionRadius: 45 },
          carp: { speed: 1.3, initialHunger: 30, reproduceHunger: 80, reproduceAge: 3, detectionRadius: 45 }
        },
        
        // Параметры других организмов
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

      // Применяем все настройки
      this.updateSettings(defaultSettings.settings);
      Object.keys(defaultSettings.fishSettings).forEach(species => {
        this.updateFishParams({
          species,
          params: defaultSettings.fishSettings[species]
        });
      });
      this.setPlantParams(defaultSettings.plantParams);
      this.setInvertebrateParams(defaultSettings.invertebrateParams);
      
      // Обновляем радиусы
      Object.keys(defaultSettings.Radius).forEach(species => {
        this.setDetectionRadius({
          species,
          radius: defaultSettings.Radius[species]
        });
      });
      
      this.$patch(defaultSettings);
      // Создаем организмы
      await this.reset();
    },


    addFish(species, x = null, y = null, isLarva = false) {
      // Получаем настройки для данного вида рыбы из хранилища
      const settings = this.fishSettings[species] || {};
      
      const types = {
        pike: { 
          type: 'predator', 
          size: isLarva ? 15 : 18, 
          color: '#ff0000',
          detectionRadius: this.Radius.pike
        },
        silver_carp: { 
          type: 'herbivore', 
          size: isLarva ? 10 : 14, 
          color: '#800080',
          detectionRadius: this.Radius.silver_carp
        },
        crucian: { 
          type: 'omnivore', 
          size: isLarva ? 10 : 12, 
          color: '#ffff00',
          detectionRadius: this.Radius.crucian
        },
        carp: { 
          type: 'omnivore', 
          size: isLarva ? 12 : 16, 
          color: '#ffa500',
          detectionRadius: this.Radius.carp
        }
      };

      this.fishes.push({
        id: Date.now() + Math.random(),
        species,
        ...types[species], // Базовые неизменяемые свойства
        speed: settings.speed || 1.5,
        hunger: settings.initialHunger,
        reproduceHunger: settings.reproduceHunger || 80,
        reproduceAge: settings.reproduceAge,
        detectionRadius: this.Radius[species] || 40,
        x: x ?? Math.random() * this.width,
        y: y ?? Math.random() * this.height,
        direction: Math.random() * Math.PI * 2,
        age: 0,
        isReproducing: false,
        reproductionProgress: 0,
        reproductionPartnerId: null,
        reproductionCooldown: 0
      });
    },

    setDetectionRadius({ species, radius }) {
      this.Radius[species] = radius;
      this.fishes.forEach(fish => {
        if (fish.species === species) {
        // Создаем новый объект
        fish.detectionRadius = radius;
      }
      });
    },

    addPlant() {
      this.plants.push({
        id: Date.now() + Math.random(),
        x: Math.max(20, Math.min(this.width - 20, (Math.random() * this.width))),
        y: Math.max(20, Math.min(this.height - 20, (Math.random() * this.height))),
        size: Math.min(this.plantParams.maxSize, 6 + Math.random() * 10),
        growthRate: this.plantParams.growthRate
      });
    },

    addInvertebrate() {
      this.invertebrates.push({
        id: Date.now() + Math.random(),
        x: Math.max(20, Math.min(this.width - 20, (Math.random() * this.width))),
        y: Math.max(20, Math.min(this.height - 20, (Math.random() * this.height))),
        size: Math.min(this.invertebrateParams.maxSize, 10 + Math.random() * 10),
        color: '#555555',
        speed: this.invertebrateParams.speed
      });
    },

    addLarva(x, y, species) {
      this.larvae.push({
        id: Date.now() + Math.random(),
        x, y, species,
        size: 15,
        age: 0,
        hunger: 10,
        hatchProgress: 0 // Добавляем начальное значение прогресса
      });
    },

    startSimulation() {
      if (this.isRunning) return;
      
      this.isRunning = true;
      this.showSettingsPanel = false;
      this.lastFrameTime = performance.now();

      this.showSettingsPanel = false; // Скрываем панель настроек

      const frameUpdate = (currentTime) => {
        if (!this.isRunning) return;
        
        const deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;
        
        // Реальное время всегда увеличивается равномерно
        this.realTime += deltaTime;
        
        // Время симуляции учитывает скорость
        this.simulationTime += deltaTime * this.simulationSpeed;
        
        // Обновление экосистемы использует simulationTime
        this.updateEcosystem(deltaTime);
        
        this.animationFrameId = requestAnimationFrame(frameUpdate);
      };
      
      this.animationFrameId = requestAnimationFrame(frameUpdate);
    },

    stopSimulation() {
      this.isRunning = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    },

    toggleSimulation() {
      if (this.isRunning) this.stopSimulation();
      else this.startSimulation();
    },

    updateEcosystem(deltaTime) {

      // Основной множитель скорости для всех процессов
      const speedFactor = deltaTime * this.simulationSpeed;
      const deadEntities = []; // Массив для хранения умерших существ

      // 1. Обновление растений
      this.plants.forEach(plant => {
        // Рост растений зависит от скорости симуляции
        // Рост растений зависит от скорости симуляции
        plant.size = Math.min(this.plantParams.maxSize, plant.size + plant.growthRate * speedFactor); // Ограничение 30px
        
        // Условия размножения:
        // - Растение должно быть достаточно большим (>15px)
        // - Вероятность 5% с учетом скорости симуляции
        if (plant.size > 15 && Math.random() < 0.01 * speedFactor) {
            this.addPlant();
        }
      });

      // 2. Обновление беспозвоночных
      this.invertebrates.forEach(inv => {
        // Движение с учетом скорости
        inv.x += (Math.random() - 0.5) * inv.speed * speedFactor  * 50;
        inv.y += (Math.random() - 0.5) * inv.speed * speedFactor  * 50;
        
        // Размножение зависит от скорости симуляции
        if (Math.random() < 0.01 * speedFactor) {
          this.addInvertebrate();
        }
        
        // Проверка границ
        inv.x = Math.max(0, Math.min(this.width, inv.x));
        inv.y = Math.max(0, Math.min(this.height, inv.y));
      });


      this.fishes.forEach(fish => {
        if (fish.reproductionCooldown > 0) {
          fish.reproductionCooldown -= speedFactor; // Учитываем скорость
        }
      });

      // 3. Обновление рыб
      this.fishes.forEach((fish, index) => {

        if (fish.species !== 'pike') {
          const predator = this.findNearestPredator(fish);
          if (predator) {
            this.fleeFromPredator(fish, predator, speedFactor);
            return; // Пропускаем остальную логику для этой рыбы
          }
        }

        // Жизненные процессы (зависят от скорости);
        // Обновление голода
        // В цикле обновления рыб добавьте:
        fish.age += speedFactor * 0.1; // Увеличиваем возраст
        fish.hunger = Math.min(200, fish.hunger + fish.size * 0.02 * speedFactor);
         // 2. Рассчитываем рост
        const maxSize = this.getMaxSizeForSpecies(fish.species);
        const growthRate = 0.2; // Скорость роста
      
        // 3. Если рыба может расти и есть "ресурсы" для роста
        if (fish.size < maxSize && fish.hunger < 40) {
          let growth = growthRate * speedFactor;
          if (fish.size < 14) {
            growth += 0.005
          }
          fish.size = Math.min(maxSize, fish.size + growth);
          fish.hunger += growth * 2; // Тратим голод на рост
        }

        fish.x += Math.cos(fish.direction) * fish.speed * speedFactor * 50;
        fish.y += Math.sin(fish.direction) * fish.speed * speedFactor * 50;

        // Проверка на смерть
        if (fish.hunger >= 199) {
            deadEntities.push(fish); // Добавляем в массив умерших
            return; // Пропускаем остальную обработку
        }

        // Питание при голоде >30
        if (fish.hunger > 30) {
          this.processFeeding(fish, index, speedFactor);
        }

        // Обработка границ и отражение
        if (fish.x < 0 || fish.x > this.width) {
          fish.direction = Math.PI - fish.direction;
          fish.x = Math.max(0, Math.min(this.width, fish.x));
        }
        if (fish.y < 0 || fish.y > this.height) {
          fish.direction = -fish.direction;
          fish.y = Math.max(0, Math.min(this.height, fish.y));
        }
        // Если рыба в процессе размножения
        if (fish.isReproducing) {
          this.processReproduction(fish, speedFactor);
        }
        // Условия для размножения:
        // 1. Возраст больше 3
        // 2. Уровень голода ниже 80
        // 3. Нет активного процесса размножения
        if (fish.age >= fish.reproduceAge && fish.hunger <= fish.reproduceHunger && !fish.isReproducing && 
          fish.reproductionCooldown <= 0) {
          this.checkReproduction(fish, speedFactor);
        }
      });

      // 4. Обновление личинок
      this.updateLarvae(speedFactor);

      // Удаление всех умерших существ
      deadEntities.forEach(entity => this.removeEntity(entity));
    },

    // Обновление личинок
    updateLarvae(speedFactor) {
      this.larvae.forEach((larva, index) => {
        // Увеличиваем прогресс вылупления
        larva.hatchProgress = Math.min(100, larva.hatchProgress + speedFactor * 25);
        larva.size = 9 + larva.hatchProgress / 20;  // Плавный рост
        
        // Обновляем возраст
        larva.age += speedFactor * 0.1;
        
        // Если личинка готова - создаем рыбу
        if (larva.hatchProgress >= 100) {
          this.addFish(larva.species, larva.x, larva.y, true);
          this.larvae.splice(index, 1);
        }
      });
    },

    getMaxSizeForSpecies(species) {
      const sizes = {
        pike: 40,
        silver_carp: 32,
        crucian: 30,
        carp: 35
      };
      return sizes[species] || 20;
    },

    removeEntity(entity) {
      if (this.plants.includes(entity)) {
          this.plants = this.plants.filter(p => p !== entity);
      } else if (this.invertebrates.includes(entity)) {
          this.invertebrates = this.invertebrates.filter(i => i !== entity);
      } else if (this.fishes.includes(entity)) {
          this.fishes = this.fishes.filter(f => f !== entity);
      }
    },

    checkReproduction(fish, speedFactor) {
      // Ищем партнера в радиусе видимости
      const partner = this.fishes.find(other => {
        return other !== fish && 
              other.species === fish.species &&
              !other.isReproducing &&
              other.age >= other.reproduceAge &&
              other.hunger <= other.reproduceHunger &&
              this.getDistance(fish, other) < fish.detectionRadius;
      });
      
      if (!partner) return;
      
      // Начинаем процесс размножения
      fish.isReproducing = true;
      partner.isReproducing = true;
      fish.reproductionProgress = 0;
      partner.reproductionProgress = 0;
      fish.reproductionPartnerId = partner.id;
      partner.reproductionPartnerId = fish.id;
      
      // Устанавливаем целевые позиции для касания
      const angle = Math.atan2(partner.y - fish.y, partner.x - fish.x);
      const targetDistance = (fish.size + partner.size) / 2 * 0.85; // 90% от суммы размеров
      
      // Позиция для текущей рыбы (касание с партнером)
      fish.reproductionTarget = {
        x: partner.x - Math.cos(angle) * targetDistance,
        y: partner.y - Math.sin(angle) * targetDistance
      };
      
      // Позиция для партнера (зеркальная)
      partner.reproductionTarget = {
        x: fish.x + Math.cos(angle) * targetDistance,
        y: fish.y + Math.sin(angle) * targetDistance
      };
    },

    processReproduction(fish, speedFactor) {
      const partner = this.fishes.find(f => f.id === fish.reproductionPartnerId);
      
      // Если партнер исчез (например, умер) - прерываем процесс
      if (!partner) {
        fish.isReproducing = false;
        fish.reproductionProgress = 0;
        return;
      }
      
      // Движение к целевой позиции для касания
      const targetX = fish.reproductionTarget.x;
      const targetY = fish.reproductionTarget.y;
      const angle = Math.atan2(targetY - fish.y, targetX - fish.x);
      fish.direction = angle;
      
      // Плавное движение с учетом скорости
      const moveSpeed = fish.speed * speedFactor * 30;
      fish.x += Math.cos(angle) * moveSpeed;
      fish.y += Math.sin(angle) * moveSpeed;
      
      // Увеличиваем прогресс размножения
      fish.reproductionProgress += speedFactor;
      
      // Проверяем достижение позиции и достаточное время
      const distanceToTarget = this.getDistance(fish, fish.reproductionTarget);
      const distanceToPartner = this.getDistance(fish, partner);
      const requiredDistance = (fish.size + partner.size) / 2 * 1.1; // 110% от суммы размеров
      
      if (distanceToTarget < 10 && distanceToPartner < requiredDistance && 
          fish.reproductionProgress >= 3) {
        
        // Создаем икру/личинку посередине между рыбами
        const spawnX = (fish.x + partner.x) / 2;
        const spawnY = (fish.y + partner.y) / 2;
        
        this.addLarva(spawnX, spawnY, fish.species);
        
        // Устанавливаем задержку
        fish.reproductionCooldown = 20;
        partner.reproductionCooldown = 20;
        
        // Тратим энергию
        fish.hunger = Math.min(200, fish.hunger + 30);
        partner.hunger = Math.min(200, partner.hunger + 30);
        
        // Сбрасываем флаги
        fish.isReproducing = false;
        fish.reproductionProgress = 0;
        partner.isReproducing = false;
        partner.reproductionProgress = 0;
        
        // Удаляем временные цели
        delete fish.reproductionTarget;
        delete partner.reproductionTarget;
      }
    },

    //Питание
    processFeeding(fish, index, speedFactor) {

      // Сначала проверяем, не угрожает ли щука
      if (fish.species !== 'pike') { // Если это не щука (она ни от кого не убегает)
        const nearestPike = this.findNearestPredator(fish);
        if (nearestPike) {
          this.fleeFromPredator(fish, nearestPike, speedFactor);
          return; // Прерываем обычное поведение
        }
      }

      // Поиск ближайшей цели в радиусе видимости
      let target = null;
      let minDistance = Infinity;

      // Для хищников (щук)
      if (fish.species === 'pike') {
          this.fishes.forEach(prey => {
              if (prey !== fish && prey.species !== 'pike') {
                  const distance = this.getDistance(fish, prey);
                  if (distance < fish.detectionRadius && distance < minDistance) {
                      minDistance = distance;
                      target = prey;
                  }
              }
          });
      }
      // Для травоядных (толстолобиков)
      else if (fish.species === 'silver_carp') {
          this.plants.forEach(plant => {
              const distance = this.getDistance(fish, plant);
              if (distance < fish.detectionRadius && distance < minDistance) {
                  minDistance = distance;
                  target = plant;
              }
          });
      }
      // Для всеядных (карасей, карпов)
      else {
          // Сначала ищем беспозвоночных
          this.invertebrates.forEach(inv => {
              const distance = this.getDistance(fish, inv);
              if (distance < fish.detectionRadius && distance < minDistance) {
                  minDistance = distance;
                  target = inv;
              }
          });
          
          // Если не нашли беспозвоночных, ищем растения
          if (!target) {
              this.plants.forEach(plant => {
                  const distance = this.getDistance(fish, plant);
                  if (distance < fish.detectionRadius && distance < minDistance) {
                      minDistance = distance;
                      target = plant;
                  }
              });
          }
        }

      // Если цель найдена - двигаемся к ней
      if (target) {
          // Вычисляем направление к цели
          fish.direction = Math.atan2(
              target.y - fish.y,
              target.x - fish.x
          );

          // Двигаемся к цели с учетом скорости
          fish.x += Math.cos(fish.direction) * fish.speed * speedFactor;
          fish.y += Math.sin(fish.direction) * fish.speed * speedFactor;

          // Если достаточно близко - съесть
          if (this.getDistance(fish, target) < fish.size/2 + target.size/2) {
              this.consumeTarget(fish, target);
          }
      } else {
          // Если цели нет - случайное блуждание
          if (Math.random() < 0.05 * speedFactor) {
              fish.direction += (Math.random() - 0.5) * Math.PI/2;
          }
      }
    },

    findNearestPredator(fish) {
      let nearestPike = null;
      let minDistance = Infinity;

      this.fishes.forEach(predator => {
        if (predator.species === 'pike' && predator !== fish) {
          const distance = this.getDistance(fish, predator);
          if (distance < predator.detectionRadius && distance < minDistance) {
            minDistance = distance;
            nearestPike = predator;
          }
        }
      });

      return nearestPike;
    },

    fleeFromPredator(fish, predator, speedFactor) {
      // Рассчитываем направление БЕГСТВА от щуки (противоположное направление)
      const fleeAngle = Math.atan2(
        fish.y - predator.y,
        fish.x - predator.x
      );
      
      // Добавляем случайность в направление (чтобы не бежали строго по прямой)
      const randomAngle = (Math.random() - 0.5) * Math.PI/4;
      const finalAngle = fleeAngle + randomAngle;
      
      // Увеличиваем скорость при побеге (в 1.1 раза)
      const fleeSpeed = fish.speed * 1.1 * speedFactor * 50;
      
      fish.direction = finalAngle;
      fish.x += Math.cos(finalAngle) * fleeSpeed;
      fish.y += Math.sin(finalAngle) * fleeSpeed;
      // Обработка границ и отражение
      if (fish.x < 0 || fish.x > this.width) {
        fish.direction = Math.PI - fish.direction;
        fish.x = Math.max(0, Math.min(this.width, fish.x));
      }
      if (fish.y < 0 || fish.y > this.height) {
        fish.direction = -fish.direction;
        fish.y = Math.max(0, Math.min(this.height, fish.y));
      }

      if (Math.random() < 0.1) {
        fish.direction += (Math.random() - 0.5) * Math.PI/3;
      }
    },

    consumeTarget(fish, target) {

      // Определяем сколько восполнить голода
      const reduction = target.size * 3;
      
      // Корректируем голод (не менее 0 и не более 200)
      fish.hunger = Math.max(0, fish.hunger - reduction);

      // Удаляем цель
      if (fish.species === 'pike' || !target.hasOwnProperty('growthRate')) {
          // Хищники съедают рыб, всеядные - беспозвоночных (полностью)
          this.removeEntity(target);
      } else {
          // Травоядные и всеядные частично съедают растения
          target.size = Math.max(0, target.size - fish.hunger / 2);
          if (target.size <= 2) {
              this.removeEntity(target);
          }
      }
    },

    getDistance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    isInRange(a, b) {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy) <= this.detectionRadius;
    },

    // Переключение видимости радиусов
    toggleDetectionRadius() {
      this.showDetectionRadius = !this.showDetectionRadius;
    },

    reset() {
      this.stopSimulation();
      this.simulationTime = 0;
      this.realTime = 0; 
      this.lastFrameTime = 0;
      this.showSettingsPanel = true; // Показываем панель при сбросе
      this.fishes.forEach(fish => {
        fish.lastReproductionTime = 0;
      });

      // Сбрасываем все организмы
      this.fishes = [];
      this.plants = [];
      this.larvae = [];
      this.invertebrates = [];

      // Инициализируем заново
      for (let i = 0; i < this.settings.initialPlants; i++) this.addPlant();
      for (let i = 0; i < this.settings.initialInvertebrates; i++) this.addInvertebrate();
      for (let i = 0; i < this.settings.initialPike; i++) this.addFish('pike');
      for (let i = 0; i < this.settings.initialSilverCarp; i++) this.addFish('silver_carp');
      for (let i = 0; i < this.settings.initialCrucian; i++) this.addFish('crucian');
      for (let i = 0; i < this.settings.initialCarp; i++) this.addFish('carp');
    },

    setSimulationSpeed(speed) {
      this.simulationSpeed = Math.max(0.1, Math.min(speed, 10));
    },

    updateSettings(newSettings) {
      this.settings = { ...this.settings, ...newSettings };
      this.reset();
    }
  }
});