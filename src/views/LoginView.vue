<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'
import logo from '@/assets/img/logo.png'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const localError = ref<string | null>(null)

async function submit() {
  localError.value = null

  try {
    await auth.login({ email: email.value, password: password.value })
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.push(redirect)
  } catch (err) {
    localError.value = err instanceof Error ? err.message : 'Authentication failed'
  }
}
</script>

<template>
  <main class="grid min-h-screen bg-paper px-5 py-8 lg:grid-cols-[1fr_1.1fr] lg:px-0 lg:py-0">
    <section class="hidden border-r border-border-soft bg-surface-muted px-10 py-12 lg:flex lg:flex-col lg:justify-between">
      <RouterLink to="/" class="flex items-center gap-3">
        <img class="h-14" :src="logo" alt="Legal Bench" />
        <span>
          <span class="block text-lg font-semibold text-ink">Legal Bench</span>
          <span class="block text-sm text-ink-muted">Evaluation workspace</span>
        </span>
      </RouterLink>

      <div class="max-w-lg">
        <p class="text-sm font-medium text-civic-700">Secure workspace</p>
        <h1 class="mt-3 text-4xl font-semibold leading-tight text-ink">Contractor evaluation for legal teams</h1>
        <p class="mt-5 text-base leading-7 text-ink-muted">
          Sign in with an account created by your platform administrator.
        </p>
      </div>

      <p class="text-sm text-ink-muted">New accounts are created from invitation links.</p>
    </section>

    <section class="mx-auto flex w-full max-w-md flex-col justify-center">
      <div class="mb-9 flex items-center gap-3 lg:hidden">
        <img class="h-12" :src="logo" alt="Legal Bench" />
        <span>
          <span class="block text-base font-semibold text-ink">Legal Bench</span>
          <span class="block text-xs text-ink-muted">Evaluation workspace</span>
        </span>
      </div>

      <div class="rounded-lg border border-border-soft bg-surface p-6 shadow-sm sm:p-8">
        <div class="mb-7">
          <p class="text-sm font-medium text-civic-700">Account access</p>
          <h1 class="mt-2 text-2xl font-semibold text-ink">Sign in</h1>
        </div>

        <Message v-if="localError || auth.error" severity="error" class="mb-5">
          {{ localError || auth.error }}
        </Message>

        <form class="flex flex-col gap-4" @submit.prevent="submit">
          <label class="flex flex-col gap-2 text-sm font-medium text-ink">
            Email
            <InputText v-model="email" autocomplete="email" type="email" />
          </label>

          <label class="flex flex-col gap-2 text-sm font-medium text-ink">
            Password
            <Password
              v-model="password"
              :feedback="false"
              autocomplete="current-password"
              input-class="w-full"
              toggle-mask
            />
          </label>

          <Button label="Sign in" :loading="auth.loading" class="mt-2" icon="pi pi-lock" type="submit" />
        </form>
      </div>
    </section>
  </main>
</template>
