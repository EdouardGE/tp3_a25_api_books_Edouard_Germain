<script setup>

import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'


const auth = useAuthStore()
const router = useRouter()

const form = ref({
  email: '',
  password: ''
})



const loading = ref(false)
const apiError = ref(null)

const login = async () => {
    apiError.value = null
    loading.value = true

    try {
        await auth.login(form.value.email, form.value.password)
        router.push({ name: 'home' })
    } catch (error) {
        apiError.value = error?.message || 'Erreur inconnue'
    } finally {
        loading.value = false
    }
}
</script>

<template>
  <div class="form-page">
    <h1>Connexion</h1>

    <form @submit.prevent="login" class="form-box">

      <div class="field">
        <label>Email</label>
        <input v-model="form.email" type="email" required />
      </div>

      <div class="field">
        <label>Mot de passe</label>
        <input v-model="form.password" type="password" required />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? "Connexion..." : "Se connecter" }}
      </button>

      <p v-if="apiError" class="error">
        {{ apiError }}
      </p>

    </form>
  </div>
</template>