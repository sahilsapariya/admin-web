import type { Student } from "./student";

export interface ClassItem {
  id: string;
  name: string;
  section?: string;
  academic_year?: string;
  academic_year_id?: string;
  teacher_id?: string;
  teacher_name?: string;
  student_count?: number;
  created_at?: string;
}

export interface ClassTeacherAssignment {
  id: string;
  class_id: string;
  teacher_id: string;
  teacher_name: string;
  teacher_employee_id?: string;
  subject_id?: string;
  subject_name?: string;
  is_class_teacher: boolean;
}

export interface ClassDetail extends ClassItem {
  students: Student[];
  teachers: ClassTeacherAssignment[];
}

export interface CreateClassInput {
  name: string;
  section: string;
  academic_year_id: string;
  teacher_id?: string;
  start_date?: string;
  end_date?: string;
}

/** Alias for CreateClassInput (used by classesService) */
export type CreateClassDTO = CreateClassInput;

/** Subject load: weekly periods per subject for a class */
export interface SubjectLoad {
  id: string;
  class_id: string;
  subject_id: string;
  subject_name?: string;
  subject_code?: string;
  weekly_periods: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSubjectLoadInput {
  subject_id: string;
  weekly_periods: number;
}
