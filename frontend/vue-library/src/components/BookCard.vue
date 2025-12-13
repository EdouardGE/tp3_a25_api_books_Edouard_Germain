<script setup>

import { defineProps } from "vue"
import { useBookStore } from '@/stores/books'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const props = defineProps({
  book: {
    type: Object,
    required: true
  }
})

const bookStore = useBookStore()
const cartStore = useCartStore()
const router = useRouter()

const loading = ref(true)
const saving = ref(false)
const apiError = ref(null)
const apiSuccess = ref(null)


async function addToCart() {

    apiError.value = null
    apiSuccess.value = null;
    saving.value = true;

    try {
        await cartStore.addToCart(props.book._id)

        await bookStore.fetchBooks(1, 4)

        apiSuccess.value = "Livre ajouté au panier avec succès.";
    } catch {
      router.push({ name: 'login' })

    } finally {
        saving.value = false
    }
}
</script>

<template>
    <div class ="book-card">

        <img class="cover  object-fit-fill" :src="book.couverture || '/placeholder.png'" :alt="book.titre"/>
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

        <p class="category">
        <strong>Catégorie :</strong>
        {{ book.categories?.map(c => c.nom).join(", ") || "Inconnu" }}
        </p>

        <button @click="addToCart" :disabled="book.quantite <= 0 || saving">
        {{ saving ? "Ajout au panier..." : "Ajouter au panier" }}
        </button>

        <p v-if="apiError" class="error">{{ apiError }}</p>

    </div>
</template>

<style scoped>
.book-card{
  width: 240px;
  padding: 14px;
  border-radius: 18px;
  background: rgba(255,255,255,.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(0,0,0,.06);
  box-shadow: 0 12px 30px rgba(0,0,0,.08);

  display:flex;
  flex-direction: column;
  gap: .55rem;
  transition: transform .15s ease, box-shadow .15s ease;
}

.book-card:hover{
  transform: translateY(-3px);
  box-shadow: 0 18px 45px rgba(0,0,0,.12);
}

.cover{
  width: 100%;
  height: 290px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid rgba(0,0,0,.06);
  background: rgba(17,24,39,.03);
}

.title{
  font-size: 1.05rem;
  font-weight: 900;
  color:#111827;
  line-height: 1.2;
  margin-top: .25rem;

  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.4em;
}

.authors,
.price,
.stock,
.category{
  font-size: .92rem;
  color:#374151;
  margin: 0;
}

.authors strong,
.price strong,
.stock strong,
.category strong{
  color:#111827;
  font-weight: 800;
}

.stock{
  display: inline-flex;
  align-items: center;
  gap: .45rem;
  padding: .35rem .55rem;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,.06);
  background: rgba(17,24,39,.04);
  width: fit-content;
}

.stock.out{
  background: rgba(239,68,68,.10);
  border-color: rgba(239,68,68,.25);
  color:#991b1b;
  font-weight: 900;
}

.book-card button{
  margin-top: auto;
  border: 0;
  border-radius: 14px;
  padding: .7rem .9rem;
  font-weight: 900;
  color: #fff;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  box-shadow: 0 14px 28px rgba(37,99,235,.22);
  transition: transform .12s ease, box-shadow .12s ease, filter .12s ease;
}

.book-card button:hover{
  transform: translateY(-1px);
  filter: brightness(1.02);
  box-shadow: 0 18px 35px rgba(37,99,235,.26);
}

.book-card button:disabled{
  opacity: .65;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  filter: none;
}

.error{
  margin: .35rem 0 0;
  padding: .6rem .75rem;
  border-radius: 12px;
  background: rgba(239,68,68,.10);
  border: 1px solid rgba(239,68,68,.25);
  color:#991b1b;
  font-weight: 700;
}
</style>