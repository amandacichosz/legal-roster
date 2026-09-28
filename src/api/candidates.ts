import { download, request } from '@/api/client'

export interface Candidate {
  id: number
  name: string
  role: string
  focus: string
  level: string
  score: number
  status: string
  first_name: string
  last_name: string
  email: string
  phone: string
  experience: string
  cover_letter: string
  resume_url: string
  source_job_posting_id: number | null
  source_job_application_id: number | null
  source_job_title: string
  availability_status: string
  contract_status: string
  hired_at: string | null
  resume_parse?: CandidateResumeParse
  created_at: string
  updated_at: string
}

export interface CandidateResumeParse {
  status: string
  summary: string
  years_experience: number | null
  skills: string[]
  practice_areas: string[]
  jurisdictions: string[]
  education: string[]
  certifications: string[]
  languages: string[]
  error: string
  parsed_at: string | null
}

export function listCandidates() {
  return request<Candidate[]>('/api/candidates', { method: 'GET' })
}

export function downloadResume(resumeURL: string) {
  return download(resumeURL)
}
