"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStudent, useUpdateStudent, useDeleteStudent } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { StudentFormModal } from "@/components/students/StudentFormModal";
import { StudentDocumentsSection } from "@/components/students/StudentDocumentsSection";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import type { UpdateStudentInput } from "@/types/student";

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const { data: student, isLoading } = useStudent(id ?? null);
  const { data: classes = [] } = useClasses();
  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();
  const [editOpen, setEditOpen] = useState(false);

  const handleUpdate = async (data: UpdateStudentInput) => {
    if (!id) return;
    await updateMutation.mutateAsync({ id, input: data });
    setEditOpen(false);
  };

  const handleDelete = async () => {
    if (!id || !confirm("Are you sure you want to delete this student?")) return;
    await deleteMutation.mutateAsync(id);
    router.push("/students");
  };

  if (isLoading || !id) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Student not found.</p>
        <Link href="/students">
          <Button variant="outline">Back to Students</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/students">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {student.name}
            </h1>
            <p className="text-muted-foreground">
              {student.admission_number}
              {student.class_name && ` • ${student.class_name}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)} className="gap-2">
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
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Student profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Admission Number" value={student.admission_number} />
            <InfoRow label="Academic Year" value={student.academic_year ?? "—"} />
            <InfoRow label="Gender" value={student.gender} />
            <InfoRow label="Date of Birth" value={student.date_of_birth} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Email, phone, address</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Email" value={student.email} />
            <InfoRow label="Phone" value={student.phone} />
            <InfoRow label="Address" value={student.address} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guardian Information</CardTitle>
            <CardDescription>Parent/guardian details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Guardian Name" value={student.guardian_name} />
            <InfoRow label="Relationship" value={student.guardian_relationship} />
            <InfoRow label="Guardian Phone" value={student.guardian_phone} />
            <InfoRow label="Guardian Email" value={student.guardian_email} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class Information</CardTitle>
            <CardDescription>Current class and roll</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Class" value={student.class_name ?? "Not assigned"} />
            <InfoRow
              label="Roll Number"
              value={student.roll_number?.toString() ?? "—"}
            />
          </CardContent>
        </Card>
      </div>

      <StudentDocumentsSection studentId={student.id} />

      <StudentFormModal
        open={editOpen}
        onOpenChange={setEditOpen}
        initialData={student}
        classes={classes}
        onSubmit={handleUpdate}
      />
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  if (value == null || value === "") return null;
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  );
}
