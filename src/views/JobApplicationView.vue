<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Tag from 'primevue/tag'
import logo from '@/assets/img/legal-roster.png'
import * as jobsApi from '@/api/jobs'
import type { JobPosting } from '@/api/jobs'

const route = useRoute()
const job = ref<JobPosting | null>(null)
const loading = ref(false)
const submitting = ref(false)
const submitted = ref(false)
const error = ref<string | null>(null)

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const resume = ref<File | null>(null)
const resumeInput = ref<HTMLInputElement | null>(null)

const slug = computed(() => String(route.params.slug || ''))
const activeJob = computed(() => (job.value?.is_active ? job.value : null))
const requirementList = computed(
  () =>
    job.value?.requirements
      .split(';')
      .map((item) => item.trim())
      .filter(Boolean) ?? [],
)

async function loadJob() {
  loading.value = true
  error.value = null
  try {
    job.value = await jobsApi.getJobBySlug(slug.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load job posting'
  } finally {
    loading.value = false
  }
}

async function submitApplication() {
  if (!job.value?.is_active) return

  submitting.value = true
  error.value = null
  try {
    await jobsApi.submitJobApplication(slug.value, {
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
      phone: phone.value,
      resume: resume.value,
    })
    submitted.value = true
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to submit application'
  } finally {
    submitting.value = false
  }
}

function selectResume() {
  resumeInput.value?.click()
}

function onResumeChange(event: Event) {
  const input = event.target as HTMLInputElement
  resume.value = input.files?.[0] ?? null
}

onMounted(loadJob)
</script>

<template>
  <main class="min-h-screen bg-paper px-4 py-6 text-ink sm:px-6 lg:px-8">
    <div class="mx-auto flex max-w-5xl flex-col gap-6">
      <header class="flex items-center">
        <img class="h-12" :src="logo" alt="Legal Roster" />
      </header>

      <section
        v-if="loading"
        class="rounded-lg border border-border-soft bg-surface p-8 text-sm text-ink-muted"
      >
        Loading job posting...
      </section>

      <section
        v-else-if="!activeJob"
        class="flex min-h-80 items-center justify-center rounded-lg border border-border-soft bg-surface p-8 text-center shadow-sm"
      >
        <div>
          <Tag value="Unavailable" severity="warn" />
          <h1 class="mt-4 text-2xl font-semibold text-ink">
            This job posting is no longer available.
          </h1>
        </div>
      </section>

      <section v-else class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <article class="rounded-lg border border-border-soft bg-surface p-6 shadow-sm sm:p-8">
          <div class="flex flex-wrap items-center gap-2">
            <Tag :value="activeJob.employment_type" severity="info" />
            <Tag :value="activeJob.location" severity="secondary" />
          </div>
          <h1 class="mt-4 text-3xl font-semibold text-ink">{{ activeJob.title }}</h1>
          <p class="mt-2 text-sm font-medium text-civic-700">{{ activeJob.department }}</p>
          <p class="mt-5 text-base leading-7 text-ink-muted">{{ activeJob.summary }}</p>

          <div class="mt-8 border-t border-border-soft pt-6">
            <h2 class="text-lg font-semibold text-ink">About the role</h2>
            <p class="mt-3 text-sm leading-6 text-ink-muted">{{ activeJob.description }}</p>
          </div>

          <div class="mt-6 border-t border-border-soft pt-6">
            <h2 class="text-lg font-semibold text-ink">What we are looking for</h2>
            <ul class="mt-3 grid gap-2 text-sm leading-6 text-ink-muted">
              <li v-for="requirement in requirementList" :key="requirement" class="flex gap-2">
                <i class="pi pi-check mt-1 text-xs text-verdict-600" />
                <span>{{ requirement }}</span>
              </li>
            </ul>
          </div>
        </article>

        <aside class="rounded-lg border border-border-soft bg-surface p-5 shadow-sm">
          <Message v-if="submitted" severity="success">
            Application submitted. The hiring team will review it soon.
          </Message>
          <form v-else class="flex flex-col gap-4" @submit.prevent="submitApplication">
            <div>
              <h2 class="text-lg font-semibold text-ink">Apply now</h2>
              <p class="mt-1 text-sm text-ink-muted">Send your information directly to the team.</p>
            </div>

            <Message v-if="error" severity="error">{{ error }}</Message>

            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <label class="flex flex-col gap-2 text-sm font-medium text-ink">
                First name
                <InputText v-model="firstName" autocomplete="given-name" required />
              </label>
              <label class="flex flex-col gap-2 text-sm font-medium text-ink">
                Last name
                <InputText v-model="lastName" autocomplete="family-name" required />
              </label>
            </div>
            <label class="flex flex-col gap-2 text-sm font-medium text-ink">
              Email
              <InputText v-model="email" autocomplete="email" required type="email" />
            </label>
            <label class="flex flex-col gap-2 text-sm font-medium text-ink">
              Phone
              <InputText v-model="phone" autocomplete="tel" required />
            </label>
            <div class="flex flex-col gap-2 text-sm font-medium text-ink">
              Resume
              <input
                ref="resumeInput"
                class="sr-only"
                type="file"
                accept=".pdf,.doc,.docx,.txt,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/rtf,text/rtf"
                @change="onResumeChange"
              />
              <div class="flex min-h-11 items-center gap-2 rounded-md border border-border-soft bg-white px-3 py-2">
                <i class="pi pi-file text-sm text-civic-700" />
                <span class="min-w-0 flex-1 truncate text-sm font-normal text-ink-muted">
                  {{ resume?.name || 'No resume attached' }}
                </span>
                <Button
                  :label="resume ? 'Change' : 'Attach'"
                  icon="pi pi-paperclip"
                  outlined
                  size="small"
                  type="button"
                  @click="selectResume"
                />
              </div>
            </div>
            <Button
              label="Submit application"
              icon="pi pi-send"
              :loading="submitting"
              type="submit"
            />
          </form>
        </aside>
      </section>
    </div>
  </main>
</template>
