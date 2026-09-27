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
const invitationLink = ref<string | null>(null)
const inviteError = ref<string | null>(null)
const search = ref('')
const editingUser = ref<CurrentUser | null>(null)
const selectedRole = ref<UserRole>('contractor')
const inviteDialogVisible = ref(false)

const inviteEmail = ref('')
const inviteName = ref('')
const inviteRole = ref<UserRole>('contractor')

const roles: { label: string; value: UserRole }[] = [
  { label: 'Platform admin', value: 'platform_admin' },
  { label: 'Admin', value: 'admin' },
  { label: 'Law firm user', value: 'law_firm_user' },
  { label: 'Contractor', value: 'contractor' },
  { label: 'Reviewer', value: 'reviewer' },
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

function openInviteDialog() {
  inviteDialogVisible.value = true
  invitationLink.value = null
  inviteError.value = null
}

function resetInviteForm() {
  inviteEmail.value = ''
  inviteName.value = ''
  inviteRole.value = 'contractor'
  inviteError.value = null
}

async function inviteUser() {
  inviteError.value = null
  invitationLink.value = null

  const email = inviteEmail.value.trim().toLowerCase()
  const existingUser = users.value.find((user) => user.email.toLowerCase() === email)
  if (existingUser) {
    inviteError.value = 'A user with that email already exists.'
    return
  }

  saving.value = true
  try {
    const invitation = await usersApi.inviteUser({
      email,
      name: inviteName.value,
      role: inviteRole.value,
    })
    invitationLink.value = invitation.activation_url
    resetInviteForm()
  } catch (err) {
    inviteError.value = err instanceof Error ? err.message : 'Unable to invite user'
  } finally {
    saving.value = false
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

async function disableUser(user: CurrentUser) {
  if (user.id === auth.user?.id || user.status === 'disabled') return

  error.value = null
  try {
    const updated = await usersApi.disableUser(user.id)
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
        <Button label="Add user" icon="pi pi-user-plus" @click="openInviteDialog" />
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
            label="Disable"
            icon="pi pi-ban"
            size="small"
            severity="danger"
            outlined
            :disabled="user.id === auth.user?.id || user.status === 'disabled'"
            @click="disableUser(user)"
          />
        </div>
      </div>
    </section>

    <Dialog
      v-model:visible="inviteDialogVisible"
      modal
      header="Add user"
      :style="{ width: '28rem' }"
      @hide="resetInviteForm"
    >
      <div class="flex flex-col gap-5">
        <Message v-if="inviteError" severity="error">{{ inviteError }}</Message>
        <Message v-if="invitationLink" severity="success">
          Invitation created. Activation link: {{ invitationLink }}
        </Message>

        <form class="flex flex-col gap-4" @submit.prevent="inviteUser">
          <label class="flex flex-col gap-2 text-sm font-medium text-ink">
            Name
            <InputText v-model="inviteName" autocomplete="off" />
          </label>
          <label class="flex flex-col gap-2 text-sm font-medium text-ink">
            Email
            <InputText v-model="inviteEmail" autocomplete="off" type="email" />
          </label>
          <label class="flex flex-col gap-2 text-sm font-medium text-ink">
            Role
            <Select
              v-model="inviteRole"
              :options="roles"
              option-label="label"
              option-value="value"
            />
          </label>
          <div class="flex justify-end gap-2 pt-2">
            <Button
              label="Cancel"
              severity="secondary"
              text
              type="button"
              @click="inviteDialogVisible = false"
            />
            <Button label="Send invite" icon="pi pi-send" :loading="saving" type="submit" />
          </div>
        </form>
      </div>
    </Dialog>

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
