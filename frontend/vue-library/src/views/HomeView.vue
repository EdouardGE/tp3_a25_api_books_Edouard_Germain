<script setup>

import { ref, onMounted } from 'vue'
import { useBookStore } from '@/stores/books'
import BookCard from '@/components/BookCard.vue'


const bookStore = useBookStore()


const loading = ref(true)
const apiError = ref(null)

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
    if (!query.trim()) {
      apiError.value = "Veuillez entrer un titre ou un auteur.";
      loading.value = false;
      return;
    }

    await bookStore.searchBooks(query);

  } catch (error) {
    apiError.value = error?.message || "Erreur lors de la recherche.";
  } finally {
    loading.value = false;
  }
}


</script>

<template>
    <div class="book-page">
        <h1>Liste des livres</h1>
        <div class="search-bar mb-4">
            <input
                type="text"
                placeholder="Rechercher un livre par titre..."
                @input="searchBooks($event.target.value)"
                class="form-control"
            />`
        </div>

        <p v-if="loading">Chargement...</p>
        <p v-if="apiError" class="error">{{ apiError }}</p>

        <div v-if="!loading" class="books-grid d-flex flex-wrap gap-3 justify-content-center m-4">
        <BookCard
            v-for="livre in bookStore.books"
            :key="livre._id"
            :book="livre"
        />
        </div>

        <nav v-if="!loading && !apiError && bookStore.totalPages > 1">
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
