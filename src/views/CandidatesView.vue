<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import * as candidatesApi from '@/api/candidates'
import type { Candidate } from '@/api/candidates'

const candidates = ref<Candidate[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const downloadingResumeID = ref<number | null>(null)

const hiredCandidates = computed(() =>
  candidates.value.filter((candidate) => candidate.status.toLowerCase() === 'hired'),
)
const availableCount = computed(
  () =>
    hiredCandidates.value.filter((candidate) => candidate.availability_status === 'available')
      .length,
)
const contractsReadyCount = computed(
  () =>
    hiredCandidates.value.filter((candidate) => candidate.contract_status === 'complete').length,
)

function tagSeverity(value: string) {
  switch (value) {
    case 'available':
    case 'complete':
    case 'Hired':
    case 'completed':
      return 'success'
    case 'not_started':
    case 'processing':
      return 'warn'
    case 'failed':
      return 'danger'
    default:
      return 'info'
  }
}

function formatStatus(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function formatDate(value: string | null) {
  if (!value) return 'Not recorded'
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function candidateSummary(candidate: Candidate) {
  return (
    candidate.resume_parse?.summary ||
    candidate.experience ||
    candidate.cover_letter ||
    candidate.focus ||
    'No candidate summary available yet.'
  )
}

function candidateYears(candidate: Candidate) {
  const years = candidate.resume_parse?.years_experience
  if (years === null || years === undefined) return 'Experience not parsed'
  return `${years}+ ${years === 1 ? 'year' : 'years'} experience`
}

function sourceJob(candidate: Candidate) {
  return candidate.source_job_title || candidate.role || 'Source job not recorded'
}

async function downloadResume(candidate: Candidate) {
  if (!candidate.resume_url) return
  downloadingResumeID.value = candidate.id
  error.value = null
  try {
    await candidatesApi.downloadResume(candidate.resume_url)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to download resume'
  } finally {
    downloadingResumeID.value = null
  }
}

function topItems(values: string[] | undefined, limit = 4) {
  return (values || []).filter(Boolean).slice(0, limit)
}

function hasResumeHighlights(candidate: Candidate) {
  const parse = candidate.resume_parse
  if (!parse) return false
  return [
    parse.practice_areas,
    parse.skills,
    parse.jurisdictions,
    parse.languages,
    parse.certifications,
  ].some((values) => values.length > 0)
}

async function loadCandidates() {
  loading.value = true
  error.value = null
  try {
    candidates.value = await candidatesApi.listCandidates()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load candidates'
  } finally {
    loading.value = false
  }
}

onMounted(loadCandidates)
</script>

<template>
  <section class="flex flex-col gap-6">
    <header
      class="flex flex-col gap-4 border-b border-border-soft/80 pb-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p class="text-sm font-medium text-civic-700">Candidates</p>
        <h1 class="mt-1 text-2xl font-semibold text-ink">Hired candidate pool</h1>
      </div>
    </header>

    <Message v-if="error" severity="error">{{ error }}</Message>

    <section class="grid gap-4 sm:grid-cols-3">
      <div class="rounded-lg border border-border-soft bg-surface p-5 shadow-sm">
        <p class="text-sm font-medium text-ink-muted">Hired candidates</p>
        <p class="mt-2 text-3xl font-semibold text-civic-800">{{ hiredCandidates.length }}</p>
      </div>
      <div class="rounded-lg border border-border-soft bg-surface p-5 shadow-sm">
        <p class="text-sm font-medium text-ink-muted">Available</p>
        <p class="mt-2 text-3xl font-semibold text-verdict-700">{{ availableCount }}</p>
      </div>
      <div class="rounded-lg border border-border-soft bg-surface p-5 shadow-sm">
        <p class="text-sm font-medium text-ink-muted">Ready for placement</p>
        <p class="mt-2 text-3xl font-semibold text-brief-600">{{ contractsReadyCount }}</p>
      </div>
    </section>

    <section
      v-if="loading"
      class="rounded-lg border border-border-soft bg-surface p-8 text-sm text-ink-muted"
    >
      Loading candidates...
    </section>

    <section
      v-else-if="hiredCandidates.length === 0"
      class="rounded-lg border border-border-soft bg-surface p-8 shadow-sm"
    >
      <Tag value="Empty" severity="info" />
      <h2 class="mt-4 text-xl font-semibold text-ink">No hired candidates yet.</h2>
      <p class="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
        When an applicant is confirmed as hired from the Applicants board, their application details
        will appear here.
      </p>
    </section>

    <div v-else class="grid gap-4">
      <Card
        v-for="candidate in hiredCandidates"
        :key="candidate.id"
        class="border border-border-soft/80 shadow-sm"
      >
        <template #content>
          <div class="flex flex-col gap-5">
            <div class="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div class="flex min-w-0 items-start gap-4">
                <span
                  class="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-civic-50 text-civic-700"
                >
                  <i class="pi pi-user text-lg" />
                </span>
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <h2 class="text-lg font-semibold text-ink">{{ candidate.name }}</h2>
                    <Tag :value="candidate.level" severity="info" />
                    <Tag
                      :value="formatStatus(candidate.availability_status)"
                      :severity="tagSeverity(candidate.availability_status)"
                    />
                  </div>
                  <p class="mt-1 text-sm font-medium text-ink">{{ sourceJob(candidate) }}</p>
                  <div class="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-muted">
                    <span class="inline-flex items-center gap-2">
                      <i class="pi pi-briefcase text-xs text-civic-600" />
                      Applied for {{ sourceJob(candidate) }}
                    </span>
                    <span class="inline-flex items-center gap-2">
                      <i class="pi pi-clock text-xs text-civic-600" />
                      {{ candidateYears(candidate) }}
                    </span>
                    <span class="inline-flex items-center gap-2">
                      <i class="pi pi-calendar text-xs text-civic-600" />
                      Hired {{ formatDate(candidate.hired_at) }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap justify-start gap-2 md:justify-end">
                <Tag
                  v-if="candidate.resume_parse"
                  :value="`Resume ${formatStatus(candidate.resume_parse.status)}`"
                  :severity="tagSeverity(candidate.resume_parse.status)"
                />
                <Tag
                  :value="`Contract ${formatStatus(candidate.contract_status)}`"
                  :severity="tagSeverity(candidate.contract_status)"
                />
                <Button
                  v-if="candidate.resume_url"
                  label="Resume"
                  icon="pi pi-download"
                  size="small"
                  outlined
                  :loading="downloadingResumeID === candidate.id"
                  @click="downloadResume(candidate)"
                />
              </div>
            </div>

            <div class="grid gap-4 border-t border-border-soft pt-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p class="text-xs font-semibold uppercase text-ink-muted">Candidate summary</p>
                <p class="mt-2 text-sm leading-6 text-ink-muted">
                  {{ candidateSummary(candidate) }}
                </p>
              </div>
              <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div>
                  <p class="text-xs font-semibold uppercase text-ink-muted">Contact</p>
                  <p class="mt-2 text-sm leading-6 text-ink-muted">
                    {{ candidate.email || 'No email' }}<br />
                    {{ candidate.phone || 'No phone' }}
                  </p>
                </div>
                <div>
                  <p class="text-xs font-semibold uppercase text-ink-muted">Placement signal</p>
                  <p class="mt-2 text-sm leading-6 text-ink-muted">
                    {{
                      candidate.availability_status === 'available'
                        ? 'Available now'
                        : formatStatus(candidate.availability_status)
                    }}
                    · Contract {{ formatStatus(candidate.contract_status) }}
                  </p>
                </div>
              </div>
            </div>

            <div
              v-if="hasResumeHighlights(candidate)"
              class="grid gap-4 border-t border-border-soft pt-4 md:grid-cols-2 xl:grid-cols-4"
            >
              <div>
                <p class="text-xs font-semibold uppercase text-ink-muted">Practice areas</p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <Tag
                    v-for="area in topItems(candidate.resume_parse?.practice_areas)"
                    :key="area"
                    :value="formatStatus(area)"
                    severity="info"
                  />
                  <span
                    v-if="topItems(candidate.resume_parse?.practice_areas).length === 0"
                    class="text-sm text-ink-muted"
                  >
                    Not parsed
                  </span>
                </div>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase text-ink-muted">Skills</p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <Tag
                    v-for="skill in topItems(candidate.resume_parse?.skills)"
                    :key="skill"
                    :value="formatStatus(skill)"
                    severity="secondary"
                  />
                  <span
                    v-if="topItems(candidate.resume_parse?.skills).length === 0"
                    class="text-sm text-ink-muted"
                  >
                    Not parsed
                  </span>
                </div>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase text-ink-muted">Jurisdictions</p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <Tag
                    v-for="jurisdiction in topItems(candidate.resume_parse?.jurisdictions)"
                    :key="jurisdiction"
                    :value="formatStatus(jurisdiction)"
                    severity="success"
                  />
                  <span
                    v-if="topItems(candidate.resume_parse?.jurisdictions).length === 0"
                    class="text-sm text-ink-muted"
                  >
                    Not parsed
                  </span>
                </div>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase text-ink-muted">Languages</p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <Tag
                    v-for="language in topItems(candidate.resume_parse?.languages)"
                    :key="language"
                    :value="formatStatus(language)"
                    severity="warn"
                  />
                  <span
                    v-if="topItems(candidate.resume_parse?.languages).length === 0"
                    class="text-sm text-ink-muted"
                  >
                    Not parsed
                  </span>
                </div>
              </div>
            </div>

            <Message
              v-if="candidate.resume_parse?.status === 'failed'"
              severity="warn"
              :closable="false"
            >
              Resume parsing needs review:
              {{ candidate.resume_parse.error || 'No parser details recorded.' }}
            </Message>
            <Message
              v-else-if="candidate.resume_url && !candidate.resume_parse"
              severity="info"
              :closable="false"
            >
              Resume has not been parsed yet.
            </Message>
            <Message
              v-else-if="candidate.resume_parse?.status === 'processing'"
              severity="info"
              :closable="false"
            >
              Resume parsing is in progress.
            </Message>

            <div v-if="candidate.cover_letter" class="border-t border-border-soft pt-4">
              <p class="text-xs font-semibold uppercase text-ink-muted">Applicant note</p>
              <p class="mt-2 text-sm leading-6 text-ink-muted">
                {{ candidate.cover_letter }}
              </p>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </section>
</template>
