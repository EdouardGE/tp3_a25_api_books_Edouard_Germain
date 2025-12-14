import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const useCartStore = defineStore('cart', () => {
    const authStore = useAuthStore()
    const cartItems = ref(null)

    const items = computed(() => cartItems.value?.items ?? []);
    const total = computed(() => cartItems.value?.total ?? 0);

    const totalQuantity = computed(() =>
        items.value.reduce((sum, item) => sum + item.quantite, 0)
    );


    // Récupère le panier de l'utilisateur connecté
    async function fetchCart() {
        const response = await fetch(`${API_URL}/api/panier`, {
            headers: {
                ...authStore.authHeaders
            }
        });

        const result = await response.json();
        if (!response.ok) {
        throw { status: response.status, ...result };
        }

        cartItems.value = result;
        return result;
    }

    // Met à jour la quantité d'un livre dans le panier
    async function updateCartItem(livreId, quantite) {
        const response = await fetch(`${API_URL}/api/panier`, {
            method: 'POST',
            headers: {
                ...authStore.authHeaders,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ livreId, quantite  })
        });

        const result = await response.json();

        if (!response.ok) {
        throw { status: response.status, ...result };
        }

        cartItems.value = result;
        return result;
    }

    // Ajoute un livre au panier ou augmente sa quantité
    async function addToCart(livreId) {
        const existing = items.value.find(i => i.livre._id === livreId);
        const nextQty = existing ? existing.quantite + 1 : 1;
        return updateCartItem(livreId, nextQty);
    }

    // Supprime un livre du panier
    async function removeCartItem(livreId) {
        const response = await fetch(`${API_URL}/api/panier/items/${livreId}`, {
            method: 'DELETE',
            headers: {
                ...authStore.authHeaders
            }
        });

        const result = await response.json();

        if (!response.ok) {
        throw { status: response.status, ...result };
        }

        cartItems.value = result;
        return result;
    }

    // Vide complètement le panier
    async function clearCart() {
        const response = await fetch(`${API_URL}/api/panier`, {
            method: 'DELETE',
            headers: {
                ...authStore.authHeaders
            }
        });

        const result = await response.json();

        if (!response.ok) {
        throw { status: response.status, ...result };
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