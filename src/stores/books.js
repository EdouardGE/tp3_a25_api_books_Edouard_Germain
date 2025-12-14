import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const useBookStore = defineStore('books', () => {
    const authStore = useAuthStore()

    const books = ref([])
    const pagination = ref({
        page: 1,
        limit: 4,
        totalPages: 1,
        totalItems: 0
    });

    const total = computed(() => pagination.value.totalItems);
    const currentPage = computed(() => pagination.value.page);
    const totalPages = computed(() => pagination.value.totalPages);
    const pageSize = computed(() => pagination.value.limit);

    // Récupère la liste des livres avec pagination
    async function fetchBooks(page = 1, limit = 4) {
        const response = await fetch(`${API_URL}/api/livres?page=${page}&limit=${limit}`);
        const result = await response.json();

        if (!response.ok) {
        throw { status: response.status, ...result };
        }
        books.value = result.data;
        pagination.value = result.pagination;

        return result;
    }

    // Recherche des livres par mot-clé
    async function searchBooks(query) {
        const q = query.trim();

        if (!q) {
            books.value = [];
            return [];
        }

        const response = await fetch(`${API_URL}/api/livres/search?q=${encodeURIComponent(q)}`);
        const result = await response.json();

        if (!response.ok) throw { status: response.status, ...result };

        books.value = result;
        return result;
    }

    // Récupère un livre à partir de son identifiant
    async function getBookById(id) {
        const response = await fetch(`${API_URL}/api/livres/${id}`);
        const result = await response.json();

        if (!response.ok) {
            throw { status: response.status, ...result };
        }

        return result;
    }

    // Ajoute un nouveau livre (route protégée)
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
        throw { status: response.status, ...result };
        }

        books.value.push(result);
        return result;
    }

    // Met à jour un livre existant (route protégée)
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
        throw { status: response.status, ...result };
        }

        const index = books.value.findIndex(b => b.id === bookId);
        if (index !== -1) {
            books.value[index] = result;
        }

        return result;
    }

    // Supprime un livre (route protégée)
    async function deleteBook(bookId) {
        const response = await fetch(`${API_URL}/api/livres/${bookId}`, {
            method: 'DELETE',
            headers: {
                ...authStore.authHeaders
            }
        });

        const result = await response.json();

        if (!response.ok) {
        throw { status: response.status, ...result };
        }

        books.value = books.value.filter(b => b.id !== bookId);
        return result;
    }

    return {
        books,
        total,
        pagination,
        currentPage,
        totalPages,
        pageSize,
        fetchBooks,
        searchBooks,
        getBookById,
        addBook,
        updateBook,
        deleteBook
    };
});