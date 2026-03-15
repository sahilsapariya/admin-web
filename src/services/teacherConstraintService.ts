import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from "@/services/api";
import type {
  TeacherSubject,
  TeacherAvailability,
  TeacherLeave,
  TeacherWorkload,
  CreateAvailabilityDTO,
  WorkloadDTO,
} from "@/types/teacher";

// --- Teacher Subject Expertise ---
export const teacherSubjectService = {
  getSubjects: (teacherId: string) =>
    apiGet<TeacherSubject[]>(`/api/teachers/${teacherId}/subjects`),

  addSubject: (teacherId: string, subjectId: string) =>
    apiPost<TeacherSubject>(`/api/teachers/${teacherId}/subjects`, {
      subject_id: subjectId,
    }),

  removeSubject: (teacherId: string, subjectId: string) =>
    apiDelete<void>(`/api/teachers/${teacherId}/subjects/${subjectId}`),
};

// --- Teacher Availability ---
export const teacherAvailabilityService = {
  getAvailability: (teacherId: string) =>
    apiGet<TeacherAvailability[]>(`/api/teachers/${teacherId}/availability`),

  createAvailability: (
    teacherId: string,
    data: CreateAvailabilityDTO
  ) =>
    apiPost<TeacherAvailability>(`/api/teachers/${teacherId}/availability`, data),

  updateAvailability: (
    teacherId: string,
    availabilityId: string,
    available: boolean
  ) =>
    apiPut<TeacherAvailability>(
      `/api/teachers/${teacherId}/availability/${availabilityId}`,
      { available }
    ),

  deleteAvailability: (teacherId: string, availabilityId: string) =>
    apiDelete<void>(`/api/teachers/${teacherId}/availability/${availabilityId}`),
};

// --- Teacher Leaves ---
export const teacherLeaveService = {
  listLeaves: (params?: { teacher_id?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.teacher_id) q.set("teacher_id", params.teacher_id);
    if (params?.status) q.set("status", params.status);
    const suffix = q.toString() ? `?${q.toString()}` : "";
    return apiGet<TeacherLeave[]>(`/api/teachers/leaves${suffix}`);
  },

  approveLeave: (leaveId: string) =>
    apiPut<TeacherLeave>(`/api/teachers/leaves/${leaveId}/approve`, {}),

  rejectLeave: (leaveId: string) =>
    apiPut<TeacherLeave>(`/api/teachers/leaves/${leaveId}/reject`, {}),
};

// --- Teacher Workload ---
export const teacherWorkloadService = {
  getWorkload: (teacherId: string) =>
    apiGet<TeacherWorkload>(`/api/teachers/${teacherId}/workload`),

  createWorkload: (teacherId: string, data: WorkloadDTO) =>
    apiPost<TeacherWorkload>(`/api/teachers/${teacherId}/workload`, data),

  updateWorkload: (teacherId: string, data: Partial<WorkloadDTO>) =>
    apiPut<TeacherWorkload>(`/api/teachers/${teacherId}/workload`, data),
};
