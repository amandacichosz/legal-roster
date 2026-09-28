<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import * as usersApi from '@/api/users'
import { useAuthStore } from '@/stores/auth'
import type { CurrentUser, UserRole } from '@/api/auth'

const auth = useAuthStore()
const users = ref<CurrentUser[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const search = ref('')
const editingUser = ref<CurrentUser | null>(null)
const selectedRole = ref<UserRole>('admin')

const roles: { label: string; value: UserRole }[] = [
  { label: 'Platform admin', value: 'platform_admin' },
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
]

const filteredUsers = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return users.value

  return users.value.filter((user) =>
    [user.name, user.email, user.role, user.status].some((value) =>
      value.toLowerCase().includes(term),
    ),
  )
})

const editDialogVisible = computed({
  get: () => editingUser.value !== null,
  set: (visible: boolean) => {
    if (!visible) editingUser.value = null
  },
})

async function loadUsers() {
  loading.value = true
  error.value = null
  try {
    users.value = await usersApi.listUsers()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load users'
  } finally {
    loading.value = false
  }
}

function openRoleEditor(user: CurrentUser) {
  editingUser.value = user
  selectedRole.value = user.role
}

async function saveRole() {
  if (!editingUser.value) return

  saving.value = true
  error.value = null
  try {
    const updated = await usersApi.updateUserRole(editingUser.value.id, selectedRole.value)
    users.value = users.value.map((item) => (item.id === updated.id ? updated : item))
    editingUser.value = null
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to update role'
  } finally {
    saving.value = false
  }
}

async function toggleUserStatus(user: CurrentUser) {
  if (user.id === auth.user?.id) return

  error.value = null
  try {
    const nextStatus = user.status === 'active' ? 'disabled' : 'active'
    const updated = await usersApi.updateUserStatus(user.id, nextStatus)
    users.value = users.value.map((item) => (item.id === updated.id ? updated : item))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to disable user'
  }
}

onMounted(loadUsers)
</script>

<template>
  <section class="flex flex-col gap-6">
    <header
      class="flex flex-col gap-4 border-b border-border-soft/80 pb-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p class="text-sm font-medium text-civic-700">Admin Management</p>
        <h1 class="mt-1 text-2xl font-semibold text-ink">Users</h1>
      </div>
    </header>

    <Message v-if="error" severity="error">{{ error }}</Message>

    <section class="overflow-hidden rounded-lg border border-border-soft bg-surface shadow-sm">
      <div
        class="flex flex-col gap-3 border-b border-border-soft bg-surface-muted px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="relative w-full sm:max-w-sm">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted" />
          <InputText v-model="search" class="w-full pl-9!" placeholder="Search users" />
        </div>
        <p class="text-sm text-ink-muted">
          Create identities in Supabase Auth, then assign their role here.
        </p>
      </div>

      <div
        class="grid grid-cols-[1fr_1.2fr_8rem_13rem] gap-4 border-b border-border-soft bg-surface-muted px-4 py-3 text-xs font-semibold uppercase text-ink-muted"
      >
        <span>Name</span>
        <span>Email</span>
        <span>Status</span>
        <span class="text-right">Actions</span>
      </div>

      <div v-if="loading" class="px-4 py-8 text-sm text-ink-muted">Loading users...</div>
      <div v-else-if="filteredUsers.length === 0" class="px-4 py-8 text-sm text-ink-muted">
        No users found.
      </div>

      <div
        v-for="user in filteredUsers"
        v-else
        :key="user.id"
        class="grid grid-cols-[1fr_1.2fr_8rem_13rem] items-center gap-4 border-b border-border-soft px-4 py-3 last:border-b-0"
      >
        <p class="truncate text-sm font-medium text-ink">{{ user.name }}</p>
        <p class="truncate text-sm text-ink-muted">{{ user.email }}</p>
        <Tag
          :value="user.status"
          :severity="user.status === 'active' ? 'success' : 'warn'"
          class="w-fit"
        />
        <div class="flex justify-end gap-2">
          <Button
            label="Edit"
            icon="pi pi-pencil"
            size="small"
            outlined
            @click="openRoleEditor(user)"
          />
          <Button
            :label="user.status === 'active' ? 'Disable' : 'Enable'"
            :icon="user.status === 'active' ? 'pi pi-ban' : 'pi pi-check-circle'"
            size="small"
            :severity="user.status === 'active' ? 'danger' : 'success'"
            outlined
            :disabled="user.id === auth.user?.id"
            @click="toggleUserStatus(user)"
          />
        </div>
      </div>
    </section>

    <Dialog
      v-model:visible="editDialogVisible"
      modal
      header="Edit user role"
      :style="{ width: '28rem' }"
    >
      <div v-if="editingUser" class="flex flex-col gap-5">
        <div>
          <p class="text-sm font-medium text-ink">{{ editingUser.name }}</p>
          <p class="text-sm text-ink-muted">{{ editingUser.email }}</p>
        </div>
        <label class="flex flex-col gap-2 text-sm font-medium text-ink">
          Role
          <Select
            v-model="selectedRole"
            :options="roles"
            option-label="label"
            option-value="value"
          />
        </label>
        <div class="flex justify-end gap-2">
          <Button label="Cancel" severity="secondary" text @click="editingUser = null" />
          <Button label="Save" icon="pi pi-check" :loading="saving" @click="saveRole" />
        </div>
      </div>
    </Dialog>
  </section>
</template>
