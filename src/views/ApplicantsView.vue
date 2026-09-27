<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Menu from 'primevue/menu'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import type { MenuItem } from 'primevue/menuitem'
import * as jobsApi from '@/api/jobs'
import type { Applicant, ApplicantStatus } from '@/api/jobs'

type StatusFilter = ApplicantStatus | ''

const statusFilters: { label: string; value: StatusFilter; tone: 'info' | 'warn' | 'danger' | 'secondary' }[] = [
  { label: 'All', value: '', tone: 'secondary' },
  { label: 'Applied', value: 'applied', tone: 'info' },
  { label: 'In review', value: 'in_review', tone: 'warn' },
  { label: 'Rejected', value: 'rejected', tone: 'danger' },
]

const statusOptions: { label: string; value: ApplicantStatus }[] = [
  { label: 'Applied', value: 'applied' },
  { label: 'In review', value: 'in_review' },
  { label: 'Rejected', value: 'rejected' },
]

const applicants = ref<Applicant[]>([])
const selectedStatus = ref<StatusFilter>('')
const page = ref(1)
const pageSize = ref(25)
const total = ref(0)
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const pendingHire = ref<Applicant | null>(null)
const selectedActionApplicant = ref<Applicant | null>(null)
const applicantActionsMenu = ref<InstanceType<typeof Menu> | null>(null)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const pageStart = computed(() => (total.value === 0 ? 0 : (page.value - 1) * pageSize.value + 1))
const pageEnd = computed(() => Math.min(total.value, page.value * pageSize.value))
const applicantActionItems = computed<MenuItem[]>(() => {
  const applicant = selectedActionApplicant.value

  return [
    ...statusOptions.map((option) => ({
      label: option.label,
      icon: applicant?.status === option.value ? 'pi pi-check' : 'pi pi-circle',
      disabled: saving.value || applicant?.status === option.value,
      command: () => {
        if (applicant) void updateStatus(applicant, option.value)
      },
    })),
    { separator: true },
    {
      label: 'Hired',
      icon: 'pi pi-check-circle',
      disabled: saving.value || !applicant,
      command: () => {
        if (applicant) pendingHire.value = applicant
      },
    },
  ]
})

function fullName(applicant: Applicant) {
  return `${applicant.first_name} ${applicant.last_name}`.trim()
}

function statusLabel(status: ApplicantStatus) {
  return statusOptions.find((option) => option.value === status)?.label ?? status
}

function statusSeverity(status: ApplicantStatus) {
  switch (status) {
    case 'applied':
      return 'info'
    case 'in_review':
      return 'warn'
    case 'rejected':
      return 'danger'
    default:
      return 'secondary'
  }
}

async function loadApplicants() {
  loading.value = true
  error.value = null
  try {
    const response = await jobsApi.listApplicants({
      status: selectedStatus.value,
      page: page.value,
      page_size: pageSize.value,
    })
    applicants.value = response.items
    total.value = response.total
    page.value = response.page
    pageSize.value = response.page_size
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load applicants'
  } finally {
    loading.value = false
  }
}

async function setStatusFilter(status: StatusFilter) {
  selectedStatus.value = status
  page.value = 1
  await loadApplicants()
}

async function updateStatus(applicant: Applicant, status: ApplicantStatus) {
  if (applicant.status === status) return

  saving.value = true
  error.value = null
  try {
    const updated = await jobsApi.updateApplicantStatus(applicant.id, status)
    applicants.value = applicants.value.map((item) =>
      item.id === applicant.id
        ? { ...item, status: updated.status, updated_at: updated.updated_at }
        : item,
    )
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to update applicant'
    await loadApplicants()
  } finally {
    saving.value = false
  }
}

function openApplicantActions(event: MouseEvent, applicant: Applicant) {
  selectedActionApplicant.value = applicant
  applicantActionsMenu.value?.toggle(event)
}

async function confirmHire() {
  if (!pendingHire.value) return

  saving.value = true
  error.value = null
  try {
    await jobsApi.hireApplicant(pendingHire.value.id)
    pendingHire.value = null
    await loadApplicants()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to hire applicant'
  } finally {
    saving.value = false
  }
}

