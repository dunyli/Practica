<template>
  <div class="app">
    <h1>Моделирование экосистемы водоема</h1>
    <Pond />
  </div>
</template>

<script>
import Pond from './components/Pond.vue';

export default {
  components: { Pond }
};
</script>

<style>
.app {
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #1a5fb4;
}
</style>