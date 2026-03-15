"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useClass, useUpdateClass, useDeleteClass } from "@/hooks/useClasses";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { useQueryClient } from "@tanstack/react-query";
import { classesService } from "@/services/classesService";
import { ClassFormModal } from "@/components/classes/ClassFormModal";
import { ClassAssignStudentModal } from "@/components/classes/ClassAssignStudentModal";
import { ClassAssignTeacherModal } from "@/components/classes/ClassAssignTeacherModal";
import { ClassSubjectLoadSection } from "@/components/classes/ClassSubjectLoadSection";
import { classesKeys } from "@/hooks/useClasses";
import { ArrowLeft, Pencil, Trash2, Loader2, Plus, UserMinus } from "lucide-react";
import { useState } from "react";

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params?.id as string | undefined;
  const { data: cls, isLoading } = useClass(id ?? null);
  const { data: academicYears = [] } = useAcademicYears(false);
  const [availableTeachers, setAvailableTeachers] = useState<{ id: string; name: string; employee_id: string }[]>([]);
  const updateMutation = useUpdateClass();
  const deleteMutation = useDeleteClass();
  const [editOpen, setEditOpen] = useState(false);
  const [studentPickerOpen, setStudentPickerOpen] = useState(false);
  const [teacherPickerOpen, setTeacherPickerOpen] = useState(false);
  const [removingStudent, setRemovingStudent] = useState<string | null>(null);
  const [removingTeacher, setRemovingTeacher] = useState<string | null>(null);

  const refreshClass = () => {
    if (id) {
      queryClient.invalidateQueries({ queryKey: classesKeys.detail(id) });
    }
  };

  const loadTeachers = async () => {
    try {
      const t = await classesService.getAvailableClassTeachers(id);
      setAvailableTeachers(t);
    } catch {
      setAvailableTeachers([]);
    }
  };

  const handleEditOpen = () => {
    loadTeachers();
    setEditOpen(true);
  };

  const handleUpdate = async (data: { name: string; section: string; academic_year_id: string; teacher_id?: string }) => {
    if (!id) return;
    await updateMutation.mutateAsync({ id, data });
    setEditOpen(false);
  };

  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to delete this class?")) return;
    await deleteMutation.mutateAsync(id);
    router.push("/classes");
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!id || !confirm("Remove this student from the class?")) return;
    setRemovingStudent(studentId);
    try {
      await classesService.removeStudent(id, studentId);
      refreshClass();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setRemovingStudent(null);
    }
  };

  const handleRemoveTeacher = async (teacherId: string) => {
    if (!id || !confirm("Remove this teacher from the class?")) return;
    setRemovingTeacher(teacherId);
    try {
      await classesService.removeTeacher(id, teacherId);
      refreshClass();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove");
    } finally {
      setRemovingTeacher(null);
    }
  };

  if (isLoading || !id) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!cls) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Class not found.</p>
        <Link href="/classes">
          <Button variant="outline">Back to Classes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/classes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {cls.name} - {cls.section}
            </h1>
            <p className="text-muted-foreground">
              {cls.academic_year ?? "—"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEditOpen} className="gap-2">
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="gap-2"
          >
            <Trash2 className="size-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Class Information</CardTitle>
            <CardDescription>Basic class details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Name" value={cls.name} />
            <InfoRow label="Section" value={cls.section} />
            <InfoRow label="Academic Year" value={cls.academic_year} />
            <InfoRow label="Class Teacher" value={cls.teacher_name} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Students</CardTitle>
              <CardDescription>
                {cls.students?.length ?? 0} students enrolled
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setStudentPickerOpen(true)} className="gap-1">
              <Plus className="size-4" />
              Add
            </Button>
          </CardHeader>
          <CardContent>
            {cls.students && cls.students.length > 0 ? (
              <ul className="space-y-2">
                {cls.students.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.admission_number}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveStudent(s.id)}
                      disabled={removingStudent === s.id}
                    >
                      {removingStudent === s.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <UserMinus className="size-4" />
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No students assigned yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Teachers</CardTitle>
              <CardDescription>
                Subject teachers assigned to this class
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setTeacherPickerOpen(true)} className="gap-1">
              <Plus className="size-4" />
              Add
            </Button>
          </CardHeader>
          <CardContent>
            {cls.teachers && cls.teachers.length > 0 ? (
              <ul className="space-y-2">
                {cls.teachers.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="font-medium">{t.teacher_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.subject_name ?? "Subject"}
                        {t.teacher_employee_id && ` • ${t.teacher_employee_id}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveTeacher(t.teacher_id)}
                      disabled={removingTeacher === t.teacher_id}
                    >
                      {removingTeacher === t.teacher_id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <UserMinus className="size-4" />
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No teachers assigned yet.</p>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <ClassSubjectLoadSection classId={id} onRefresh={refreshClass} />
        </div>
      </div>

      <ClassFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        initialData={cls}
        academicYears={academicYears}
        availableTeachers={availableTeachers}
        onSubmit={handleUpdate}
      />

      <ClassAssignStudentModal
        open={studentPickerOpen}
        onOpenChange={setStudentPickerOpen}
        classId={id}
        onAssigned={refreshClass}
      />

      <ClassAssignTeacherModal
        open={teacherPickerOpen}
        onOpenChange={setTeacherPickerOpen}
        classId={id}
        onAssigned={refreshClass}
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (value == null || value === "") return null;
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}
