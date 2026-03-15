import { apiGet, apiPost } from "@/services/api";

export interface ClassAttendanceData {
  class_id: string;
  class_name: string;
  date: string;
  is_holiday: boolean;
  total_students: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  attendance: Array<{
    student_id: string;
    student_name: string;
    admission_number: string;
    status: string | null;
    marked: boolean;
  }>;
}

export interface MyClassItem {
  id: string;
  name: string;
  section: string;
  academic_year: string;
  student_count: number;
}

export const attendanceService = {
  getMyClasses: async () => {
    const data = await apiGet<MyClassItem[]>("/api/attendance/my-classes");
    return Array.isArray(data) ? data : [];
  },

  getClassAttendance: async (classId: string, date: string) =>
    apiGet<ClassAttendanceData>(`/api/attendance/class/${classId}?date=${date}`),

  markAttendance: async (data: {
    class_id: string;
    date: string;
    records: Array<{ student_id: string; status: string; remarks?: string }>;
  }) => apiPost("/api/attendance/mark", data),
};
