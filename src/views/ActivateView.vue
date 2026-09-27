<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Password from 'primevue/password'
import logo from '@/assets/img/logo.png'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const password = ref('')
const localError = ref<string | null>(null)
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))

async function submit() {
  localError.value = null
  if (!token.value) {
    localError.value = 'Activation token is missing'
    return
  }

  try {
    await auth.activate({ token: token.value, password: password.value })
    await router.push('/')
  } catch (err) {
    localError.value = err instanceof Error ? err.message : 'Unable to activate account'
  }
}
</script>

<template>
  <main class="grid min-h-screen place-items-center bg-paper px-5 py-8">
    <section class="w-full max-w-md rounded-lg border border-border-soft bg-surface p-6 shadow-sm sm:p-8">
      <div class="mb-7 flex items-center gap-3">
        <img class="h-12" :src="logo" alt="Legal Bench" />
        <span>
          <span class="block text-base font-semibold text-ink">Legal Bench</span>
          <span class="block text-xs text-ink-muted">Account activation</span>
        </span>
      </div>

      <Message v-if="localError || auth.error" severity="error" class="mb-5">
        {{ localError || auth.error }}
      </Message>

      <form class="flex flex-col gap-4" @submit.prevent="submit">
        <label class="flex flex-col gap-2 text-sm font-medium text-ink">
          Create password
          <Password v-model="password" autocomplete="new-password" input-class="w-full" toggle-mask />
        </label>
        <Button label="Activate account" :loading="auth.loading" icon="pi pi-check" type="submit" />
      </form>
    </section>
  </main>
</template>
