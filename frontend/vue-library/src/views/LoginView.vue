<script setup>

import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'


const auth = useAuthStore()
const router = useRouter()

const form = ref({ email: "", password: "" })
const loading = ref(false)

const errors = reactive({ email: null, password: null, global: null })
function resetErrors() {
  errors.email = null
  errors.password = null
  errors.global = null
}



function validate() {
  resetErrors()

  if (!form.value.email) errors.email = "Email requis."
  else if (!/^\S+@\S+\.\S+$/.test(form.value.email)) errors.email = "Email invalide."

  if (!form.value.password) errors.password = "Mot de passe requis."

  return !errors.email && !errors.password
}

async function login() {
  if (!validate()) return

  loading.value = true
  errors.global = null

  try {
    await auth.login(form.value.email, form.value.password)
    router.push({ name: "home" })
  } catch (error) {
    const status = error?.status

    if (status === 403) {
      errors.global = "Accès refusé."
      return
    }

    if (status === 400 || status === 422) {
      const bag = error?.errors || {}
      errors.email = bag.email?.[0] || errors.email
      errors.password = bag.password?.[0] || errors.password
      errors.global = error?.message || "Champs invalides."
      return
    }

    if (status === 401) {
      errors.global = error?.message || "Email ou mot de passe invalide."
      return
    }

    errors.global = error?.message || "Erreur inconnue"
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
        <input v-model="form.email" type="email" required :class="{ invalid: errors.email }" />
        <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
      </div>

      <div class="field">
        <label>Mot de passe</label>
        <input v-model="form.password" type="password" required :class="{ invalid: errors.password }" />
        <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? "Connexion..." : "Se connecter" }}
      </button>

      <p v-if="errors.global" class="error">{{ errors.global }}</p>
    </form>
  </div>
</template>

<style scoped>
.form-page{
  max-width: 520px;
  margin: 2.5rem auto;
  padding: 0 1rem;
}

.form-page h1{
  font-weight: 950;
  color:#0f172a;
  margin: 0 0 1rem;
  letter-spacing: .2px;
}

.form-box{
  background: rgba(255,255,255,.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(0,0,0,.06);
  border-radius: 18px;
  padding: 1.25rem;
  box-shadow: 0 14px 35px rgba(0,0,0,.08);

  display:flex;
  flex-direction: column;
  gap: .9rem;
}

.field{
  display:flex;
  flex-direction: column;
  gap: .35rem;
}

.field label{
  font-weight: 900;
  color:#0f172a;
  font-size: .95rem;
}

.field input{
  border: 1px solid rgba(0,0,0,.12);
  border-radius: 14px;
  padding: .75rem .9rem;
  background: rgba(255,255,255,.92);
  outline: none;
  transition: box-shadow .15s ease, border-color .15s ease, transform .12s ease;
}

.field input:focus{
  border-color: rgba(59,130,246,.65);
  box-shadow: 0 0 0 .25rem rgba(59,130,246,.18);
  transform: translateY(-1px);
}

.field-error{
  margin: 0;
  font-size: .9rem;
  font-weight: 850;
  color: #991b1b;
}

.invalid{
  border-color: rgba(239,68,68,.55) !important;
  box-shadow: 0 0 0 .25rem rgba(239,68,68,.14) !important;
}

button[type="submit"]{
  margin-top: .25rem;
  border: 0;
  border-radius: 14px;
  padding: .8rem 1rem;
  font-weight: 950;
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 16px 32px rgba(37,99,235,.22);
  transition: transform .12s ease, box-shadow .12s ease, filter .12s ease;
}

button[type="submit"]:hover{
  transform: translateY(-1px);
  filter: brightness(1.02);
  box-shadow: 0 20px 40px rgba(37,99,235,.26);
}

button[type="submit"]:disabled{
  opacity: .7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error{
  margin: .25rem 0 0;
  padding: .75rem 1rem;
  border-radius: 14px;
  background: rgba(239,68,68,.10);
  border: 1px solid rgba(239,68,68,.25);
  color:#991b1b;
  font-weight: 900;
}

@media (max-width: 420px){
  .form-box{ padding: 1rem; }
  .field input{ padding: .7rem .85rem; }
}

</style>