async function previousPage() {
  if (page.value <= 1) return
  page.value -= 1
  await loadApplicants()
}

async function nextPage() {
  if (page.value >= totalPages.value) return
  page.value += 1
  await loadApplicants()
}

onMounted(loadApplicants)
</script>

<template>
  <section class="flex flex-col gap-6">
    <header
      class="flex flex-col gap-4 border-b border-border-soft/80 pb-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p class="text-sm font-medium text-civic-700">Hiring</p>
        <h1 class="mt-1 text-2xl font-semibold text-ink">Applicants</h1>
      </div>
    </header>

    <Message v-if="error" severity="error">{{ error }}</Message>

    <section class="rounded-lg border border-border-soft bg-surface shadow-sm">
      <div class="flex flex-col gap-4 border-b border-border-soft bg-surface-muted px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="filter in statusFilters"
            :key="filter.label"
            :label="filter.label"
            :severity="filter.value === selectedStatus ? filter.tone : 'secondary'"
            :outlined="filter.value !== selectedStatus"
            size="small"
            @click="setStatusFilter(filter.value)"
          />
        </div>
        <p class="text-sm text-ink-muted">{{ pageStart }}-{{ pageEnd }} of {{ total }} applicants</p>
      </div>

      <div class="overflow-x-auto">
        <div class="min-w-[56rem]">
          <div class="grid grid-cols-[1fr_1.1fr_1fr_10rem_6rem] gap-4 border-b border-border-soft px-4 py-3 text-xs font-semibold uppercase text-ink-muted">
            <span>Name</span>
            <span>Email</span>
            <span>Job</span>
            <span>Status</span>
            <span class="text-right">Actions</span>
          </div>

          <div v-if="loading" class="px-4 py-8 text-sm text-ink-muted">Loading applicants...</div>
          <div v-else-if="applicants.length === 0" class="px-4 py-8 text-sm text-ink-muted">No applicants found.</div>

          <div
            v-for="applicant in applicants"
            v-else
            :key="applicant.id"
            class="grid grid-cols-[1fr_1.1fr_1fr_10rem_6rem] items-center gap-4 border-b border-border-soft px-4 py-3 last:border-b-0"
          >
            <p class="truncate text-sm font-medium text-ink">{{ fullName(applicant) }}</p>
            <p class="truncate text-sm text-ink-muted">{{ applicant.email }}</p>
            <p class="truncate text-sm text-ink-muted">{{ applicant.job_title }}</p>
            <Tag :value="statusLabel(applicant.status)" :severity="statusSeverity(applicant.status)" class="w-fit" />
            <div class="flex items-center justify-end gap-2">
              <Button
                icon="pi pi-ellipsis-v"
                size="small"
                severity="secondary"
                text
                rounded
                :aria-label="`Actions for ${fullName(applicant)}`"
                :disabled="saving"
                @click="openApplicantActions($event, applicant)"
              />
            </div>
          </div>
        </div>
      </div>

      <Menu ref="applicantActionsMenu" :model="applicantActionItems" popup />

      <div class="flex items-center justify-between border-t border-border-soft px-4 py-3">
        <Button label="Previous" icon="pi pi-chevron-left" outlined :disabled="page <= 1 || loading" @click="previousPage" />
        <span class="text-sm text-ink-muted">Page {{ page }} of {{ totalPages }}</span>
        <Button label="Next" icon="pi pi-chevron-right" icon-pos="right" outlined :disabled="page >= totalPages || loading" @click="nextPage" />
      </div>
    </section>

    <Dialog
      :visible="pendingHire !== null"
      modal
      header="Confirm hire"
      :style="{ width: '30rem' }"
      @update:visible="pendingHire = null"
    >
      <div v-if="pendingHire" class="flex flex-col gap-5">
        <p class="text-sm leading-6 text-ink-muted">
          Confirm that {{ fullName(pendingHire) }} should be hired. This will create a Candidate
          record and remove the application from Applicants.
        </p>
        <div class="flex justify-end gap-2">
          <Button label="Cancel" severity="secondary" text @click="pendingHire = null" />
          <Button label="Confirm hire" icon="pi pi-check" :loading="saving" @click="confirmHire" />
        </div>
      </div>
    </Dialog>
  </section>
</template>
