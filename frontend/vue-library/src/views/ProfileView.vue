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
  } catch {
    router.push({ name: 'login' })


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
        </div>
        <div class="d-flex flex-column ">
          <h2>Supprimer mon compte</h2>
          <button class="danger" @click="deleteAccount" :disabled="saving">

            {{ saving ? "Suppression..." : "Supprimer mon compte" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 800px;
  margin: 40px auto;
}

.profile-info{
  background-color: gray;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
}

.profile-info img {
  max-width: 125px;
  border-radius: 50%;
  object-fit: cover;
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
  margin-top: auto;
}

.danger:hover {
  background: #c0392b;
}
</style>