<script setup>

import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useAuthStore } from "@/stores/auth";
import { useRouter } from 'vue-router'


const userStore = useUserStore()
const auth = useAuthStore();
const router = useRouter()


const profile = ref(null)

const loading = ref(true)
const saving = ref(false)
const apiError = ref(null)
const apiSuccess = ref(null)

onMounted(async function () {
  try {
    const data = await userStore.fetchProfile()
    profile.value = data
  } catch (error) {
    apiError.value = error?.message || "Impossible de charger le profil.";
  } finally {
    loading.value = false
  }
})

async function updateProfile() {
    apiError.value = null
    apiSuccess.value = null;
    saving.value = true;

    try {
      const updated = await userStore.updateUser(null, {
        first_name: profile.value.first_name,
        last_name: profile.value.last_name,
        email: profile.value.email
      });

      profile.value = updated;
      apiSuccess.value = "Profil mis à jour avec succès.";
    } catch (error) {
      apiError.value = error?.message || "Erreur lors de la mise à jour.";
    } finally {
      saving.value = false
    }
}

async function deleteAccount() {

    const confirmed = confirm("Voulez-vous vraiment supprimer votre compte ?");
    if (!confirmed) return;

    apiError.value = null
    saving.value = true;

    try {
      await userStore.deleteUser(null)

      auth.logout();

      router.push({ name: 'signup' })
    } catch (error) {
      apiError.value = error?.message || "Erreur lors de la suppression.";
    } finally {
      saving.value = false
    }
}

</script>

<template>
  <div class="profile-page">
    <h1>Profil</h1>

    <p v-if="loading">Chargement...</p>


    <p v-if="apiError" class="error">{{ apiError }}</p>
    <p v-if="apiSuccess" class="success">{{ apiSuccess }}</p>

    <div v-if="profile && !loading">
      <h2>Informations</h2>
      <p><strong>Nom d'utilisateur:</strong> {{ profile.username }}</p>
      <p><strong>Prénom:</strong> {{ profile.first_name }}</p>
      <p><strong>Nom:</strong> {{ profile.last_name }}</p>
      <p><strong>Email:</strong> {{ profile.email }}</p>
      <img :src="profile.avatar" alt="Avatar" v-if="profile.avatar" />

      <h2>Modifier mon profil</h2>

      <form @submit.prevent="updateProfile" class="form-box">

        <div class="field">
          <label>Prénom</label>
          <input v-model="profile.first_name" type="text" required />
        </div>

        <div class="field">
          <label>Nom</label>
          <input v-model="profile.last_name" type="text" required />
        </div>

        <div class="field">
          <label>Email</label>
          <input v-model="profile.email" type="email" required />
        </div>

        <button type="submit" :disabled="saving">
          {{ saving ? "Sauvegarde..." : "Mettre à jour" }}
        </button>
      </form>

      <h2>Supprimer mon compte</h2>
      <button class="danger" @click="deleteAccount" :disabled="saving">

        {{ saving ? "Suppression..." : "Supprimer mon compte" }}
      </button>




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

.success { color: green; margin: 10px 0; }

.form-box {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
}


.danger {
  background: #e74c3c;
  border: none;
  padding: 10px;
  border-radius: 6px;
  color: white;
  cursor: pointer;
}

.danger:hover {
  background: #c0392b;
}
</style>