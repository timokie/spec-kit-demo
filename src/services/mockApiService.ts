import { BlogSubmission } from '../types'
import { v4 as uuidv4 } from 'uuid'
import bundledData from '../mocks/blogs.json'

const STORAGE_KEY = 'blog_aggregator_submissions_v1'

function load(): BlogSubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    // ignore
  }
  const data: BlogSubmission[] = bundledData as unknown as BlogSubmission[]
  save(data)
  return data
}

function save(list: BlogSubmission[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export const MockApiService = {
  listApproved(): Promise<BlogSubmission[]> {
    const all = load()
    return Promise.resolve(
      all.filter((b) => b.status === 'approved').sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    )
  },
  submit(payload: Omit<BlogSubmission, 'id' | 'status' | 'createdAt'>): Promise<BlogSubmission> {
    const all = load()
    const newOne: BlogSubmission = {
      id: uuidv4(),
      title: payload.title,
      author: payload.author,
      content: payload.content,
      createdAt: new Date().toISOString(),
      status: 'pending'
    }
    all.unshift(newOne)
    save(all)
    return Promise.resolve(newOne)
  },
  getById(id: string): Promise<BlogSubmission | undefined> {
    const all = load()
    return Promise.resolve(all.find((b) => b.id === id))
  },
  adminListAll(): Promise<BlogSubmission[]> {
    return Promise.resolve(load().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)))
  },
  adminUpdateStatus(id: string, status: BlogSubmission['status'], adminNote?: string): Promise<BlogSubmission | undefined> {
    const all = load()
    const idx = all.findIndex((b) => b.id === id)
    if (idx === -1) return Promise.resolve(undefined)
    all[idx].status = status
    all[idx].adminNote = adminNote
    save(all)
    return Promise.resolve(all[idx])
  }
}
