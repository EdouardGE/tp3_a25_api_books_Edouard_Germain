<script setup>

import { defineProps } from "vue";
import { useCartStore } from "@/stores/cart";



const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const cartStore = useCartStore();

async function increase() {
    await cartStore.updateCartItem(props.item.livre._id, props.item.quantite + 1);
}

async function decrease() {
  if (props.item.quantite > 1) {
    await cartStore.updateCartItem(props.item.livre._id, props.item.quantite - 1);
  } else {
    await cartStore.removeCartItem(props.item.livre._id);
  }
}
</script>


<template>
  <div class="cart-row">
    <div class="info">
      <strong>{{ item.livre.titre }}</strong>
      <p>Prix : {{ item.livre.prix }} $</p>
    </div>

    <div class="qte">
      <button @click="decrease">-</button>
      <span>{{ item.quantite }}</span>
      <button @click="increase">+</button>
    </div>

    <div class="total">
      {{ (item.livre.prix * item.quantite).toFixed(2) }} $
    </div>
  </div>
</template>



<style scoped>
.cart-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
}

.info {
  flex: 1;
}

.qty {
  width: 60px;
  text-align: center;
}

.total {
  width: 80px;
  text-align: right;
  font-weight: bold;
}
</style>