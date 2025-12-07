<script setup>

import { defineProps } from "vue"


const props = defineProps({
  book: {
    type: Object,
    required: true
  }
})
</script>

<template>
    <div class ="book-card">

        <img class="cover" :src="book.couverture || '/placeholder.png'" :alt="book.titre"/>
        <h3 class="title">{{ book.titre }}</h3>

        <p class="authors">
        <strong>Auteur(s) :</strong>
        {{ book.auteurs?.map(a => a.nom).join(", ") || "Inconnu" }}
        </p>

        <p class="price">
        <strong>Prix :</strong> {{ book.prix }} $
        </p>

        <p class="stock" :class="{ out: book.quantite <= 0 }">
        <strong>Stock :</strong>
        {{ book.quantite > 0 ? book.quantite : "Rupture de stock" }}
        </p>

    </div>
</template>

<style scoped>
.book-card {
  width: 230px;
  padding: 14px;
  border-radius: 8px;
  background: white;
  border: 1px solid #ddd;

  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cover {
  width: 100%;
  height: 280px;
  object-fit: cover;
  border-radius: 6px;
}

.title {
  font-size: 1.1rem;
  font-weight: 700;
}

.authors,
.price,
.stock {
  font-size: 0.9rem;
}

.stock.out {
  color: red;
  font-weight: bold;
}
</style>