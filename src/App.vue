<template>
  <Pond />
</template>

<script>
import { onMounted } from 'vue';
import { useEcosystemStore } from '@/stores/ecosystem';
import Pond from './components/Pond.vue';

export default {
  components: { Pond },
  setup() {
    const store = useEcosystemStore();
    
    onMounted(() => {
      store.applyDefaultSettings();
    });
  }
};
</script>