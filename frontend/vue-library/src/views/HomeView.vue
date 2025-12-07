<script setup>

import { ref, onMounted } from 'vue'
import { useBookStore } from '@/stores/books'
import BookCard from '@/components/BookCard.vue'


const bookStore = useBookStore()


const loading = ref(true)
const apiError = ref(null)

onMounted(async function () {
  try {
    await bookStore.fetchBooks(1, 4)
  } catch (error) {
    apiError.value = error?.message || "Impossible de charger les livres.";
  } finally {
    loading.value = false
  }
})

</script>

<template>
    <div class="book-page">
        <h1>Liste des livres</h1>

        <p v-if="loading">Chargement...</p>
        <p v-if="apiError" class="error">{{ apiError }}</p>

        <div v-if="!loading" class="books-grid">
        <BookCard
            v-for="livre in bookStore.books"
            :key="livre._id"
            :book="livre"
        />
        </div>


    </div>

</template>
