import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from "@/services/api";
import type {
  ClassItem,
  ClassDetail,
  CreateClassInput,
  SubjectLoad,
  CreateSubjectLoadInput,
} from "@/types/class";
import type { Student } from "@/types/student";
import type { Teacher } from "@/types/teacher";

export type { ClassItem, ClassDetail, CreateClassInput, SubjectLoad, CreateSubjectLoadInput };

export const classesService = {
  getClasses: async (params?: {
    academic_year_id?: string;
  }): Promise<ClassItem[]> => {
    let url = "/api/classes/";
    if (params?.academic_year_id) {
      url += `?academic_year_id=${params.academic_year_id}`;
    }
    const data = await apiGet<ClassItem[]>(url);
    return Array.isArray(data) ? data : [];
  },

  getClass: async (id: string): Promise<ClassDetail> => {
    return apiGet<ClassDetail>(`/api/classes/${id}`);
  },

  createClass: async (data: CreateClassInput): Promise<ClassItem> => {
    return apiPost<ClassItem>("/api/classes/", data);
  },

  updateClass: async (
    id: string,
    data: Partial<CreateClassInput>
  ): Promise<ClassItem> => {
    return apiPut<ClassItem>(`/api/classes/${id}`, data);
  },

  deleteClass: async (id: string): Promise<void> => {
    await apiDelete(`/api/classes/${id}`);
  },

  getUnassignedStudents: async (
    classId: string
  ): Promise<Student[]> => {
    const data = await apiGet<Student[]>(
      `/api/classes/${classId}/unassigned-students`
    );
    return Array.isArray(data) ? data : [];
  },

  assignStudent: async (
    classId: string,
    studentId: string
  ): Promise<void> => {
    await apiPost(`/api/classes/${classId}/students`, {
      student_id: studentId,
    });
  },

  removeStudent: async (
    classId: string,
    studentId: string
  ): Promise<void> => {
    await apiDelete(`/api/classes/${classId}/students/${studentId}`);
  },

  getAvailableClassTeachers: async (
    classId?: string
  ): Promise<Teacher[]> => {
    const params = classId ? `?class_id=${classId}` : "";
    const data = await apiGet<Teacher[]>(
      `/api/classes/meta/available-class-teachers${params}`
    );
    return Array.isArray(data) ? data : [];
  },

  getUnassignedTeachers: async (classId: string): Promise<Teacher[]> => {
    const data = await apiGet<Teacher[]>(
      `/api/classes/${classId}/unassigned-teachers`
    );
    return Array.isArray(data) ? data : [];
  },

  assignTeacher: async (
    classId: string,
    teacherId: string,
    subjectId: string,
    isClassTeacher = false
  ): Promise<void> => {
    await apiPost(`/api/classes/${classId}/teachers`, {
      teacher_id: teacherId,
      subject_id: subjectId,
      is_class_teacher: isClassTeacher,
    });
  },

  removeTeacher: async (
    classId: string,
    teacherId: string
  ): Promise<void> => {
    await apiDelete(`/api/classes/${classId}/teachers/${teacherId}`);
  },

  getSubjectLoads: async (classId: string): Promise<SubjectLoad[]> => {
    const data = await apiGet<SubjectLoad[]>(
      `/api/classes/${classId}/subject-load`
    );
    return Array.isArray(data) ? data : [];
  },

  createSubjectLoad: async (
    classId: string,
    data: CreateSubjectLoadInput
  ): Promise<SubjectLoad> => {
    return apiPost<SubjectLoad>(
      `/api/classes/${classId}/subject-load`,
      data
    );
  },

  updateSubjectLoad: async (
    classId: string,
    loadId: string,
    weeklyPeriods: number
  ): Promise<SubjectLoad> => {
    return apiPut<SubjectLoad>(
      `/api/classes/${classId}/subject-load/${loadId}`,
      { weekly_periods: weeklyPeriods }
    );
  },

  deleteSubjectLoad: async (
    classId: string,
    loadId: string
  ): Promise<void> => {
    await apiDelete(`/api/classes/${classId}/subject-load/${loadId}`);
  },
};
