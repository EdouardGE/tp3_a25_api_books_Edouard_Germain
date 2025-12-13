<script setup>

import { ref, onMounted, reactive } from 'vue';
import { useBookStore } from '@/stores/books';
import { useRouter } from 'vue-router'

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3000'


const bookStore = useBookStore();
const router = useRouter()

const saving = ref(false)
const apiSuccess = ref(null)


const form = ref({
  titre: '',
  auteurs: [],
  isbn: '',
  prix: null,
  quantite: 0,
})

const auteursList = ref([])

const errors = reactive({
  titre: null,
  auteurs: null,
  isbn: null,
  prix: null,
  quantite: null,
  global: null
})

function resetErrors() {
  errors.titre = null
  errors.auteurs = null
  errors.isbn = null
  errors.prix = null
  errors.quantite = null
  errors.global = null
}


function applyApiErrors(err) {
  const bag = err?.errors || {}
  errors.titre = bag.titre?.[0] || null
  errors.auteurs = bag.auteurs?.[0] || null
  errors.isbn = bag.isbn?.[0] || null
  errors.prix = bag.prix?.[0] || null
  errors.quantite = bag.quantite?.[0] || null
  errors.global = err?.message || null
}

function handleHttpError(err, fallback = "Erreur.") {
  const status = err?.status

  if (status === 401) {
    router.push({ name: 'login' })
    return true
  }

  if (status === 403) {
    router.push({ name: 'forbidden' })
    return true
  }

  if (status === 404) {
    router.push({ name: 'notfound' })
    return true
  }

  errors.global = err?.message || fallback
  return false
}


onMounted(async () => {
  try {
    const res = await fetch(`${API_URL}/api/auteurs`)
    const data = await res.json().catch(() => null)
    if (!res.ok) throw { status: res.status, ...(data || {}), message: data?.message || "Impossible de charger les auteurs" }

    auteursList.value = await res.json()
  } catch (err) {
    handleHttpError(err, err?.message || "Erreur lors du chargement.")
  }
})

function validate() {
  resetErrors()

  if (!form.value.titre?.trim()) errors.titre = "Titre requis."
  if (!Array.isArray(form.value.auteurs) || form.value.auteurs.length === 0) errors.auteurs = "Choisis au moins un auteur."
  if (!form.value.isbn?.trim()) errors.isbn = "ISBN requis."

  const prix = Number(form.value.prix)
  if (!Number.isFinite(prix) || prix <= 0) errors.prix = "Le prix doit être supérieur à 0."

  const q = Number(form.value.quantite)
  if (!Number.isFinite(q) || q < 0) errors.quantite = "La quantité doit être ≥ 0."

  return !errors.titre && !errors.auteurs && !errors.isbn && !errors.prix && !errors.quantite
}


async function createBook() {
    apiSuccess.value = null
    resetErrors()

    if (!validate()) return

    saving.value = true

    try {
      await bookStore.addBook(form.value);
      apiSuccess.value = "Livre ajouté avec succès."
      router.push({ name: 'home' })
    } catch (error) {
      if (handleHttpError(err, "Erreur lors de l'ajout.")) return
      applyApiErrors(error)
      if (err?.status === 409 && !errors.global) {
        errors.global = err?.message || "Conflit : données déjà utilisées."
      }
      if (!errors.global) errors.global = "Erreur lors de l'ajout."
    } finally {
      saving.value = false
    }
}

</script>


<template>
  <div class="book-create-page">
    <h1>Créer un nouveau livre</h1>

    <form @submit.prevent="createBook" class="form-box">
      <div class="field">
        <label>Titre</label>
        <input v-model="form.titre" type="text" required :class="{ invalid: errors.titre }" />
        <p v-if="errors.titre" class="field-error">{{ errors.titre }}</p>
      </div>

      <div class="field">
        <label>Auteur(s)</label>
        <select v-model="form.auteurs" multiple required :class="{ invalid: errors.auteurs }">
          <option v-for="a in auteursList" :key="a._id" :value="a._id">
            {{ a.nom }}
          </option>
        </select>
        <p v-if="errors.auteurs" class="field-error">{{ errors.auteurs }}</p>
      </div>

      <div class="field">
        <label>Prix</label>
        <input
          v-model.number="form.prix"
          type="number"
          min="0.01"
          step="0.01"
          required
          :class="{ invalid: errors.prix }"
        />
        <p v-if="errors.prix" class="field-error">{{ errors.prix }}</p>
      </div>

      <div class="field">
        <label>Quantité en stock</label>
        <input v-model.number="form.quantite" type="number" min="0" :class="{ invalid: errors.quantite }" />
        <p v-if="errors.quantite" class="field-error">{{ errors.quantite }}</p>
      </div>

      <div class="field">
        <label>ISBN</label>
        <input v-model="form.isbn" type="text" required :class="{ invalid: errors.isbn }" />
        <p v-if="errors.isbn" class="field-error">{{ errors.isbn }}</p>
      </div>

      <button type="submit" :disabled="saving">
        {{ saving ? "Création..." : "Créer le livre" }}
      </button>

      <p v-if="errors.global" class="error">{{ errors.global }}</p>
    </form>
  </div>
</template>
<style scoped>
.book-create-page{
  max-width: 560px;
  margin: 2.5rem auto;
  padding: 0 1rem;
}

.book-create-page h1{
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
  gap: .95rem;
}

.field{
  display:flex;
  flex-direction: column;
  align-items: stretch;
  gap: .35rem;
  margin-bottom: 10px;
}

.field label{
  font-weight: 900;
  color:#0f172a;
  font-size: .95rem;
}

.field input,
.field select{
  width: 100%;
  border: 1px solid rgba(0,0,0,.12);
  border-radius: 14px;
  padding: .75rem .9rem;
  background: rgba(255,255,255,.92);
  outline: none;
  transition: box-shadow .15s ease, border-color .15s ease, transform .12s ease;
}

.field input:focus,
.field select:focus{
  border-color: rgba(59,130,246,.65);
  box-shadow: 0 0 0 .25rem rgba(59,130,246,.18);
  transform: translateY(-1px);
}

.field select[multiple]{
  min-height: 140px;
  padding: .55rem .65rem;
}

.field select option{
  padding: .35rem .4rem;
}

button[type="submit"]{
  margin-top: .25rem;
  border: 0;
  border-radius: 14px;
  padding: .85rem 1rem;
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
  filter: none;
}

.form-box p[style*="color:red"]{
  margin: .2rem 0 0;
  padding: .75rem 1rem;
  border-radius: 14px;
  background: rgba(239,68,68,.10);
  border: 1px solid rgba(239,68,68,.25);
  color:#991b1b !important;
  font-weight: 900;
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

.error{
  margin: .2rem 0 0;
  padding: .75rem 1rem;
  border-radius: 14px;
  background: rgba(239,68,68,.10);
  border: 1px solid rgba(239,68,68,.25);
  color:#991b1b;
  font-weight: 900;
}


@media (max-width: 420px){
  .form-box{ padding: 1rem; }
  .field input, .field select{ padding: .7rem .85rem; }
}

</style>