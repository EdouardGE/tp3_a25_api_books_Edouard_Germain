import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const useUserStore = defineStore('user', () => {
  const authStore = useAuthStore()
  const users = ref([])

  async function fetchProfile() {
    const response = await fetch(`${API_URL}/api/users/profile`, {
      headers: {
        ...authStore.authHeaders
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw result;
    }

    return result;
  }

  async function fetchUsers() {
    const response = await fetch(`${API_URL}/api/users`, {
      headers: {
        ...authStore.authHeaders
     }
        });
        const result = await response.json();

        if (!response.ok) {
            throw result;
        }

        users.value = result;
        return result;
    }

  async function updateUser(userId, updatedData) {
      const endpoint = userId ? `${API_URL}/api/users/${userId}` : `${API_URL}/api/users/profile`
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
            ...authStore.authHeaders
        },
        body: JSON.stringify(updatedData)
      })

      const result = await response.json();

      if (!response.ok) {
        throw result;
      }

      if (userId) {
        const index = users.value.findIndex(u => u._id === userId)
        if (index !== -1) users.value[index] = result
      }
      return result
    }

  async function deleteUser(userId = null) {
        const endpoint = userId ? `${API_URL}/api/users/${userId}` : `${API_URL}/api/users/profile`
        const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: {
                ...authStore.authHeaders
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw result;
        }

        if (userId) {
          users.value = users.value.filter(u => u._id !== userId);
        }
        return result;
    }

    return {
        users,
        fetchProfile,
        fetchUsers,
        updateUser,
        deleteUser
    }
})
