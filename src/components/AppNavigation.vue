<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const saving = ref(false)
const apiError = ref(null)

const menuOpen = ref(false)

/* Déconnecte l’utilisateur et redirige vers la page de connexion */
function logout() {
  apiError.value = null
  saving.value = true;
  try {
    auth.logout()
    router.push({ name: 'login' })
  } catch (error) {
    apiError.value = error?.message || "Erreur lors de la déconnexion.";
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <nav class="app-nav d-flex align-items-center justify-content-between">
  <div class="d-flex align-items-center">
    <RouterLink to="/" class="brand-link me-4">
      LibrairieQC
    </RouterLink>
  </div>

    <div class="d-flex align-items-center nav-links desktop">
      <RouterLink to="/" class="nav-link me-2">Accueil</RouterLink>
      <RouterLink :to="{ name: 'about' }" class="nav-link me-2">À propos</RouterLink>

      <template v-if="!auth.isAuthenticated">
        <RouterLink :to="{ name: 'login' }" class="nav-link me-2">Connexion</RouterLink>
        <RouterLink :to="{ name: 'signup' }" class="nav-link">Inscription</RouterLink>
      </template>

      <template v-if="auth.isAdmin">
        <RouterLink :to="{ name: 'nouveau' }" class="nav-link me-2">Ajouter un livre</RouterLink>
      </template>

      <template v-if="auth.isAuthenticated">
        <RouterLink :to="{ name: 'panier' }" class="nav-link me-2">Panier</RouterLink>
        <RouterLink :to="{ name: 'profile' }" class="nav-link me-2">Profil</RouterLink>

        <button class="btn btn-sm btn-outline-danger ms-3 logout-btn" @click="logout" :disabled="saving">
          {{ saving ? "Déconnexion..." : "Déconnexion" }}
        </button>
      </template>
    </div>
    <button class="burger mobile" @click="menuOpen = !menuOpen" aria-label="Menu">☰</button>

  </nav>

  <div v-if="menuOpen" class="snack-backdrop" @click="menuOpen=false"></div>

  <div class="snack" :class="{ open: menuOpen }">
    <RouterLink to="/" class="snack-link" @click="menuOpen=false">Accueil</RouterLink>
    <RouterLink :to="{ name: 'about' }" class="snack-link" @click="menuOpen=false">À propos</RouterLink>

    <RouterLink v-if="!auth.isAuthenticated" :to="{ name: 'login' }" class="snack-link" @click="menuOpen=false">Connexion</RouterLink>
    <RouterLink v-if="!auth.isAuthenticated" :to="{ name: 'signup' }" class="snack-link" @click="menuOpen=false">Inscription</RouterLink>

    <RouterLink v-if="auth.isAdmin" :to="{ name: 'nouveau' }" class="snack-link" @click="menuOpen=false">Ajouter un livre</RouterLink>

    <RouterLink v-if="auth.isAuthenticated" :to="{ name: 'panier' }" class="snack-link" @click="menuOpen=false">Panier</RouterLink>
    <RouterLink v-if="auth.isAuthenticated" :to="{ name: 'profile' }" class="snack-link" @click="menuOpen=false">Profil</RouterLink>

    <button v-if="auth.isAuthenticated" class="snack-danger" @click="logout" :disabled="saving">
      {{ saving ? "Déconnexion..." : "Déconnexion" }}
    </button>
  </div>
</template>

<style scoped>
.desktop{ display:flex; gap:.5rem; }
.mobile{ display:none; }
.brand-link{
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: .2px;
  color: #111827;
  text-decoration: none;
  padding: .45rem .7rem;
  border-radius: 12px;
  transition: background .15s ease, transform .15s ease;
  display: inline-flex;
  align-items: center;
}
.app-nav{
  position: sticky;
  top: 0;
  z-index: 1030;
  padding: .9rem 1.2rem;
  border-radius: 16px;
  margin: 1rem 0;
  background: rgba(255,255,255,.75);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(0,0,0,.06);
  box-shadow: 0 10px 30px rgba(0,0,0,.08);
}

.brand{
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: .2px;
  color: #111827;
}

.nav-links{
  gap: .25rem;
}

.nav-link{
  text-decoration: none;
  color: #374151;
  font-weight: 600;
  padding: .55rem .8rem;
  border-radius: 12px;
  transition: background .15s ease, color .15s ease, transform .15s ease;
  display: inline-flex;
  align-items: center;
  line-height: 1;
}

.nav-link:hover{
  background: rgba(17,24,39,.06);
  color: #111827;
  transform: translateY(-1px);
}

.nav-link.router-link-active,
.nav-link.router-link-exact-active{
  background: rgba(59,130,246,.12);
  color: #1d4ed8;
  box-shadow: inset 0 0 0 1px rgba(29,78,216,.18);
}

.logout-btn{
  border-radius: 12px;
  padding: .45rem .75rem;
}
.logout-btn:disabled{
  opacity: .7;
  cursor: not-allowed;
}

.burger{
  border: 1px solid rgba(0,0,0,.15);
  background: #fff;
  border-radius: 10px;
  padding: .35rem .6rem;
  font-weight: 900;
}

.snack-backdrop{
  position: fixed; inset: 0;
  background: rgba(0,0,0,.25);
  z-index: 2000;
}

.snack{
  position: fixed;
  left: 12px; right: 12px; bottom: 12px;
  z-index: 2001;
  background: #fff;
  border: 1px solid rgba(0,0,0,.12);
  border-radius: 14px;
  padding: .6rem;
  box-shadow: 0 18px 45px rgba(0,0,0,.20);

  display: none;
  gap: .4rem;
}

.snack.open{ display: grid; }

.snack-link{
  text-decoration: none;
  color: #111827;
  font-weight: 700;
  padding: .65rem .8rem;
  border-radius: 12px;
  background: rgba(0,0,0,.04);
}

.snack-danger{
  border: 1px solid rgba(239,68,68,.35);
  background: rgba(239,68,68,.10);
  color: #991b1b;
  font-weight: 900;
  padding: .65rem .8rem;
  border-radius: 12px;
}

@media (max-width: 576px){
  .nav-links.desktop{ display: none !important; }
  .mobile{ display: inline-flex !important; }
}
@media (min-width: 577px){
  .mobile{ display: none !important; }
}
</style>


