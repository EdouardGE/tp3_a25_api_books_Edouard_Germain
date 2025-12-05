<script setup>

import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()


const profile = ref(null)
const apiErrors = ref('')
const loading = ref(true)

onMounted(async function () {
  try {
    profile.value = await userStore.fetchProfile()
  } catch (error) {
    apiErrors.value = error.message || "Une erreur est survenue."
  } finally {
    loading.value = false
  }
})

</script>

<template>
  <div class="profile-page">
    <h1>Profil</h1>

    <p v-if="apiErrors" class="error">
      {{ apiErrors }}
    </p>
    <p v-if="!profile">Chargement...</p>

    <div v-else>
      <p><strong>Nom d'utilisateur:</strong> {{ profile.username }}</p>
      <p><strong>Prénom:</strong> {{ profile.first_name }}</p>
      <p><strong>Nom:</strong> {{ profile.last_name }}</p>
      <p><strong>Email:</strong> {{ profile.email }}</p>
      <p><strong>Actif :</strong> {{ profile.is_active ? "Oui" : "Non" }}</p>
      <p><strong>Admin :</strong> {{ profile.is_admin ? "Oui" : "Non" }}</p>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 400px;
  margin: 40px auto;
}

.error {
  color: red;
  margin-bottom: 1rem;
}
</style>