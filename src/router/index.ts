import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const ActivateView = () => import('@/views/ActivateView.vue')
const ApplicantsView = () => import('@/views/ApplicantsView.vue')
const CandidatesView = () => import('@/views/CandidatesView.vue')
const DashboardView = () => import('@/views/DashboardView.vue')
const JobApplicationView = () => import('@/views/JobApplicationView.vue')
const JobsAdminView = () => import('@/views/JobsAdminView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const UsersView = () => import('@/views/UsersView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { public: true },
    },
    {
      path: '/activate',
      name: 'activate',
      component: ActivateView,
      meta: { public: true },
    },
    {
      path: '/jobs/:slug',
      name: 'job-application',
      component: JobApplicationView,
      meta: { public: true, publicShell: true },
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/candidates',
      name: 'candidates',
      component: CandidatesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/users',
      name: 'users',
      component: UsersView,
      meta: { requiresAuth: true, requiresPlatformAdmin: true },
    },
    {
      path: '/admin/jobs',
      name: 'admin-jobs',
      component: JobsAdminView,
      meta: { requiresAuth: true, requiresPlatformAdmin: true },
    },
    {
      path: '/admin/applicants',
      name: 'admin-applicants',
      component: ApplicantsView,
      meta: { requiresAuth: true, requiresPlatformAdmin: true },
    },
    {
      path: '/applicants',
      redirect: '/admin/applicants',
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.initialize()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresPlatformAdmin && !auth.isPlatformAdmin) {
    return { name: 'dashboard' }
  }

  if ((to.name === 'login' || to.name === 'activate') && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  return true
})

export default router
