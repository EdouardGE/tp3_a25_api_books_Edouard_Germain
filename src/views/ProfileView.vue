<script setup>

import { ref, onMounted, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from "@/stores/auth";
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const auth = useAuthStore();
const router = useRouter()

const profile = ref(null)
const loading = ref(true)
const saving = ref(false)

const toast = reactive({
  show: false,
  type: 'info',
  message: '',
  actionText: null,
  action: null,
  timeoutId: null
})

/* Affiche une notification temporaire (toast) */
function showToast({ type = 'info', message, actionText = null, action = null, duration = 3500 } = {}) {
  if (toast.timeoutId) clearTimeout(toast.timeoutId)

  toast.type = type
  toast.message = message
  toast.actionText = actionText
  toast.action = action
  toast.show = true

  if (duration && duration > 0) {
    toast.timeoutId = setTimeout(() => {
      toast.show = false
      toast.action = null
      toast.actionText = null
    }, duration)
  }
}

/* Ferme immédiatement la notification */
function closeToast() {
  if (toast.timeoutId) clearTimeout(toast.timeoutId)
  toast.show = false
  toast.action = null
  toast.actionText = null
}

const errors = reactive({
  first_name: null,
  last_name: null,
  email: null
})

/* Réinitialise les erreurs du formulaire */
function resetErrors() {
  errors.first_name = null
  errors.last_name = null
  errors.email = null
}

/* Valide les champs du profil utilisateur */
function validate() {
  resetErrors()

  if (!profile.value?.first_name?.trim()) errors.first_name = "Prénom requis."
  if (!profile.value?.last_name?.trim()) errors.last_name = "Nom requis."

  const email = profile.value?.email?.trim() || ''
  if (!email) errors.email = "Email requis."
  else if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = "Email invalide."

  return !errors.first_name && !errors.last_name && !errors.email
}

/* Gère les erreurs HTTP et redirige selon le statut */
async function handleHttpError(err, fallbackMsg = "Erreur.") {
  const status = err?.status

  if (status === 401) {
    auth.logout()
    return router.push({ name: 'login' })
  }
  if (status === 403) return router.push({ name: 'forbidden' })
  if (status === 404) return router.push({ name: 'notfound' })

  showToast({ type: 'error', message: err?.message || fallbackMsg })
}

/* Charge le profil de l’utilisateur */
onMounted(async function () {
  try {
    const data = await userStore.fetchProfile()
    profile.value = data
  } catch {
    router.push({ name: 'login' })
  } finally {
    loading.value = false
  }
})

/* Met à jour les informations du profil utilisateur */
async function updateProfile() {
  if (!validate()) {
    showToast({ type: 'error', message: "Corrige les champs en rouge." })
    return
  }

  saving.value = true;

  try {
    const updated = await userStore.updateUser(null, {
      first_name: profile.value.first_name,
      last_name: profile.value.last_name,
      email: profile.value.email
    });

    profile.value = updated;
    showToast({ type: 'success', message: "Profil mis à jour." })
  } catch (error) {
    if (err?.status === 400 || err?.status === 422) {
          applyApiFieldErrors(err)
          showToast({ type: 'error', message: "Corrige les erreurs." })
        } else {
          await handleHttpError(err, "Erreur lors de la mise à jour.")
        }
  } finally {
    saving.value = false
  }
}

/* Supprime définitivement le compte utilisateur */
async function reallyDeleteAccount() {
  saving.value = true
  try {
    await userStore.deleteUser(null)
    auth.logout()
    showToast({ type: 'success', message: "Compte supprimé." , duration: 1500 })
    router.push({ name: 'signup' })
  } catch (error) {
    showToast({ type: 'error', message: error?.message || "Erreur lors de la suppression." })
  } finally {
    saving.value = false
  }
}

/* Demande confirmation avant suppression du compte */
function deleteAccount() {
  showToast({
    type: 'warning',
    message: "Supprimer ton compte ? Action irréversible.",
    actionText: "Oui, supprimer",
    action: reallyDeleteAccount,
    duration: 0
  })
}

</script>

<template>
  <div class="profile-page">
    <h1>Profil</h1>

    <p v-if="loading">Chargement...</p>



    <div v-if="profile && !loading">
      <div class="profile-info mb-4 d-flex justify-content-between align-items-center">
        <div>
          <p><strong>{{ profile.username }}</strong> </p>
          <img :src="profile.avatar" alt="Avatar" v-if="profile.avatar" />
        </div>
        <div>
          <h2>Informations personnelles</h2>
          <p><strong>Prénom:</strong> {{ profile.first_name }}</p>
          <p><strong>Nom:</strong> {{ profile.last_name }}</p>
          <p><strong>Email:</strong> {{ profile.email }}</p>
        </div>
      </div>

      <div class=" mb-4 d-flex justify-content-between ">
        <div>
          <h2>Modifier mon profil</h2>

          <form @submit.prevent="updateProfile" class="form-box">

            <div class="field">
              <label>Prénom</label>
              <input v-model="profile.first_name" type="text" required :class="{ invalid: errors.first_name }" />
              <p v-if="errors.first_name" class="field-error">{{ errors.first_name }}</p>
            </div>

            <div class="field">
              <label>Nom</label>
              <input v-model="profile.last_name" type="text" required :class="{ invalid: errors.last_name }" />
              <p v-if="errors.last_name" class="field-error">{{ errors.last_name }}</p>
            </div>

            <div class="field">
              <label>Email</label>
              <input v-model="profile.email" type="email" required :class="{ invalid: errors.email }" />
              <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
            </div>

            <button type="submit" :disabled="saving">
              {{ saving ? "Sauvegarde..." : "Mettre à jour" }}
            </button>
          </form>
        </div>
        <div class="d-flex flex-column">
          <h2>Supprimer mon compte</h2>
          <button class="danger" @click="deleteAccount" :disabled="saving">
            {{ saving ? "Suppression..." : "Supprimer mon compte" }}
          </button>
        </div>
      </div>
    </div>
        <div class="toast-wrap" :class="{ show: toast.show }" aria-live="polite" aria-atomic="true">
        <div class="toast" :class="toast.type">
        <div class="toast-msg">{{ toast.message }}</div>
        <div class="toast-actions">
          <button
            v-if="toast.actionText"
            class="toast-action"
            :disabled="saving"
            @click="async () => { await toast.action?.(); closeToast(); }"
          >
            {{ toast.actionText }}
          </button>
          <button class="toast-close" @click="closeToast" aria-label="Fermer">✕</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page{
  max-width: 900px;
  margin: 2.5rem auto;
  padding: 0 1rem;
}

.profile-page h1{
  font-weight: 900;
  color:#111827;
  margin-bottom: 1rem;
}

.error, .success{
  padding: .75rem 1rem;
  border-radius: 12px;
  margin: .75rem 0;
  border: 1px solid rgba(0,0,0,.06);
}
.error{
  background: rgba(239,68,68,.10);
  color: #991b1b;
  border-color: rgba(239,68,68,.25);
}
.success{
  background: rgba(34,197,94,.12);
  color: #166534;
  border-color: rgba(34,197,94,.25);
}

.profile-info{
  background: rgba(255,255,255,.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(0,0,0,.06);
  box-shadow: 0 10px 30px rgba(0,0,0,.06);
  padding: 1.25rem;
  border-radius: 16px;
  gap: 1.25rem;
}

.profile-info p{
  margin: .25rem 0;
  color:#374151;
}

.profile-info h2{
  margin: 0 0 .5rem;
  font-weight: 900;
  color:#111827;
  font-size: 1.15rem;
}

.profile-info img{
  width: 120px;
  height: 120px;
  border-radius: 999px;
  object-fit: cover;
  border: 3px solid rgba(255,255,255,.9);
  box-shadow: 0 12px 25px rgba(0,0,0,.12);
  margin-top: .5rem;
}

.form-box{
  width: min(420px, 100%);
  background: rgba(255,255,255,.75);
  border: 1px solid rgba(0,0,0,.06);
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 10px 30px rgba(0,0,0,.06);
  display:flex;
  flex-direction: column;
  gap: .9rem;
}

.field{
  display:flex;
  flex-direction: column;
  gap: .35rem;
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

.field label{
  font-weight: 800;
  color:#111827;
  margin-bottom: .35rem;
  font-size: .95rem;
}

.field input{
  border: 1px solid rgba(0,0,0,.12);
  border-radius: 12px;
  padding: .7rem .85rem;
  outline: none;
  transition: box-shadow .15s ease, border-color .15s ease, transform .15s ease;
  background: rgba(255,255,255,.9);
}

.field input:focus{
  border-color: rgba(59,130,246,.6);
  box-shadow: 0 0 0 .25rem rgba(59,130,246,.18);
}

.form-box button[type="submit"]{
  border: 0;
  border-radius: 12px;
  padding: .7rem .9rem;
  font-weight: 900;
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transition: transform .12s ease, box-shadow .12s ease, filter .12s ease;
}

.form-box button[type="submit"]:hover{
  transform: translateY(-1px);
  filter: brightness(1.02);
}

.form-box button:disabled,
.danger:disabled{
  opacity: .7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.danger{
  border: 1px solid rgba(239,68,68,.35);
  background: rgba(239,68,68,.10);
  color: #991b1b;
  padding: .8rem 1rem;
  border-radius: 14px;
  font-weight: 900;
  transition: transform .12s ease, background .12s ease, box-shadow .12s ease;
}

.danger:hover{
  background: rgba(239,68,68,.16);
  transform: translateY(-1px);
}

.toast{
  min-width: 280px;
  max-width: min(420px, calc(100vw - 32px));
  border-radius: 16px;
  padding: .85rem 1rem;
  border: 1px solid rgba(0,0,0,.10);
  background: rgba(255,255,255,.90);
  backdrop-filter: blur(10px);
  display:flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
}


.toast-msg{
  font-weight: 850;
  color:#0f172a;
  line-height: 1.2;
}

.toast-wrap{
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 2000;

  transform: translateY(16px);
  opacity: 0;
  pointer-events: none;

  transition: opacity .15s ease, transform .15s ease;
}

.toast-wrap.show{
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.toast-actions{
  display:flex;
  align-items:center;
  gap: .5rem;
}

.toast-close{
  border: 0;
  background: transparent;
  font-weight: 900;
  cursor: pointer;
  opacity: .7;
}
.toast-close:hover{ opacity: 1; }

.toast-action{
  border: 0;
  border-radius: 12px;
  padding: .45rem .7rem;
  font-weight: 900;
  cursor: pointer;
}

.toast.success{
  border-color: rgba(34,197,94,.25);
  background: rgba(34,197,94,.12);
}
.toast.error{
  border-color: rgba(239,68,68,.25);
  background: rgba(239,68,68,.12);
}
.toast.warning{
  border-color: rgba(245,158,11,.30);
  background: rgba(245,158,11,.14);
}
.toast.info{
  border-color: rgba(59,130,246,.25);
  background: rgba(59,130,246,.12);
}

.toast.warning .toast-action{
  background: rgba(239,68,68,.14);
  color:#991b1b;
}
.toast.success .toast-action{
  background: rgba(34,197,94,.18);
  color:#166534;
}
.toast.error .toast-action{
  background: rgba(239,68,68,.18);
  color:#991b1b;
}
.toast.info .toast-action{
  background: rgba(59,130,246,.18);
  color:#1d4ed8;
}

@media (max-width: 768px){
  .profile-info{
    flex-direction: column;
    align-items: flex-start !important;
  }

  .profile-page > div > .mb-4.d-flex.justify-content-between{
    flex-direction: column;
    gap: 1rem;
  }

  .form-box{
    width: 100%;
  }
}

</style>