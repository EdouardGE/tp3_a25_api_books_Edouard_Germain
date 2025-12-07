<script setup>
  import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const saving = ref(false)
const apiError = ref(null)

function logout() {
    apiError.value = null
    saving.value = true;

    try {
      auth.logout()
      router.push({ name: 'login' })
    } catch (error) {
      apiError.value = error?.message || "Erreur lors de la déconnexion.";
    } finally {
      saving.value = false
    }
}

</script>

<template>
  <nav class="d-flex align-items-center justify-content-between">
    <div class="d-flex align-items-center">
      <h1 class="m-0 me-4" style="font-size: 1.5rem;">
        Librairie Kaneto
      </h1>
    </div>

    <div class="d-flex align-items-center">

      <RouterLink to="/" class="me-3 py-2 d-inline-block">
        Livres
      </RouterLink>

      <RouterLink :to="{ name: 'about' }" class="me-3 py-2 d-inline-block">
        À propos
      </RouterLink>

      <template v-if="!auth.isAuthenticated">

        <RouterLink :to="{ name: 'login' }" class="me-3 py-2 d-inline-block">
          Connexion
        </RouterLink>

        <RouterLink :to="{ name: 'signup' }" class="py-2 d-inline-block">
          Inscription
        </RouterLink>
      </template>

      <template v-else>
        <RouterLink :to="{ name: 'profile' }" class="me-3 py-2 d-inline-block">
          Profil
        </RouterLink>

        <button class="btn btn-sm btn-outline-danger ms-3" @click="logout" :disabled="saving">
          {{ saving ? "Déconnexion..." : "Déconnexion" }}
        </button>
      </template>

    </div>
  </nav>
</template>

