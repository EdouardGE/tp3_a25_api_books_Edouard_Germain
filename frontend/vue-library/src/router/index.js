import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import SignupView from '@/views/SignupView.vue'
import ProfileView from '@/views/ProfileView.vue'
import BookCreateView from '@/views/BookCreateView.vue'
import ForbiddenView from '@/views/ForbiddenView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import CartView from '@/views/CartView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    },
    {
      path: '/panier',
      name: 'panier',
      component: CartView,
      meta: { requiresAuth: true }
    },
    {
      path: '/livres/nouveau',
      name: 'nouveau',
      component: BookCreateView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },

    { path: '/forbidden', name: 'forbidden', component: ForbiddenView },

    { path: '/:pathMatch(.*)*', name: 'notfound', component: NotFoundView },

  ],
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'login' })
  }


  if (to.meta.requiresAdmin && !auth.isAdmin) {
    auth.logout()
    return next({ name: 'login' })
  }


  next()
})

export default router
