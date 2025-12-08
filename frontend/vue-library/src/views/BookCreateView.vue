<script setup>

import { ref, onMounted } from 'vue'
import { useAuthStore } from "@/stores/auth";
import { useBookStore } from '@/stores/books';
import { useRouter } from 'vue-router'

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3000'


const bookStore = useBookStore();
const router = useRouter()

const loading = ref(true)
const saving = ref(false)
const apiError = ref(null)
const apiSuccess = ref(null)


const form = ref({
  titre: '',
  auteurs: [],
  isbn: '',
  prix: null,
  quantite: 0
})

const auteursList = ref([])


onMounted(async () => {
  try {
    const res = await fetch(`${API_URL}/api/auteurs`)
    if (!res.ok) throw new Error("Impossible de charger les auteurs")

    auteursList.value = await res.json()
  } catch (err) {
    apiError.value = err.message
  }
})


async function createBook() {
    apiError.value = null
    apiSuccess.value = null;
    saving.value = true;

    try {
      await bookStore.addBook(form.value);
      apiSuccess.value = "Livre ajouté avec succès.";
    } catch (error) {
      apiError.value = error?.message || "Erreur lors de l'ajout.";
    } finally {
      saving.value = false
    }
}

</script>


<template>
    <div class ="book-create-page">
        <h1>Créer un nouveau livre</h1>

        <form @submit.prevent="createBook">
            <div>
                <label>Titre</label>
                <input v-model="form.titre" type="text" required />
            </div>

            <div>
                <label>Auteur(s)</label>
                <select v-model="form.auteurs" multiple required>
                <option
                    v-for="a in auteursList"
                    :key="a._id"
                    :value="a._id">
                    {{ a.nom }}
                </option>
                </select>
            </div>

            <div>
                <label>Prix</label>
                <input v-model.number="form.prix" type="number" min="0" step="0.01" required />
            </div>

            <div>
                <label>Quantité en stock</label>
                <input v-model.number="form.quantite" type="number" min="0" />
            </div>

            <div>
                <label>ISBN</label>
                <input v-model="form.isbn" type="text" required />
            </div>

            <button type="submit" :disabled="saving">
                {{ saving ? "Création..." : "Créer le livre" }}
            </button>

            <p v-if="apiError" style="color:red;">
                {{ apiError }}
            </p>
        </form>
    </div>
</template>

<style scoped>
.book-create-page {
  max-width: 350px;
  margin: auto;
}
</style>