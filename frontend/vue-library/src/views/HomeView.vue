<script setup>
import { ref, onMounted, computed } from 'vue'
import { useBookStore } from '@/stores/books'
import BookCard from '@/components/BookCard.vue'

const bookStore = useBookStore()

const loading = ref(true)
const apiError = ref(null)

const isSearching = ref(false);
const search = ref("");
const selectedCategory = ref("")

async function changePage(newPage) {
  if (newPage < 1 || newPage > bookStore.totalPages) return;

  loading.value = true;
  apiError.value = null;

  try {
      await bookStore.fetchBooks(newPage, bookStore.pageSize);
  } catch (error) {
      apiError.value = error?.message || "Impossible de charger les livres.";
  } finally {
      loading.value = false;
  }
}

onMounted(async function () {
  try {
    await bookStore.fetchBooks(1, 4)
  } catch (error) {
    apiError.value = error?.message || "Impossible de charger les livres.";
  } finally {
    loading.value = false
  }
})

async function searchBooks(query) {
  loading.value = true;
  apiError.value = null;

  try {
    const q = query.trim()
    if (!q) {
        await bookStore.fetchBooks(1, bookStore.pageSize);
        isSearching.value = false;
        return;
    }
    isSearching.value = true;
    await bookStore.searchBooks(q);

  } catch (error) {
    apiError.value = error?.message || "Erreur lors de la recherche.";
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  search.value = ""
  selectedCategory.value = ""
  isSearching.value = false
  searchBooks("")
}

const categoriesOptions = computed(() => {
  const set = new Set()
  for (const b of bookStore.books) {
    for (const c of (b.categories ?? [])) {
      if (c?.nom) set.add(c.nom)
    }
  }
  return ["", ...Array.from(set).sort((a, b) => a.localeCompare(b))]
})

const filteredBooks = computed(() => {
  const cat = selectedCategory.value
  if (!cat) return bookStore.books

  return bookStore.books.filter(b =>
    (b.categories ?? []).some(c => c?.nom === cat)
  )
})

function resetSearch() {
  search.value = "";
  isSearching.value = false;
  searchBooks("");
}
</script>

<template>
  <div class="book-page">
    <h1>Liste des livres</h1>

    <div class="search-bar mb-4 d-flex justify-content-center align-items-center gap-2 flex-wrap">
      <input v-model="search" type="text" placeholder="Rechercher un livre par titre ou auteur..."
        @input="searchBooks(search)"
        class="form-control"
        style="max-width:420px"
      />

      <select v-model="selectedCategory" class="form-select" style="max-width:260px">
        <option value="">Toutes les catégories</option>
        <option v-for="c in categoriesOptions.slice(1)" :key="c"
          :value="c">
          {{ c }}
        </option>
      </select>

      <button
        @click="resetFilters" class="btn btn-secondary" :disabled="!isSearching && !selectedCategory && !search" >
        Réinitialiser
      </button>
    </div>

    <p v-if="loading">Chargement...</p>
    <p v-if="apiError" class="error">{{ apiError }}</p>

    <p v-if="!loading && !apiError && filteredBooks.length === 0" class="text-center text-muted">
      Aucun livre pour ce filtre.
    </p>

    <div v-if="!loading && !apiError" class="books-grid d-flex flex-wrap gap-3 justify-content-center m-4">
      <BookCard
        v-for="livre in filteredBooks"
        :key="livre._id"
        :book="livre"
      />
    </div>

    <nav v-if="!loading && !apiError && bookStore.totalPages > 1 && !isSearching">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{disabled: bookStore.currentPage === 1}">
          <button class="page-link" @click="changePage(bookStore.currentPage - 1)">Précédent</button>
        </li>
        <li class="page-item active">
          <span class="page-link">
            Page {{ bookStore.currentPage }} / {{ bookStore.totalPages }}
          </span>
        </li>
        <li class="page-item" :class="{disabled: bookStore.currentPage === bookStore.totalPages}">
          <button class="page-link" @click="changePage(bookStore.currentPage + 1)">Suivant</button>
        </li>
      </ul>
    </nav>
  </div>
</template>
