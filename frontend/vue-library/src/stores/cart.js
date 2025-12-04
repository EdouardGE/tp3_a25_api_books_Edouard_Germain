import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:3000";

export const useCartStore = defineStore('cart', () => {
    const authStore = useAuthStore()
    const cartItems = ref(null)

    const items = computed(() => cartItems.value?.items ?? []);
    const total = computed(() => cartItems.value?.total ?? 0);

    const totalQuantity = computed(() =>
        items.value.reduce((sum, item) => sum + item.quantite, 0)
    );

    async function fetchCart() {
        const response = await fetch(`${API_URL}/api/panier`, {
            headers: {
                ...authStore.authHeaders
            }
        });

        const result = await response.json();
        if (!response.ok) {
            throw result;
        }

        cartItems.value = result;
        return result;
    }

    async function updateCartItem(livreId, quantite) {
        const response = await fetch(`${API_URL}/api/panier`, {
            method: 'PUT',
            headers: {
                ...authStore.authHeaders,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ livreId, quantite  })
        });

        const result = await response.json();

        if (!response.ok) {
            throw result;
        }


        cartItems.value = result;
        return result;
    }


    async function addToCart(livreId) {
        const existing = items.value.find(i => i.livre._id === livreId);
        const nextQty = existing ? existing.quantite + 1 : 1;
        return updateCartItem(livreId, nextQty);
    }

    async function removeCartItem(livreId) {
        const response = await fetch(`${API_URL}/api/panier/items/${livreId}`, {
            method: 'DELETE',
            headers: {
                ...authStore.authHeaders
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw result;
        }

        cartItems.value = result;
        return result;
    }


    async function clearCart() {
        const response = await fetch(`${API_URL}/api/panier`, {
            method: 'DELETE',
            headers: {
                ...authStore.authHeaders
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw result;
        }

        cartItems.value = result;
        return result;
    }
    return {
        items,
        total,
        totalQuantity,
        fetchCart,
        updateCartItem,
        addToCart,
        removeCartItem,
        clearCart
    }
})