import { request } from '@/api/client'
import type { Candidate } from '@/api/candidates'

export interface JobPosting {
  id: number
  title: string
  slug: string
  department: string
  location: string
  employment_type: string
  summary: string
  description: string
  requirements: string
  is_active: boolean
  application_count?: number
  created_at: string
  updated_at: string
}

export interface JobApplicationPayload {
  first_name: string
  last_name: string
  email: string
  phone: string
  resume: File | null
}

export interface JobApplication {
  id: number
  job_posting_id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  experience: string
  cover_letter: string
  resume_url: string
  status: ApplicantStatus
  created_at: string
  updated_at: string
}

export type ApplicantStatus = 'applied' | 'in_review' | 'rejected'

export interface Applicant extends JobApplication {
  job_title: string
  job_slug: string
}

export interface ApplicantsResponse {
  items: Applicant[]
  total: number
  page: number
  page_size: number
  status: ApplicantStatus | ''
}

export function listAdminJobs() {
  return request<JobPosting[]>('/api/admin/jobs', { method: 'GET' })
}

export function updateJobStatus(id: number, isActive: boolean) {
  return request<JobPosting>(`/api/admin/jobs/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  })
}

export function getJobBySlug(slug: string) {
  return request<JobPosting>(`/api/jobs/${encodeURIComponent(slug)}`, { method: 'GET' })
}

export function submitJobApplication(slug: string, payload: JobApplicationPayload) {
  const body = new FormData()
  body.append('first_name', payload.first_name)
  body.append('last_name', payload.last_name)
  body.append('email', payload.email)
  body.append('phone', payload.phone)
  if (payload.resume) body.append('resume', payload.resume)

  return request<JobApplication>(`/api/jobs/${encodeURIComponent(slug)}/applications`, {
    method: 'POST',
    body,
  })
}

export function listApplicants(params: { status?: ApplicantStatus | ''; page?: number; page_size?: number } = {}) {
  const search = new URLSearchParams()
  if (params.status) search.set('status', params.status)
  if (params.page) search.set('page', String(params.page))
  if (params.page_size) search.set('page_size', String(params.page_size))
  const query = search.toString()
  return request<ApplicantsResponse>(`/api/admin/applicants${query ? `?${query}` : ''}`, { method: 'GET' })
}

export function updateApplicantStatus(id: number, status: ApplicantStatus) {
  return request<JobApplication>(`/api/admin/applicants/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function hireApplicant(id: number) {
  return request<Candidate>(`/api/admin/applicants/${id}/hire`, { method: 'POST' })
}
