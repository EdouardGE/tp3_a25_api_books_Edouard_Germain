<script setup>
import { useCartStore } from '@/stores/cart'
import CartItemRow from '@/components/CartItemRow.vue'

const cartStore = useCartStore()
</script>

<template>
  <div>
    <h2>Panier</h2>

    <p v-if="cartStore.items.length === 0">Votre panier est vide.</p>

    <div v-else>
      <p><strong>Total :</strong> {{ cartStore.total }} $</p>

      <CartItemRow
        v-for="item in cartStore.items"
        :key="item.livre._id"
        :item="item"
      />
    </div>
  </div>
</template>
