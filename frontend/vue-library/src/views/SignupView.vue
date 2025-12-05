<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const form = ref({
  username: '',
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const loading = ref(false)
const apiErrors = ref(null)

const signup = async () => {
  apiErrors.value = null
  loading.value = true

  try {
    await auth.signup({ ...form.value })

    router.push({ name: 'login' })
  } catch (err) {
    apiErrors.value = err
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="form-page">
    <h1>Inscription</h1>

    <form @submit.prevent="signup" class="form-box">
      <div class="field">
        <label>Nom d'utilisateur</label>
        <input v-model="form.username" type="text" required />
        <p class="error" v-if="apiErrors?.errors?.username">
          {{ apiErrors.errors.username[0] }}
        </p>
      </div>

      <div class="field">
        <label>Prénom</label>
        <input v-model="form.first_name" type="text" required />
        <p class="error" v-if="apiErrors?.errors?.first_name">
          {{ apiErrors.errors.first_name[0] }}
        </p>
      </div>

      <div class="field">
        <label>Nom</label>
        <input v-model="form.last_name" type="text" required />
        <p class="error" v-if="apiErrors?.errors?.last_name">
          {{ apiErrors.errors.last_name[0] }}
        </p>
      </div>

      <div class="field">
        <label>Email</label>
        <input v-model="form.email" type="email" required />
        <p class="error" v-if="apiErrors?.errors?.email">
          {{ apiErrors.errors.email[0] }}
        </p>
      </div>

      <div class="field">
        <label>Mot de passe</label>
        <input v-model="form.password" type="password" required />
        <p class="error" v-if="apiErrors?.errors?.password">
          {{ apiErrors.errors.password[0] }}
        </p>
      </div>

      <div class="field">
        <label>Confirmation du mot de passe</label>
        <input v-model="form.password_confirmation" type="password" required />
        <p class="error" v-if="apiErrors?.errors?.password_confirmation">
          {{ apiErrors.errors.password_confirmation[0] }}
        </p>
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? "Création du compte..." : "S'inscrire" }}
      </button>

      <p v-if="apiErrors?.message" class="error global">
        {{ apiErrors.message }}
      </p>
    </form>
  </div>
</template>