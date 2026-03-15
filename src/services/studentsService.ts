import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from "@/services/api";
import type {
  Student,
  CreateStudentInput,
  UpdateStudentInput,
  CreateStudentResponse,
} from "@/types/student";

export const studentsService = {
  getStudents: async (params?: {
    class_id?: string;
    class_ids?: string[];
    academic_year_id?: string;
    search?: string;
  }): Promise<Student[]> => {
    let url = "/api/students/";
    if (params) {
      const searchParams = new URLSearchParams();
      if (params.class_ids?.length) {
        searchParams.set("class_ids", params.class_ids.join(","));
      } else if (params.class_id) {
        searchParams.set("class_id", params.class_id);
      }
      if (params.academic_year_id) {
        searchParams.set("academic_year_id", params.academic_year_id);
      }
      if (params.search) {
        searchParams.set("search", params.search);
      }
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }
    const data = await apiGet<Student[]>(url);
    return Array.isArray(data) ? data : [];
  },

  getStudent: async (id: string): Promise<Student> => {
    return apiGet<Student>(`/api/students/${id}`);
  },

  createStudent: async (
    input: CreateStudentInput
  ): Promise<CreateStudentResponse> => {
    const res = await apiPost<CreateStudentResponse>("/api/students/", input);
    // Backend returns { student, credentials? } - normalize if wrapped
    if (res && "student" in res) return res as CreateStudentResponse;
    return { student: res as Student };
  },

  updateStudent: async (
    id: string,
    input: UpdateStudentInput
  ): Promise<Student> => {
    return apiPut<Student>(`/api/students/${id}`, input);
  },

  deleteStudent: async (id: string): Promise<void> => {
    await apiDelete(`/api/students/${id}`);
  },
};
