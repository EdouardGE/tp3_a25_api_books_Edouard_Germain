import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'
import { ref, computed } from 'vue'

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("token") || null);
  const user = ref(
    localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null
  );

  const isAuthenticated = computed(() => {
    if (!token.value) return false;
    try {
        const { exp } = jwtDecode(token.value);
        return exp > Date.now() / 1000;
    } catch (error) {
        return false;
    }
  });

  const isAdmin = computed(() => {
    return user.value?.is_admin === true;
  });

  const authHeaders = computed(() => {
    return token.value
      ? { Authorization: `Bearer ${token.value}` }
      : {};
  });

  async function login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw { status: response.status, ...result };
    }

    token.value = result.token
    user.value = result.user;

    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));
  }

  async function signup(form) {
    if (form.password !== form.password_confirmation) {
      throw {
        status: 400,
        message: "Les mots de passe ne correspondent pas",
        errors: { password_confirmation: ["Les mots de passe ne correspondent pas"] }
      };
    }
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form)
    })

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw { status: response.status, ...result };
    }

    return result;
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

    return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    authHeaders,
    login,
    signup,
    logout
  };
});