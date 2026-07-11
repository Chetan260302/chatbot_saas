import {apiClient} from "./client"

export interface Chatbot{
    id: string
    name: string
    slug: string
    description: string | null
    system_prompt:string
    widget_config:string
    is_active: boolean
    domain: string
    tenant_id:string
    tenant_name?: string
    created_at:string
}

export interface ChatbotCreate {
  name:          string
  description?:  string
  system_prompt?: string
  domain?:       string
  widget_config?: Record<string, any>
  tenant_id?:    string  // superadmin only: create bot for another tenant
}

export interface Document {
  id:          string
  filename:    string
  status:      'pending' | 'processing' | 'ready' | 'failed'
  chunk_count: number
  file_type:   string
  file_size:   number
  created_at:  string
}

export interface ChatbotStats {
  total_messages: number
  total_tokens:   number
}

export const chatbotsApi = {
  list: () =>
    apiClient.get<Chatbot[]>('/chatbots'),

  listForTenant: (tenantId: string) =>
    apiClient.get<Chatbot[]>('/chatbots', { params: { tenant_id: tenantId } }),

  create: (data: ChatbotCreate) =>
    apiClient.post<Chatbot>('/chatbots', data),

  get: (id: string) =>
    apiClient.get<Chatbot>(`/chatbots/${id}`),

  update: (id: string, data: Partial<ChatbotCreate> & { is_active?: boolean }) =>
    apiClient.patch<Chatbot>(`/chatbots/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/chatbots/${id}`),

  stats: (id: string) =>
    apiClient.get<ChatbotStats>(`/chatbots/${id}/stats`),
}

export const documentsApi = {
  upload: (chatbotId: string, file: File, onProgress?: (pct: number) => void) => {
    const form = new FormData()
    form.append('file',       file)
    form.append('chatbot_id', chatbotId)
    return apiClient.post<Document>('/documents', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round(e.loaded * 100 / e.total))
      },
    })
  },

  list: (chatbotId: string) =>
    apiClient.get<Document[]>(`/documents/chatbot/${chatbotId}`),

  delete: (docId: string) =>
    apiClient.delete(`/documents/${docId}`),
}


export const chatApi={
    stream:async(
        chatbotId:string,
        sessionId:string,
        message:string,
        onToken:(token:string)=>void,
        onDone:()=>void,
    )=>{
        const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token")
        const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1").replace(/\/$/, "")
        const res=await fetch(`${baseUrl}/chat/stream`,{
            method:"POST",
            headers:{
                "Authorization" : `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body:JSON.stringify({
                chatbot_id:chatbotId,
                session_id:sessionId,
                message:message,
            }),
            
        })
        const reader =res.body?.getReader()
        const decoder = new TextDecoder()
        if (!reader) return

        while(true){
            const {value,done}=await reader.read()
            if (done){onDone();break}
            onToken(decoder.decode(value,{stream:true}))
        }
    },
    history: (sessionId:string)=>
        apiClient.get(`/chat/history/${sessionId}`),
}


export const analyticsApi = {
  overview: (params?: { days?: number; chatbot_id?: string; tenant_id?: string }) =>
    apiClient.get('/analytics/overview', { params }),
}