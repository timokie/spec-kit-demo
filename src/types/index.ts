export type ID = string

export type BlogSubmission = {
  id: ID
  title: string
  author?: string
  content: string
  createdAt: string
  status: 'pending' | 'approved' | 'rejected'
  adminNote?: string
}
