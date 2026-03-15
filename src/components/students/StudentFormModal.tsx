"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StudentForm } from "@/components/forms/StudentForm";
import type { Student } from "@/types/student";
import type { ClassItem } from "@/services/classesService";
import type { CreateStudentInput } from "@/types/student";

interface StudentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Student;
  classes: ClassItem[];
  onSubmit: (data: CreateStudentInput) => Promise<void>;
}

export function StudentFormModal({
  open,
  onOpenChange,
  initialData,
  classes,
  onSubmit,
}: StudentFormModalProps) {
  const handleSubmit = async (data: CreateStudentInput) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Student" : "Add Student"}
          </DialogTitle>
        </DialogHeader>
        <StudentForm
          initialData={initialData}
          classes={classes}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel={initialData ? "Save Changes" : "Create Student"}
        />
      </DialogContent>
    </Dialog>
  );
}
