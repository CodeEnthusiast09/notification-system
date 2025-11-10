// shared/types/index.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message: string;
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface QueueMessage {
  message_id: string;
  notification_type: "email" | "push";
  user_id: string;
  template_id: string;
  language: string;
  variables: Record<string, any>;
  priority: number;
  created_at: string;
  retry_count: number;
}

export enum NotificationStatus {
  QUEUED = "queued",
  PROCESSING = "processing",
  SENT = "sent",
  FAILED = "failed",
  RETRYING = "retrying",
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  push_tokens?: string[];
  preferred_language: string;
  notification_preferences: {
    email_enabled: boolean;
    push_enabled: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  name: string;
  templates: {
    [language: string]: {
      subject?: string;
      title?: string;
      body: string;
    };
  };
  variables: string[];
  created_at: string;
  updated_at: string;
}
