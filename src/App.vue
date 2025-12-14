<script setup>
import { RouterLink, RouterView } from 'vue-router'
import AppNavigation from './components/AppNavigation.vue'
</script>

<template>
  <header class="bg-light border-bottom">
    <div class="container py-2">
      <AppNavigation />
    </div>
  </header>

  <main class="container my-4">
    <RouterView />
  </main>
</template>


<style scoped>

</style>
