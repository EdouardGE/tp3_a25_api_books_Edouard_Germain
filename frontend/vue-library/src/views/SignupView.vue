<script setup>
import { ref, reactive } from 'vue'
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

const errors = reactive({
  username: null,
  first_name: null,
  last_name: null,
  email: null,
  password: null,
  password_confirmation: null,
  global: null
})

function resetErrors() {
  errors.username = null
  errors.first_name = null
  errors.last_name = null
  errors.email = null
  errors.password = null
  errors.password_confirmation = null
  errors.global = null
}

function validate() {
  resetErrors()

  if (!form.value.username) errors.username = "Nom d'utilisateur requis."
  if (!form.value.first_name) errors.first_name = "Prénom requis."
  if (!form.value.last_name) errors.last_name = "Nom requis."

  if (!form.value.email) errors.email = "Email requis."
  else if (!/^\S+@\S+\.\S+$/.test(form.value.email)) errors.email = "Email invalide."

  if (!form.value.password) errors.password = "Mot de passe requis."
  else if (form.value.password.length < 6) errors.password = "6 caractères minimum."

  if (!form.value.password_confirmation) errors.password_confirmation = "Confirmation requise."
  else if (form.value.password !== form.value.password_confirmation) {
    errors.password_confirmation = "Les mots de passe ne correspondent pas."
  }

  return !errors.username && !errors.first_name && !errors.last_name && !errors.email && !errors.password && !errors.password_confirmation
}

function applyApiErrors(err) {
  const bag = err?.errors || {}
  errors.username = bag.username?.[0] || errors.username
  errors.first_name = bag.first_name?.[0] || errors.first_name
  errors.last_name = bag.last_name?.[0] || errors.last_name
  errors.email = bag.email?.[0] || errors.email
  errors.password = bag.password?.[0] || errors.password
  errors.password_confirmation = bag.password_confirmation?.[0] || errors.password_confirmation
  errors.global = err?.message || errors.global
}

async function signup() {
  if (!validate()) return

  loading.value = true
  errors.global = null

  try {
    await auth.signup({ ...form.value })

    router.push({ name: 'login' })
  } catch (err) {
    if (err?.status === 401) {
      auth.logout()
      return router.push({ name: 'login' })
    }

    if (err?.status === 403) {
      errors.global = err?.message || "Accès refusé."
      return
    }

    if (err?.status === 409) {
      applyApiErrors(err)
      if (!errors.global) errors.global = err?.message || "Conflit : données déjà utilisées."
      return
    }

    if (err?.status === 400 || err?.status === 422) {
      applyApiErrors(err)
      if (!errors.global) errors.global = "Corrige les champs en rouge."
      return
    }

    errors.global = err?.message || "Erreur lors de l'inscription."
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
        <input v-model="form.username" type="text" required :class="{ invalid: errors.username }" />
        <p v-if="errors.username" class="field-error">{{ errors.username }}</p>
      </div>

      <div class="field">
        <label>Prénom</label>
        <input v-model="form.first_name" type="text" required :class="{ invalid: errors.first_name }" />
        <p v-if="errors.first_name" class="field-error">{{ errors.first_name }}</p>
      </div>

      <div class="field">
        <label>Nom</label>
        <input v-model="form.last_name" type="text" required :class="{ invalid: errors.last_name }" />
        <p v-if="errors.last_name" class="field-error">{{ errors.last_name }}</p>
      </div>

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

      <div class="field">
        <label>Confirmation du mot de passe</label>
        <input v-model="form.password_confirmation" type="password" required :class="{ invalid: errors.password_confirmation }" />
        <p v-if="errors.password_confirmation" class="field-error">{{ errors.password_confirmation }}</p>
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? "Création du compte..." : "S'inscrire" }}
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
  font-weight: 900;
  color:#111827;
  margin-bottom: 1rem;
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
  font-weight: 800;
  color:#111827;
  font-size: .95rem;
}

.field input{
  border: 1px solid rgba(0,0,0,.12);
  border-radius: 14px;
  padding: .75rem .9rem;
  background: rgba(255,255,255,.9);
  outline: none;
  transition: box-shadow .15s ease, border-color .15s ease, transform .12s ease;
}

.field input:focus{
  border-color: rgba(59,130,246,.6);
  box-shadow: 0 0 0 .25rem rgba(59,130,246,.18);
  transform: translateY(-1px);
}

.field-error{
  margin: 0;
  font-size: .9rem;
  font-weight: 800;
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
  font-weight: 900;
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