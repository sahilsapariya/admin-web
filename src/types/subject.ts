export interface Subject {
  id: string;
  name: string;
  code?: string;
  description?: string;
  tenant_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSubjectInput {
  name: string;
  code?: string;
  description?: string;
}

export interface UpdateSubjectInput {
  name?: string;
  code?: string;
  description?: string;
}
