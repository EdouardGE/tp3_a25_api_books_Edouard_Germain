<script setup>

import { defineProps, ref, computed } from "vue"
import { useCartStore } from "@/stores/cart";

const { item } = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const cartStore = useCartStore();

const saving = ref(false)
const apiError = ref(null)

const mainAuthor = computed(() => item?.livre?.auteurs?.[0]?.nom ?? "Inconnu")
const subtotal = computed(() => (item.livre.prix * item.quantite).toFixed(2))

const canIncrease = computed(() => !saving.value && (item?.livre?.quantite ?? 0) > 0)
const canDecrease = computed(() => !saving.value)


function setError(err) {
  apiError.value =
    err?.message ||
    err?.errors?.quantite?.[0] ||
    err?.errors?.livreId?.[0] ||
    "Erreur (stock insuffisant ou requête invalide)."
}


async function increase() {
  apiError.value = null
  if (!canIncrease.value) return

  saving.value = true
  try {
    await cartStore.updateCartItem(item.livre._id, item.quantite + 1)
  } catch (err) {
    setError(err)
  } finally {
    saving.value = false
  }
}

async function decrease() {
  apiError.value = null
  if (!canDecrease.value) return

  saving.value = true
  try {
    if (item.quantite > 1) {
      await cartStore.updateCartItem(item.livre._id, item.quantite - 1)
    } else {
      await cartStore.removeCartItem(item.livre._id)
    }
  } catch (err) {
    setError(err)
  } finally {
    saving.value = false
  }
}

async function remove() {
  apiError.value = null
  saving.value = true
  try {
    await cartStore.removeCartItem(item.livre._id)
  } catch (err) {
    setError(err)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="cart-row">
    <div class="info">
      <strong class="title">{{ item.livre.titre }}</strong>
      <div class="meta">
        <span class="author">Auteur : <b>{{ mainAuthor }}</b></span>
        <span class="unit">Prix : <b>{{ item.livre.prix }} $</b></span>
        <span class="stock" :class="{ out: item.livre.quantite <= 0 }">
          Stock restant : <b>{{ item.livre.quantite > 0 ? item.livre.quantite : "Rupture" }}</b>
        </span>
      </div>
    </div>

    <div class="qte">
      <button class="qbtn" @click="decrease" :disabled="!canDecrease" aria-label="Diminuer">−</button>
      <span class="qnum">{{ item.quantite }}</span>
      <button class="qbtn" @click="increase" :disabled="!canIncrease" aria-label="Augmenter">+</button>
    </div>

    <div class="total">
      {{ subtotal }} $
      <button class="rm" @click="remove" :disabled="saving">Retirer</button>
    </div>

    <p v-if="apiError" class="row-error">{{ apiError }}</p>
  </div>
</template>

<style scoped>
.cart-row{
  display:flex;
  align-items:center;
  gap: 1rem;
  padding: .9rem 1rem;
  border: 1px solid rgba(0,0,0,.06);
  border-radius: 14px;
  background: rgba(255,255,255,.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 10px 25px rgba(0,0,0,.06);
  margin-bottom: .75rem;
  flex-wrap: wrap;
}

.info{ flex: 1 1 360px; min-width: 0; }

.title{
  display:block;
  font-weight: 900;
  color:#111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta{
  margin-top: .35rem;
  display:flex;
  flex-wrap: wrap;
  gap: .6rem 1rem;
  color:#6b7280;
  font-size: .92rem;
}
.meta b{ color:#111827; font-weight: 800; }

.stock.out{ color:#991b1b; font-weight: 900; }

.qte{
  display:flex;
  align-items:center;
  gap: .5rem;
  padding: .35rem .5rem;
  border-radius: 999px;
  background: rgba(17,24,39,.04);
  border: 1px solid rgba(0,0,0,.06);
}

.qbtn{
  width: 34px; height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,.10);
  background: #fff;
  color:#111827;
  font-weight: 900;
  cursor: pointer;

  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.qbtn:disabled{ opacity:.55; cursor:not-allowed; }

.qnum{
  min-width: 26px;
  text-align:center;
  align-items: center;
  font-weight: 900;
  color:#111827;
  margin-bottom: 10px;
}

.total{
  width: 160px;
  text-align:right;
  font-weight: 950;
  color:#111827;
  display:flex;
  flex-direction: column;
  align-items: flex-end;
  gap: .35rem;
}

.rm{
  border: 1px solid rgba(239,68,68,.30);
  background: rgba(239,68,68,.10);
  color:#991b1b;
  font-weight: 900;
  padding: .35rem .6rem;
  border-radius: 12px;
  cursor: pointer;
}
.rm:disabled{ opacity:.6; cursor:not-allowed; }

.row-error{
  width: 100%;
  margin: .25rem 0 0;
  padding: .65rem .8rem;
  border-radius: 12px;
  background: rgba(239,68,68,.10);
  border: 1px solid rgba(239,68,68,.25);
  color:#991b1b;
  font-weight: 850;
}
</style>