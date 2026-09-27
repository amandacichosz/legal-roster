<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import * as jobsApi from '@/api/jobs'
import type { Applicant, JobPosting } from '@/api/jobs'
import { useAuthStore } from '@/stores/auth'

const metrics = [
  { label: 'Benchmarks', value: '128', tone: 'civic' },
  { label: 'Reviewed Tasks', value: '2.4k', tone: 'verdict' },
  { label: 'Open Briefs', value: '37', tone: 'brief' },
]

const auth = useAuthStore()
const jobs = ref<JobPosting[]>([])
const applicants = ref<Applicant[]>([])
const hiringLoading = ref(false)
const hiringError = ref<string | null>(null)

const activeJobCount = computed(() => jobs.value.filter((job) => job.is_active).length)
const totalApplicationCount = computed(() =>
  jobs.value.reduce((total, job) => total + (job.application_count ?? 0), 0),
)
const inactiveJobCount = computed(() => jobs.value.length - activeJobCount.value)
const currentApplicantCount = computed(() => applicants.value.length)
const appliedApplicantCount = computed(
  () => applicants.value.filter((applicant) => applicant.status === 'applied').length,
)
const inReviewApplicantCount = computed(
  () => applicants.value.filter((applicant) => applicant.status === 'in_review').length,
)
const rejectedApplicantCount = computed(
  () => applicants.value.filter((applicant) => applicant.status === 'rejected').length,
)

async function loadJobMetrics() {
  if (!auth.isPlatformAdmin) return

  hiringLoading.value = true
  hiringError.value = null
  try {
    const [jobPostings, applicantRows] = await Promise.all([
      jobsApi.listAdminJobs(),
      jobsApi.listApplicants(),
    ])
    jobs.value = jobPostings
    applicants.value = applicantRows.items
  } catch (err) {
    hiringError.value = err instanceof Error ? err.message : 'Unable to load hiring metrics'
  } finally {
    hiringLoading.value = false
  }
}

onMounted(loadJobMetrics)
</script>

<template>
  <section class="flex flex-col gap-8">
    <header
      class="flex flex-col gap-4 border-b border-border-soft/80 pb-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p class="text-sm font-medium text-civic-700">Dashboard</p>
        <h1 class="mt-1 text-2xl font-semibold text-ink">Evaluation workspace</h1>
      </div>
      <Button label="New benchmark" icon="pi pi-plus" />
    </header>

    <div class="grid gap-4 md:grid-cols-3">
      <Card
        v-for="metric in metrics"
        :key="metric.label"
        class="overflow-hidden border border-border-soft/80 shadow-sm"
      >
        <template #content>
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm text-ink-muted">{{ metric.label }}</p>
              <p class="mt-3 text-3xl font-semibold text-ink">{{ metric.value }}</p>
            </div>
            <span
              class="h-10 w-10 rounded-lg"
              :class="{
                'bg-civic-100': metric.tone === 'civic',
                'bg-verdict-100': metric.tone === 'verdict',
                'bg-brief-100': metric.tone === 'brief',
              }"
            />
          </div>
        </template>
      </Card>
    </div>

    <section v-if="auth.isPlatformAdmin" class="flex flex-col gap-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-sm font-medium text-civic-700">Hiring</p>
          <h2 class="mt-1 text-xl font-semibold text-ink">Job posting metrics</h2>
        </div>
      </div>

      <Message v-if="hiringError" severity="error">{{ hiringError }}</Message>

      <section class="grid gap-4 sm:grid-cols-3">
        <div class="rounded-lg border border-border-soft bg-surface p-5 shadow-sm">
          <p class="text-sm font-medium text-ink-muted">Active postings</p>
          <p class="mt-2 text-3xl font-semibold text-civic-800">{{ activeJobCount }}</p>
        </div>
        <div class="rounded-lg border border-border-soft bg-surface p-5 shadow-sm">
          <p class="text-sm font-medium text-ink-muted">Total applications</p>
          <p class="mt-2 text-3xl font-semibold text-verdict-700">{{ totalApplicationCount }}</p>
        </div>
        <div class="rounded-lg border border-border-soft bg-surface p-5 shadow-sm">
          <p class="text-sm font-medium text-ink-muted">Inactive postings</p>
          <p class="mt-2 text-3xl font-semibold text-brief-600">{{ inactiveJobCount }}</p>
        </div>
      </section>

      <section class="grid gap-4 sm:grid-cols-4">
        <div class="rounded-lg border border-border-soft bg-surface p-5 shadow-sm">
          <p class="text-sm font-medium text-ink-muted">Current applicants</p>
          <p class="mt-2 text-3xl font-semibold text-civic-800">{{ currentApplicantCount }}</p>
        </div>
        <div class="rounded-lg border border-border-soft bg-surface p-5 shadow-sm">
          <p class="text-sm font-medium text-ink-muted">Applied</p>
          <p class="mt-2 text-3xl font-semibold text-verdict-700">{{ appliedApplicantCount }}</p>
        </div>
        <div class="rounded-lg border border-border-soft bg-surface p-5 shadow-sm">
          <p class="text-sm font-medium text-ink-muted">In review</p>
          <p class="mt-2 text-3xl font-semibold text-brief-600">{{ inReviewApplicantCount }}</p>
        </div>
        <div class="rounded-lg border border-border-soft bg-surface p-5 shadow-sm">
          <p class="text-sm font-medium text-ink-muted">Rejected</p>
          <p class="mt-2 text-3xl font-semibold text-ink">{{ rejectedApplicantCount }}</p>
        </div>
      </section>
    </section>
  </section>
</template>
