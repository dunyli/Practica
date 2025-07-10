import { defineStore } from 'pinia';

export const useEcosystemStore = defineStore('ecosystem', {
  state: () => ({
    width: 800,
    height: 500,
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
    Radius: {
      pike: 50,
      silver_carp: 40,
      crucian: 45,
      carp: 45
    }, // Радиус распознавания для всех рыб
    showDetectionRadius: true, // Флаг для отображения радиуса
    fishSettings: {
      pike: {
        speed: 2.0,
        initialHunger: 30,
        reproduceHunger: 80,
        reproduceAge: 3,
        detectionRadius: 50
      },
      silver_carp: {
        speed: 1.5,
        initialHunger: 30,
        reproduceHunger: 80,
        reproduceAge: 3,
        detectionRadius: 40
      },
      crucian: {
        speed: 1.8,
        initialHunger: 30,
        reproduceHunger: 80,
        reproduceAge: 3,
        detectionRadius: 45
      },
      carp: {
        speed: 1.3,
        initialHunger: 30,
        reproduceHunger: 80,
        reproduceAge: 3,
        detectionRadius: 45
      }
    },
    settings: {
      initialPike: 0,
      initialSilverCarp: 0,
      initialCrucian: 0,
      initialCarp: 3,
      initialPlants: 20,
      initialInvertebrates: 15

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
    initialize() {
      this.reset();
    },

    updateFishParams({ species, params }) {
      this.fishes.forEach(fish => {
        if (fish.species === species) {
          // Обновляем существующих рыб
          fish.speed = params.speed;
          fish.hunger = Math.min(params.initialHunger, fish.hunger);
          fish.reproduceHunger = params.reproduceHunger;
          fish.reproduceAge = params.reproduceAge;
          fish.detectionRadius = params.detectionRadius;
          // Можно добавить другие параметры
        }
      });
      
      // Обновляем параметры для новых рыб
      this.fishSettings[species] = {
        ...this.fishSettings[species],
        ...params
      };
    },

    addFish(species, x = null, y = null, isLarva = false) {
      const types = {
        pike: { type: 'predator', size: isLarva ? 15 : 25, speed: 2, color: '#ff0000', hunger: 30, detectionRadius: this.Radius.pike},
        silver_carp: { type: 'herbivore', size: isLarva ? 10 : 18, speed: 1.5, color: '#800080', hunger: 30, detectionRadius: this.Radius.silver_carp},
        crucian: { type: 'omnivore', size: isLarva ? 12 : 12, speed: 1.8, color: '#ffff00', hunger: 30, detectionRadius: this.Radius.crucian},
        carp: { type: 'omnivore', size: isLarva ? 12 : 20, speed: 1.3, color: '#ffa500', hunger: 30, detectionRadius: this.Radius.carp}
      };

      this.fishes.push({
        id: Date.now() + Math.random(),
        species,
        ...types[species],
        x: x ?? Math.random() * this.width,
        y: y ?? Math.random() * this.height,
        direction: Math.random() * Math.PI * 2,
        hunger: 30,
        age: 0,
        isReproducing: false,
        reproductionProgress: 0,
        reproductionPartnerId: null,
        reproductionCooldown: 0 // Таймер задержки в секундах
      });
    },

    setDetectionRadius({ species, radius }) {
      this.Radius[species] = radius;
      this.fishes.forEach(fish => {
        if (fish.species === species) {
        // Создаем новый объект для реактивности
        fish.detectionRadius = radius;
      }
      });
    },

    addPlant() {
      this.plants.push({
        id: Date.now() + Math.random(),
        x: Math.max(20, Math.min(this.width - 20, (Math.random() * this.width))),
        y: Math.max(20, Math.min(this.height - 20, (Math.random() * this.height))),
        size: 5 + Math.random() * 10,
        growthRate: 0.1 + Math.random() * 0.2 // Разная скорость роста
      });
    },

    addInvertebrate() {
      this.invertebrates.push({
        id: Date.now() + Math.random(),
        x: Math.max(20, Math.min(this.width - 20, (Math.random() * this.width))),
        y: Math.max(20, Math.min(this.height - 20, (Math.random() * this.height))),
        size: 10 + Math.random() * 8,
        color: '#555555',
        speed: 0.6
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
      this.lastFrameTime = performance.now();
      
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
        plant.size = Math.min(30, plant.size + plant.growthRate * speedFactor); // Ограничение 30px
        
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
        // Жизненные процессы (зависят от скорости);
        // Обновление голода
        // В цикле обновления рыб добавьте:
        fish.age += speedFactor * 0.1; // Увеличиваем возраст
        fish.hunger = Math.min(200, fish.hunger + fish.size * 0.1 * speedFactor);

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
        if (fish.age >= 3 && fish.hunger <= 80 && !fish.isReproducing && 
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
              other.age >= 1 &&
              other.hunger <= 80 &&
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
      
      // Фиксируем точку встречи (середина между рыбами)
      fish.reproductionPoint = {
        x: (fish.x + partner.x) / 2,
        y: (fish.y + partner.y) / 2
      };
      partner.reproductionPoint = fish.reproductionPoint;
    },


    processReproduction(fish, speedFactor) {
      const partner = this.fishes.find(f => f.id === fish.reproductionPartnerId);
      
      // Если партнер исчез (например, умер) - прерываем процесс
      if (!partner) {
        fish.isReproducing = false;
        fish.reproductionProgress = 0;
        return;
      }
      
      // Движение к точке встречи
      const targetX = fish.reproductionPoint.x;
      const targetY = fish.reproductionPoint.y;
      const angle = Math.atan2(targetY - fish.y, targetX - fish.x);
      fish.direction = angle;
      
      // Плавное движение к точке
      const moveSpeed = fish.speed * speedFactor * 30;
      fish.x += Math.cos(angle) * moveSpeed;
      fish.y += Math.sin(angle) * moveSpeed;
      
      // Увеличиваем прогресс размножения
      fish.reproductionProgress += speedFactor;
      
      // Если достигли точки встречи и прошло достаточно времени
      if (this.getDistance(fish, fish.reproductionPoint) < 20 && 
          fish.reproductionProgress >= 3) {
        
        // Создаем личинку
        this.addLarva(
          fish.reproductionPoint.x,
          fish.reproductionPoint.y,
          fish.species
        );
        
        // Устанавливаем задержку с учетом скорости симуляции
        fish.reproductionCooldown = 20; // 20 секунд
        partner.reproductionCooldown = 20;

        // Тратим энергию
        fish.hunger = Math.min(200, fish.hunger + 30);
        partner.hunger = Math.min(200, partner.hunger + 30);
        
        // Сбрасываем флаги размножения
        fish.isReproducing = false;
        fish.reproductionProgress = 0;
        partner.isReproducing = false;
        partner.reproductionProgress = 0;
      }
    },

    //Питание
    processFeeding(fish, index, speedFactor) {
      // Поиск ближайшей цели в радиусе видимости
      let target = null;
      let minDistance = Infinity;

      // Для хищников (щук)
      if (fish.species === 'pike') {
          this.fishes.forEach(prey => {
              if (prey !== fish && prey.species !== 'pike' && prey.size < fish.size) {
                  const distance = this.getDistance(fish, prey);
                  if (distance < this.detectionRadius && distance < minDistance) {
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

    consumeTarget(fish, target) {
      // Фиксированные значения уменьшения голода
      const hungerReduction = {
          pike: 50,       // Хищники (щуки)
          silver_carp: 30, // Травоядные (толстолобики)
          default: 40      // Всеядные (караси, карпы)
      };

      // Определяем сколько восполнить голода
      const reduction = hungerReduction[fish.species] || hungerReduction.default;
      
      // Корректируем голод (не менее 0 и не более 200)
      fish.hunger = Math.max(0, fish.hunger - reduction);

      // Удаляем цель
      if (fish.species === 'pike' || !target.hasOwnProperty('growthRate')) {
          // Хищники съедают рыб, всеядные - беспозвоночных (полностью)
          this.removeEntity(target);
      } else {
          // Травоядные и всеядные частично съедают растения
          target.size = Math.max(0, target.size - 5);
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