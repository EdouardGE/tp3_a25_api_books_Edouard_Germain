import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

const API_URL = import.meta.env?.VITE_API_URL || "http://localhost:3000";

export const useBookStore = defineStore('books', () => {
    const authStore = useAuthStore()
    const books = ref([])
    const total = computed(() => books.value.length);

    async function fetchBooks(page = 1, limite = 4) {
        const response = await fetch(`${API_URL}/api/livres?page=${page}&limit=${limit}`);
        const result = await response.json();

        if (!response.ok) {
            throw result;
        }

        books.value = result.data;
        return result.pagination;
    }

    async function searchBooks(query) {
        if (!query || query.trim() === "") return [];

        const response = await fetch(`${API_URL}/api/livres/search?q=${encodeURIComponent(query)}`);

        const result = await response.json();

        if (!response.ok) {
            throw result;
        }

        books.value = result;
        return result;
    }

    async function addBook(book) {
        const response = await fetch(`${API_URL}/api/livres`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authStore.authHeaders
            },
            body: JSON.stringify(book)
        });

        const result = await response.json();

        if (!response.ok) {
            throw result;
        }

        books.value.push(result);
        return result;
    }

    async function updateBook(bookId, updatedData) {
        const response = await fetch(`${API_URL}/api/livres/${bookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...authStore.authHeaders
            },
            body: JSON.stringify(updatedData)
        });
        const result = await response.json();

        if (!response.ok) {
            throw result;
        }

        const index = books.value.findIndex(b => b.id === bookId);
        if (index !== -1) {
            books.value[index] = result;
        }

        return result;
    }

    async function deleteBook(bookId) {
        const response = await fetch(`${API_URL}/api/livres/${bookId}`, {
            method: 'DELETE',
            headers: {
                ...authStore.authHeaders
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw result;
        }

        books.value = books.value.filter(b => b.id !== bookId);
        return result;
    }

    return {
        books,
        fetchBooks,
        searchBooks,
        addBook,
        updateBook,
        deleteBook
    };
});