<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'
import logo from '@/assets/img/legal-roster.png'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const isPublicShellRoute = computed(() => Boolean(route.meta.publicShell))
const isAuthRoute = computed(() => route.name === 'login' || route.name === 'activate')

const navigationItems = computed<MenuItem[]>(() => [
  {
    label: 'Dashboard',
    icon: 'pi pi-chart-line',
    route: '/',
    active: route.name === 'dashboard',
  },
  {
    label: 'Candidates',
    icon: 'pi pi-users',
    route: '/candidates',
    active: route.name === 'candidates',
  },
])

const adminItems = computed<MenuItem[]>(() => [
  {
    label: 'Applicants',
    icon: 'pi pi-id-card',
    route: '/admin/applicants',
    active: route.name === 'admin-applicants',
  },
  {
    label: 'Jobs',
    icon: 'pi pi-briefcase',
    route: '/admin/jobs',
    active: route.name === 'admin-jobs',
  },
  {
    label: 'Users',
    icon: 'pi pi-users',
    route: '/users',
    active: route.name === 'users',
  },
])

async function signOut() {
  await auth.logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <RouterView v-if="isAuthRoute || isPublicShellRoute" />

  <div v-else class="min-h-screen text-ink lg:grid lg:grid-cols-[14rem_1fr]">
    <aside
      class="border-border-soft/80 bg-surface/90 px-5 py-5 shadow-sm backdrop-blur lg:min-h-screen lg:border-r"
    >
      <div class="flex items-center justify-between gap-4">
        <RouterLink to="/" class="flex min-w-0 items-center">
          <img class="h-12" :src="logo" alt="Legal Bench" />
          <span class="min-w-0">
            <span class="block truncate text-base font-semibold text-ink">Legal Roster</span>
            <span class="block truncate text-xs text-ink-muted">Evaluation workspace</span>
          </span>
        </RouterLink>
      </div>

      <Menu
        :model="navigationItems"
        class="mt-6 w-full min-w-fit! border-0 border-transparent! bg-transparent p-0"
      >
        <template #item="{ item, props }">
          <RouterLink v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
            <a
              v-bind="props.action"
              :href="href"
              class="mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
              :class="
                item.active
                  ? 'bg-civic-50 text-civic-800 ring-1 ring-civic-100'
                  : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
              "
              @click="navigate"
            >
              <i :class="[item.icon, 'text-sm']" />
              <span>{{ item.label }}</span>
            </a>
          </RouterLink>
        </template>
      </Menu>

      <div v-if="auth.isPlatformAdmin" class="mt-6 border-t border-border-soft pt-5">
        <p class="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Admin Management
        </p>
        <Menu
          :model="adminItems"
          class="w-full min-w-fit! border-transparent! border-0 bg-transparent p-0"
        >
          <template #item="{ item, props }">
            <RouterLink v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
              <a
                v-bind="props.action"
                :href="href"
                class="mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
                :class="
                  item.active
                    ? 'bg-civic-50 text-civic-800 ring-1 ring-civic-100'
                    : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
                "
                @click="navigate"
              >
                <i :class="[item.icon, 'text-sm']" />
                <span>{{ item.label }}</span>
              </a>
            </RouterLink>
          </template>
        </Menu>
      </div>

      <div class="mt-8 border-t border-border-soft pt-5">
        <div v-if="auth.user" class="mb-4 min-w-0">
          <p class="truncate text-sm font-medium text-ink">{{ auth.user.name }}</p>
          <p class="truncate text-xs text-ink-muted">{{ auth.user.email }}</p>
        </div>
        <Button
          label="Sign out"
          icon="pi pi-sign-out"
          severity="secondary"
          outlined
          class="w-full"
          @click="signOut"
        />
      </div>
    </aside>

    <main class="min-w-0 px-6 py-8 sm:px-8 lg:px-10">
      <div class="mx-auto max-w-6xl">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style scoped></style>
