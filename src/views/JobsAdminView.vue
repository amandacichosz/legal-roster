<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import ToggleSwitch from 'primevue/toggleswitch'
import * as jobsApi from '@/api/jobs'
import type { JobPosting } from '@/api/jobs'

const jobs = ref<JobPosting[]>([])
const loading = ref(false)
const savingId = ref<number | null>(null)
const error = ref<string | null>(null)
const search = ref('')

const filteredJobs = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return jobs.value

  return jobs.value.filter((job) =>
    [job.title, job.department, job.location, job.employment_type, job.slug].some((value) =>
      value.toLowerCase().includes(term),
    ),
  )
})

function publicUrl(job: JobPosting) {
  return `/jobs/${job.slug}`
}

async function loadJobs() {
  loading.value = true
  error.value = null
  try {
    jobs.value = await jobsApi.listAdminJobs()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load job postings'
  } finally {
    loading.value = false
  }
}

async function setJobStatus(job: JobPosting, isActive: boolean) {
  savingId.value = job.id
  error.value = null
  try {
    const updated = await jobsApi.updateJobStatus(job.id, isActive)
    jobs.value = jobs.value.map((item) => (item.id === updated.id ? updated : item))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to update job posting'
  } finally {
    savingId.value = null
  }
}

onMounted(loadJobs)
</script>

<template>
  <section class="flex flex-col gap-6">
    <header
      class="flex flex-col gap-4 border-b border-border-soft/80 pb-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p class="text-sm font-medium text-civic-700">Admin Management</p>
        <h1 class="mt-1 text-2xl font-semibold text-ink">Jobs</h1>
      </div>
    </header>

    <Message v-if="error" severity="error">{{ error }}</Message>

    <section class="overflow-hidden rounded-lg border border-border-soft bg-surface shadow-sm">
      <div
        class="flex flex-col gap-3 border-b border-border-soft bg-surface-muted px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="relative w-full sm:max-w-sm">
          <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-muted" />
          <InputText v-model="search" class="w-full pl-9!" placeholder="Search jobs" />
        </div>
      </div>

      <div
        class="hidden grid-cols-[1fr_10rem_8rem_9rem_8rem_11rem] gap-4 border-b border-border-soft bg-surface-muted px-4 py-3 text-xs font-semibold uppercase text-ink-muted lg:grid"
      >
        <span>Posting</span>
        <span>Location</span>
        <span>Applied</span>
        <span>Status</span>
        <span>Active</span>
        <span class="text-right">Public page</span>
      </div>

      <div v-if="loading" class="px-4 py-8 text-sm text-ink-muted">Loading job postings...</div>
      <div v-else-if="filteredJobs.length === 0" class="px-4 py-8 text-sm text-ink-muted">
        No job postings found.
      </div>

      <div
        v-for="job in filteredJobs"
        v-else
        :key="job.id"
        class="grid gap-3 border-b border-border-soft px-4 py-4 last:border-b-0 lg:grid-cols-[1fr_10rem_8rem_9rem_8rem_11rem] lg:items-center lg:gap-4"
      >
        <div class="min-w-0">
          <p class="truncate text-sm font-medium text-ink">{{ job.title }}</p>
          <p class="mt-1 truncate text-xs text-ink-muted">{{ job.department }} / {{ job.slug }}</p>
        </div>
        <p class="text-sm text-ink-muted">{{ job.location }}</p>
        <p class="text-sm font-semibold text-ink">{{ job.application_count ?? 0 }}</p>
        <Tag
          :value="job.is_active ? 'active' : 'inactive'"
          :severity="job.is_active ? 'success' : 'warn'"
          class="w-fit"
        />
        <ToggleSwitch
          :model-value="job.is_active"
          :disabled="savingId === job.id"
          @update:model-value="setJobStatus(job, Boolean($event))"
        />
        <div class="flex justify-start lg:justify-end">
          <Button
            as="a"
            label="Open"
            icon="pi pi-external-link"
            size="small"
            outlined
            :href="publicUrl(job)"
            target="_blank"
            rel="noreferrer"
          />
        </div>
      </div>
    </section>
  </section>
</template>
