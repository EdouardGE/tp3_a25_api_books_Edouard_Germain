<script setup>
import { useCartStore } from '@/stores/cart'
import CartItemRow from '@/components/CartItemRow.vue'
import { ref, onMounted } from 'vue'


const cartStore = useCartStore()

const clearing = ref(false)
const apiError = ref(null)

function handleHttpError(err, fallback = "Erreur.") {
  const status = err?.status

  if (status === 401) {
    auth.logout()
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

  apiError.value = err?.message || fallback
  return false
}

onMounted(async () => {
  apiError.value = null
  try {
    await cartStore.fetchCart()
  } catch (err) {
    handleHttpError(err, "Impossible de charger le panier.")
  }
})

async function clearAll() {
  apiError.value = null
  const ok = confirm("Vider complètement le panier ?")
  if (!ok) return

  clearing.value = true
  try {
    await cartStore.clearCart()
  } catch (e) {
    handleHttpError(err, "Erreur lors du vidage du panier.")  }
  finally {
    clearing.value = false
  }
}
</script>

<template>
  <div class="cart-page">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h2 class="m-0">Panier</h2>

      <button
        v-if="cartStore.items.length"
        class="btn btn-sm btn-outline-danger"
        @click="clearAll"
        :disabled="clearing"
      >
        {{ clearing ? "Vidage..." : "Vider le panier" }}
      </button>
    </div>

    <p v-if="apiError" class="cart-alert error">{{ apiError }}</p>

    <p v-if="cartStore.items.length === 0" class="muted">Votre panier est vide.</p>

    <div v-else>
      <div class="cart-summary mb-3">
        <div><strong>Total :</strong> {{ cartStore.total }} $</div>
        <div class="muted">{{ cartStore.totalQuantity }} article(s)</div>
      </div>

      <CartItemRow
        v-for="item in cartStore.items"
        :key="item.livre._id"
        :item="item"
      />
    </div>
  </div>
</template>

<style scoped>
.cart-page{
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.cart-summary{
  display:flex;
  align-items: baseline;
  justify-content: space-between;
  padding: .85rem 1rem;
  border-radius: 14px;
  border: 1px solid rgba(0,0,0,.06);
  background: rgba(255,255,255,.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 10px 25px rgba(0,0,0,.06);
}

.muted{ color:#6b7280; }

.cart-alert{
  padding: .75rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,.06);
  margin: .75rem 0;
}
.cart-alert.error{
  background: rgba(239,68,68,.10);
  color: #991b1b;
  border-color: rgba(239,68,68,.25);
}
</style>
